<?php
require_once __DIR__ . '/_db.php';

// ── CORS + preflight ─────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: ' . SITE_URL);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Session-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Response helpers ─────────────────────────────────────────────────────────
function json_out(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $msg, int $status = 400): never {
    json_out(['error' => $msg], $status);
}

function server_error(string $publicMsg, string $logMsg): never {
    error_log('[minitoon api] ' . $logMsg);
    json_error($publicMsg, 500);
}

function body(): array {
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?? []) : [];
}

function send_text_mail(string $to, string $subject, string $message): bool {
    if (!filter_var(FROM_EMAIL, FILTER_VALIDATE_EMAIL)) {
        error_log('[minitoon api] Invalid FROM_EMAIL configured: ' . FROM_EMAIL);
        return false;
    }

    $headers = implode("\r\n", [
        'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
        'Reply-To: ' . FROM_EMAIL,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion(),
    ]);

    // Shared hosts often require a valid envelope sender on the same domain.
    $extraParams = '-f ' . FROM_EMAIL;
    return mail($to, $subject, $message, $headers, $extraParams);
}

function personal_email_domains(): array {
    return [
        'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com',
        'msn.com', 'yahoo.com', 'ymail.com', 'rocketmail.com', 'icloud.com',
        'me.com', 'mac.com', 'aol.com', 'gmx.com', 'gmx.net', 'proton.me',
        'protonmail.com', 'pm.me', 'zoho.com', 'mail.com', 'yandex.com',
    ];
}

function email_domain(string $email): string {
    $parts = explode('@', strtolower(trim($email)));
    return $parts[1] ?? '';
}

function classify_account_type(string $email): string {
    $domain = email_domain($email);
    if ($domain === '') return 'consumer';
    if (in_array($domain, personal_email_domains(), true)) return 'consumer';
    return 'commercial';
}

function slugify_workspace(string $value): string {
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value);
    $value = trim($value ?? '', '-');
    return $value !== '' ? substr($value, 0, 80) : 'workspace';
}

function title_from_domain(string $domain): string {
    $label = explode('.', $domain)[0] ?? 'Studio';
    $label = preg_replace('/[^a-z0-9]+/i', ' ', $label);
    $label = trim($label ?? '');
    return $label !== '' ? ucwords($label) : 'Studio';
}

function workspace_name_for_email(string $email, string $accountType): string {
    $domain = email_domain($email);
    if ($accountType === 'commercial' && $domain !== '') {
        return title_from_domain($domain) . ' Studio';
    }
    $local = explode('@', strtolower(trim($email)))[0] ?? 'player';
    $local = preg_replace('/[^a-z0-9]+/i', ' ', $local);
    $local = trim($local ?? '');
    $local = $local !== '' ? ucwords($local) : 'Personal';
    return $local . ' Studio';
}

function unique_workspace_slug(PDO $db, string $base): string {
    $slug = slugify_workspace($base);
    $try = $slug;
    $i = 2;
    $stmt = $db->prepare('SELECT 1 FROM organizations WHERE slug = ? LIMIT 1');
    while (true) {
        $stmt->execute([$try]);
        if (!$stmt->fetch()) return $try;
        $suffix = '-' . $i;
        $try = substr($slug, 0, max(1, 120 - strlen($suffix))) . $suffix;
        $i++;
    }
}

function plan_limits(string $planKey): array {
    return match ($planKey) {
        'studio' => [
            'members' => 50,
            'games' => 5,
            'private_rooms' => 100,
        ],
        default => [
            'members' => 3,
            'games' => 1,
            'private_rooms' => 10,
        ],
    };
}

function workspace_usage(PDO $db, string $workspaceId): array {
    $memberStmt = $db->prepare('SELECT COUNT(*) FROM organization_members WHERE organization_id = ?');
    $memberStmt->execute([$workspaceId]);
    return [
        'members' => (int) $memberStmt->fetchColumn(),
    ];
}

// ── Session auth ─────────────────────────────────────────────────────────────
function require_session(): array {
    $token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? '';
    if (!$token) json_error('Unauthorized', 401);

    $stmt = db()->prepare(
        'SELECT s.user_id, u.email, u.account_type, u.active_organization_id FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([$token]);
    $row = $stmt->fetch();
    if (!$row) json_error('Unauthorized', 401);

    return $row; // ['user_id' => ..., 'email' => ...]
}

// ── Profile helpers ──────────────────────────────────────────────────────────
function ensure_profile(string $user_id): void {
    $db = db();
    $exists = $db->prepare('SELECT 1 FROM profiles WHERE user_id = ?');
    $exists->execute([$user_id]);
    if (!$exists->fetch()) {
        $db->prepare(
            "INSERT INTO profiles (user_id, owned_card_backs)
             VALUES (?, JSON_ARRAY('cardBack_blue1'))"
        )->execute([$user_id]);
    }
}

function ensure_workspace_for_user(string $userId, string $email): array {
    $db = db();
    $accountType = classify_account_type($email);

    $db->prepare('UPDATE users SET account_type = ? WHERE id = ?')->execute([$accountType, $userId]);

    $stmt = $db->prepare(
        'SELECT o.id
         FROM organizations o
         JOIN organization_members om ON om.organization_id = o.id
         WHERE om.user_id = ?
         ORDER BY CASE WHEN o.owner_user_id = ? THEN 0 ELSE 1 END, o.created_at ASC
         LIMIT 1'
    );
    $stmt->execute([$userId, $userId]);
    $existingOrg = $stmt->fetchColumn();

    if ($existingOrg) {
        $db->prepare('UPDATE users SET active_organization_id = ? WHERE id = ?')->execute([$existingOrg, $userId]);
        return get_workspace_for_user($userId);
    }

    $name = workspace_name_for_email($email, $accountType);
    $domain = email_domain($email);
    $isPersonal = $accountType === 'consumer' ? 1 : 0;
    $slugBase = $accountType === 'commercial' && $domain !== '' ? $domain : $name;
    $orgId = uuid();
    $slug = unique_workspace_slug($db, $slugBase);

    $db->prepare(
        'INSERT INTO organizations (id, owner_user_id, name, slug, account_type, email_domain, plan_key, is_personal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$orgId, $userId, $name, $slug, $accountType, $domain !== '' ? $domain : null, 'free', $isPersonal]);

    $db->prepare(
        'INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)'
    )->execute([$orgId, $userId, 'owner']);

    $db->prepare(
        'INSERT INTO workspace_settings (organization_id, brand_name, brand_tagline, accent_color, logo_url)
         VALUES (?, ?, ?, ?, ?)'
    )->execute([
        $orgId,
        $name,
        $accountType === 'commercial' ? 'Private multiplayer hub for your team.' : 'Your personal Minitoon workspace.',
        '#ff6b35',
        null,
    ]);

    $db->prepare('UPDATE users SET active_organization_id = ? WHERE id = ?')->execute([$orgId, $userId]);
    return get_workspace_for_user($userId);
}

function workspace_summary_from_row(PDO $db, array $row): array {
    $limits = plan_limits($row['plan_key']);
    $usage = workspace_usage($db, $row['id']);
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'slug' => $row['slug'],
        'plan_key' => $row['plan_key'],
        'account_type' => $row['workspace_account_type'],
        'email_domain' => $row['email_domain'],
        'is_personal' => (bool) $row['is_personal'],
        'role' => $row['role'] ?? 'member',
        'member_count' => (int) $row['member_count'],
        'limits' => $limits,
        'usage' => $usage,
        'settings' => [
            'brand_name' => $row['brand_name'] ?? $row['name'],
            'brand_tagline' => $row['brand_tagline'],
            'accent_color' => $row['accent_color'] ?? '#ff6b35',
            'logo_url' => $row['logo_url'],
        ],
    ];
}

function get_workspace_for_user(string $userId): array {
    $db = db();
    $stmt = $db->prepare(
        'SELECT
            u.account_type,
            u.active_organization_id,
            o.id,
            o.name,
            o.slug,
            o.plan_key,
            o.account_type AS workspace_account_type,
            o.email_domain,
            o.is_personal,
            om.role,
            ws.brand_name,
            ws.brand_tagline,
            ws.accent_color,
            ws.logo_url,
            (SELECT COUNT(*) FROM organization_members om2 WHERE om2.organization_id = o.id) AS member_count
         FROM users u
         LEFT JOIN organizations o ON o.id = u.active_organization_id
         LEFT JOIN organization_members om ON om.organization_id = o.id AND om.user_id = u.id
         LEFT JOIN workspace_settings ws ON ws.organization_id = o.id
         WHERE u.id = ?
         LIMIT 1'
    );
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    if (!$row || !$row['id']) {
        json_error('Workspace not found', 500);
    }

    return workspace_summary_from_row($db, $row);
}

function require_workspace_role(string $userId, array $allowedRoles = ['owner', 'admin']): array {
    $workspace = get_workspace_for_user($userId);
    if (!in_array($workspace['role'], $allowedRoles, true)) {
        json_error('Forbidden', 403);
    }
    return $workspace;
}

function list_workspaces_for_user(string $userId): array {
    $db = db();
    $stmt = $db->prepare(
        'SELECT
            o.id,
            o.name,
            o.slug,
            o.plan_key,
            o.account_type AS workspace_account_type,
            o.email_domain,
            o.is_personal,
            om.role,
            ws.brand_name,
            ws.brand_tagline,
            ws.accent_color,
            ws.logo_url,
            (SELECT COUNT(*) FROM organization_members om2 WHERE om2.organization_id = o.id) AS member_count
         FROM organization_members om
         JOIN organizations o ON o.id = om.organization_id
         LEFT JOIN workspace_settings ws ON ws.organization_id = o.id
         WHERE om.user_id = ?
         ORDER BY CASE WHEN om.role = \'owner\' THEN 0 WHEN om.role = \'admin\' THEN 1 ELSE 2 END, o.created_at ASC'
    );
    $stmt->execute([$userId]);
    return array_map(fn($row) => workspace_summary_from_row($db, $row), $stmt->fetchAll());
}

function switch_workspace_for_user(string $userId, string $workspaceId): array {
    $db = db();
    $stmt = $db->prepare(
        'SELECT 1 FROM organization_members WHERE organization_id = ? AND user_id = ? LIMIT 1'
    );
    $stmt->execute([$workspaceId, $userId]);
    if (!$stmt->fetch()) {
        json_error('Workspace not found', 404);
    }
    $db->prepare('UPDATE users SET active_organization_id = ? WHERE id = ?')->execute([$workspaceId, $userId]);
    return get_workspace_for_user($userId);
}

function list_workspace_members(string $workspaceId): array {
    $stmt = db()->prepare(
        'SELECT u.id, u.email, u.account_type, om.role, om.created_at
         FROM organization_members om
         JOIN users u ON u.id = om.user_id
         WHERE om.organization_id = ?
         ORDER BY CASE WHEN om.role = \'owner\' THEN 0 WHEN om.role = \'admin\' THEN 1 ELSE 2 END, om.created_at ASC'
    );
    $stmt->execute([$workspaceId]);
    return array_map(static function (array $row): array {
        return [
            'user_id' => $row['id'],
            'email' => $row['email'],
            'account_type' => $row['account_type'],
            'role' => $row['role'],
            'created_at' => $row['created_at'],
        ];
    }, $stmt->fetchAll());
}

function list_workspace_invites(string $workspaceId): array {
    $stmt = db()->prepare(
        'SELECT id, email, role, token, expires_at, revoked_at, accepted_at, created_at
         FROM organization_invites
         WHERE organization_id = ? AND revoked_at IS NULL AND accepted_at IS NULL AND expires_at > NOW()
         ORDER BY created_at DESC'
    );
    $stmt->execute([$workspaceId]);
    return array_map(static function (array $row): array {
        return [
            'id' => $row['id'],
            'email' => $row['email'],
            'role' => $row['role'],
            'token' => $row['token'],
            'expires_at' => $row['expires_at'],
            'created_at' => $row['created_at'],
        ];
    }, $stmt->fetchAll());
}

function assert_workspace_member_capacity(array $workspace): void {
    $limit = (int) ($workspace['limits']['members'] ?? 0);
    $usage = (int) ($workspace['usage']['members'] ?? 0);
    if ($limit > 0 && $usage >= $limit) {
        json_error('Workspace member limit reached for this plan', 409);
    }
}

function create_workspace_invite(string $workspaceId, string $inviterUserId, string $email, string $role = 'member'): array {
    $db = db();
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Invalid invite email');
    }
    if (!in_array($role, ['admin', 'member'], true)) {
        $role = 'member';
    }

    $workspace = get_workspace_for_user($inviterUserId);
    if ($workspace['id'] !== $workspaceId) {
        $workspace = switch_workspace_for_user($inviterUserId, $workspaceId);
    }
    assert_workspace_member_capacity($workspace);

    $existingMember = $db->prepare(
        'SELECT 1 FROM organization_members om
         JOIN users u ON u.id = om.user_id
         WHERE om.organization_id = ? AND u.email = ? LIMIT 1'
    );
    $existingMember->execute([$workspaceId, $email]);
    if ($existingMember->fetch()) {
        json_error('That email is already a member of this workspace', 409);
    }

    $db->prepare(
        'UPDATE organization_invites SET revoked_at = NOW()
         WHERE organization_id = ? AND email = ? AND accepted_at IS NULL AND revoked_at IS NULL'
    )->execute([$workspaceId, $email]);

    $invite = [
        'id' => uuid(),
        'token' => secure_token(32),
        'email' => $email,
        'role' => $role,
        'expires_at' => date('Y-m-d H:i:s', time() + 7 * 24 * 3600),
    ];

    $db->prepare(
        'INSERT INTO organization_invites (id, organization_id, email, token, role, invited_by_user_id, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([$invite['id'], $workspaceId, $email, $invite['token'], $role, $inviterUserId, $invite['expires_at']]);

    return $invite;
}

function revoke_workspace_invite(string $workspaceId, string $inviteId): void {
    db()->prepare(
        'UPDATE organization_invites SET revoked_at = NOW()
         WHERE id = ? AND organization_id = ? AND accepted_at IS NULL AND revoked_at IS NULL'
    )->execute([$inviteId, $workspaceId]);
}

function accept_pending_invites_for_user(string $userId, string $email): void {
    $db = db();
    $email = strtolower(trim($email));
    $stmt = $db->prepare(
        'SELECT * FROM organization_invites
         WHERE email = ? AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()
         ORDER BY created_at ASC'
    );
    $stmt->execute([$email]);
    $invites = $stmt->fetchAll();
    foreach ($invites as $invite) {
        $memberExists = $db->prepare(
            'SELECT 1 FROM organization_members WHERE organization_id = ? AND user_id = ? LIMIT 1'
        );
        $memberExists->execute([$invite['organization_id'], $userId]);
        if (!$memberExists->fetch()) {
            $db->prepare(
                'INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)'
            )->execute([$invite['organization_id'], $userId, $invite['role']]);
        }
        $db->prepare(
            'UPDATE organization_invites SET accepted_by_user_id = ?, accepted_at = NOW() WHERE id = ?'
        )->execute([$userId, $invite['id']]);
    }
}

function accept_invite_token_for_user(string $userId, string $token): array {
    $db = db();
    $stmt = $db->prepare(
        'SELECT * FROM organization_invites
         WHERE token = ? AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > NOW()
         LIMIT 1'
    );
    $stmt->execute([$token]);
    $invite = $stmt->fetch();
    if (!$invite) {
        json_error('Invite is invalid or expired', 404);
    }

    $memberExists = $db->prepare(
        'SELECT 1 FROM organization_members WHERE organization_id = ? AND user_id = ? LIMIT 1'
    );
    $memberExists->execute([$invite['organization_id'], $userId]);
    if (!$memberExists->fetch()) {
        $db->prepare(
            'INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)'
        )->execute([$invite['organization_id'], $userId, $invite['role']]);
    }

    $db->prepare(
        'UPDATE organization_invites SET accepted_by_user_id = ?, accepted_at = NOW() WHERE id = ?'
    )->execute([$userId, $invite['id']]);

    return switch_workspace_for_user($userId, $invite['organization_id']);
}

function get_profile(string $user_id): array {
    ensure_profile($user_id);
    $stmt = db()->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$user_id]);
    $row = $stmt->fetch();
    $row['owned_card_backs'] = json_decode($row['owned_card_backs'], true);
    $row['premium_active']   = $row['premium_until'] && strtotime($row['premium_until']) > time();
    return $row;
}
