<?php
require_once __DIR__ . '/_db.php';

// ── CORS + preflight ─────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: ' . SITE_URL);
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Session-Token');
header('X-Robots-Tag: noindex, nofollow, noarchive');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

enforce_same_origin_for_browser_requests();

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

function enforce_same_origin_for_browser_requests(): void {
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
        return;
    }

    $siteHost = parse_url(SITE_URL, PHP_URL_HOST) ?: '';
    $siteScheme = parse_url(SITE_URL, PHP_URL_SCHEME) ?: 'https';
    $siteOrigin = $siteScheme . '://' . $siteHost;
    $origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
    $fetchSite = strtolower(trim((string) ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '')));

    if ($origin !== '') {
        $originHost = parse_url($origin, PHP_URL_HOST) ?: '';
        $originScheme = parse_url($origin, PHP_URL_SCHEME) ?: '';
        if ($originHost !== $siteHost || $originScheme !== $siteScheme) {
            json_error('Forbidden origin', 403);
        }
    }

    if ($fetchSite !== '' && !in_array($fetchSite, ['same-origin', 'same-site', 'none'], true)) {
        json_error('Cross-site request blocked', 403);
    }

    header('Access-Control-Allow-Origin: ' . ($origin !== '' ? $origin : $siteOrigin));
}

function client_ip(): string {
    $remote = trim((string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    return $remote !== '' ? $remote : 'unknown';
}

function rate_limit_or_fail(string $bucket, int $limit, int $windowSeconds, ?string $subject = null): void {
    $subject = $subject !== null && $subject !== '' ? strtolower(trim($subject)) : client_ip();
    $key = hash('sha256', $bucket . '|' . $subject);
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'minitoon-rate-limit';
    if (!is_dir($dir) && !@mkdir($dir, 0775, true) && !is_dir($dir)) {
        return;
    }

    $path = $dir . DIRECTORY_SEPARATOR . $key . '.json';
    $now = time();
    $state = ['started_at' => $now, 'count' => 0];

    $fh = @fopen($path, 'c+');
    if ($fh === false) {
        return;
    }

    try {
        if (!flock($fh, LOCK_EX)) {
            return;
        }

        $raw = stream_get_contents($fh);
        if (is_string($raw) && $raw !== '') {
            $decoded = json_decode($raw, true);
            if (is_array($decoded)) {
                $state = array_merge($state, $decoded);
            }
        }

        if (($now - (int) ($state['started_at'] ?? $now)) >= $windowSeconds) {
            $state = ['started_at' => $now, 'count' => 0];
        }

        $state['count'] = (int) ($state['count'] ?? 0) + 1;
        if ($state['count'] > $limit) {
            header('Retry-After: ' . max(1, $windowSeconds - ($now - (int) $state['started_at'])));
            json_error('Too many requests. Please try again later.', 429);
        }

        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($state, JSON_UNESCAPED_UNICODE));
        fflush($fh);
        flock($fh, LOCK_UN);
    } finally {
        fclose($fh);
    }
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

function is_hex_token(string $value, int $bytes = 32): bool {
    return (bool) preg_match('/^[a-f0-9]{' . ($bytes * 2) . '}$/', strtolower(trim($value)));
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

function log_workspace_activity(
    string $workspaceId,
    ?string $actorUserId,
    string $actionKey,
    string $message,
    ?string $targetType = null,
    ?string $targetId = null,
    ?array $metadata = null,
): void {
    db()->prepare(
        'INSERT INTO organization_activity_logs
         (id, organization_id, actor_user_id, action_key, target_type, target_id, message, metadata_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        uuid(),
        $workspaceId,
        $actorUserId,
        $actionKey,
        $targetType,
        $targetId,
        substr($message, 0, 255),
        $metadata ? json_encode($metadata, JSON_UNESCAPED_UNICODE) : null,
    ]);
}

function list_workspace_activity(string $workspaceId, int $limit = 40): array {
    $stmt = db()->prepare(
        'SELECT l.id, l.action_key, l.target_type, l.target_id, l.message, l.metadata_json, l.created_at, u.email AS actor_email
         FROM organization_activity_logs l
         LEFT JOIN users u ON u.id = l.actor_user_id
         WHERE l.organization_id = ?
         ORDER BY l.created_at DESC
         LIMIT ' . max(1, min(200, $limit))
    );
    $stmt->execute([$workspaceId]);
    return array_map(static function (array $row): array {
        return [
            'id' => $row['id'],
            'action_key' => $row['action_key'],
            'target_type' => $row['target_type'],
            'target_id' => $row['target_id'],
            'message' => $row['message'],
            'metadata' => $row['metadata_json'] ? json_decode($row['metadata_json'], true) : null,
            'created_at' => $row['created_at'],
            'actor_email' => $row['actor_email'],
        ];
    }, $stmt->fetchAll());
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
    log_workspace_activity($orgId, $userId, 'workspace.auto_created', 'Workspace created automatically on sign-in', 'workspace', $orgId);
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
        'is_archived' => !empty($row['archived_at']),
        'archived_at' => $row['archived_at'] ?? null,
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
            o.archived_at,
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
            o.archived_at,
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
        'SELECT o.archived_at
         FROM organization_members om
         JOIN organizations o ON o.id = om.organization_id
         WHERE om.organization_id = ? AND om.user_id = ?
         LIMIT 1'
    );
    $stmt->execute([$workspaceId, $userId]);
    $row = $stmt->fetch();
    if (!$row) {
        json_error('Workspace not found', 404);
    }
    if (!empty($row['archived_at'])) {
        json_error('Workspace is archived', 409);
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

function create_workspace_for_user(string $userId, string $email, string $name, bool $switchToNew = true): array {
    $db = db();
    $name = trim($name);
    if ($name === '') {
        $name = workspace_name_for_email($email, classify_account_type($email));
    }
    $name = substr($name, 0, 120);
    $accountType = classify_account_type($email);
    $domain = email_domain($email);
    $slug = unique_workspace_slug($db, $name);
    $orgId = uuid();

    $db->prepare(
        'INSERT INTO organizations (id, owner_user_id, name, slug, account_type, email_domain, plan_key, is_personal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute([$orgId, $userId, $name, $slug, $accountType, $domain !== '' ? $domain : null, 'free', 0]);

    $db->prepare(
        'INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)'
    )->execute([$orgId, $userId, 'owner']);

    $db->prepare(
        'INSERT INTO workspace_settings (organization_id, brand_name, brand_tagline, accent_color, logo_url)
         VALUES (?, ?, ?, ?, ?)'
    )->execute([$orgId, $name, 'A private Minitoon workspace.', '#ff6b35', null]);

    if ($switchToNew) {
        $db->prepare('UPDATE users SET active_organization_id = ? WHERE id = ?')->execute([$orgId, $userId]);
    }

    log_workspace_activity($orgId, $userId, 'workspace.created', 'Workspace created', 'workspace', $orgId, [
        'name' => $name,
    ]);

    return get_workspace_for_user($userId);
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

    log_workspace_activity($workspaceId, $inviterUserId, 'invite.created', 'Invite created for ' . $email, 'invite', $invite['id'], [
        'email' => $email,
        'role' => $role,
    ]);

    return $invite;
}

function revoke_workspace_invite(string $workspaceId, string $inviteId): void {
    db()->prepare(
        'UPDATE organization_invites SET revoked_at = NOW()
         WHERE id = ? AND organization_id = ? AND accepted_at IS NULL AND revoked_at IS NULL'
    )->execute([$inviteId, $workspaceId]);
    log_workspace_activity($workspaceId, null, 'invite.revoked', 'Invite revoked', 'invite', $inviteId);
}

function send_workspace_invite_email(string $recipientEmail, string $inviteUrl, string $workspaceName, string $role): bool {
    $subject = 'You are invited to join ' . $workspaceName;
    $message = "Hi!\n\nYou have been invited to join the workspace \"" . $workspaceName . "\" as " . $role . ".\n\nOpen this link to accept the invite:\n\n" . $inviteUrl . "\n\nIf you are not signed in yet, sign in first and the invite will be accepted automatically.\n\nMinitoon Games";
    return send_text_mail($recipientEmail, $subject, $message);
}

function get_workspace_member(string $workspaceId, string $memberUserId): ?array {
    $stmt = db()->prepare(
        'SELECT u.id, u.email, u.account_type, om.role, om.created_at
         FROM organization_members om
         JOIN users u ON u.id = om.user_id
         WHERE om.organization_id = ? AND om.user_id = ?
         LIMIT 1'
    );
    $stmt->execute([$workspaceId, $memberUserId]);
    $row = $stmt->fetch();
    if (!$row) return null;
    return [
        'user_id' => $row['id'],
        'email' => $row['email'],
        'account_type' => $row['account_type'],
        'role' => $row['role'],
        'created_at' => $row['created_at'],
    ];
}

function update_workspace_member_role(string $actingUserId, string $workspaceId, string $memberUserId, string $newRole): void {
    $workspace = require_workspace_role($actingUserId, ['owner', 'admin']);
    if (!in_array($newRole, ['admin', 'member'], true)) {
        json_error('Invalid role');
    }

    $target = get_workspace_member($workspaceId, $memberUserId);
    if (!$target) {
        json_error('Member not found', 404);
    }
    if ($target['role'] === 'owner') {
        json_error('Owner role cannot be changed', 409);
    }
    if ($workspace['role'] === 'admin' && $target['role'] !== 'member') {
        json_error('Admins can only manage members', 403);
    }

    db()->prepare(
        'UPDATE organization_members SET role = ? WHERE organization_id = ? AND user_id = ?'
    )->execute([$newRole, $workspaceId, $memberUserId]);
    log_workspace_activity($workspaceId, $actingUserId, 'member.role_updated', 'Member role updated', 'user', $memberUserId, [
        'role' => $newRole,
    ]);
}

function remove_workspace_member(string $actingUserId, string $workspaceId, string $memberUserId): void {
    $workspace = require_workspace_role($actingUserId, ['owner', 'admin']);
    $target = get_workspace_member($workspaceId, $memberUserId);
    if (!$target) {
        json_error('Member not found', 404);
    }
    if ($memberUserId === $actingUserId) {
        json_error('Use leave-workspace instead of removing yourself', 409);
    }
    if ($target['role'] === 'owner') {
        json_error('Owner cannot be removed', 409);
    }
    if ($workspace['role'] === 'admin' && $target['role'] !== 'member') {
        json_error('Admins can only remove members', 403);
    }

    db()->prepare(
        'DELETE FROM organization_members WHERE organization_id = ? AND user_id = ?'
    )->execute([$workspaceId, $memberUserId]);
    log_workspace_activity($workspaceId, $actingUserId, 'member.removed', 'Member removed from workspace', 'user', $memberUserId);
}

function transfer_workspace_owner(string $actingUserId, string $workspaceId, string $newOwnerUserId): void {
    $workspace = require_workspace_role($actingUserId, ['owner']);
    if ($workspace['id'] !== $workspaceId) {
        $workspace = switch_workspace_for_user($actingUserId, $workspaceId);
    }

    $target = get_workspace_member($workspaceId, $newOwnerUserId);
    if (!$target) {
        json_error('Target member not found', 404);
    }
    if ($target['role'] === 'owner') {
        return;
    }

    $db = db();
    $db->prepare('UPDATE organization_members SET role = ? WHERE organization_id = ? AND user_id = ?')
        ->execute(['admin', $workspaceId, $actingUserId]);
    $db->prepare('UPDATE organization_members SET role = ? WHERE organization_id = ? AND user_id = ?')
        ->execute(['owner', $workspaceId, $newOwnerUserId]);
    $db->prepare('UPDATE organizations SET owner_user_id = ?, updated_at = NOW() WHERE id = ?')
        ->execute([$newOwnerUserId, $workspaceId]);
    log_workspace_activity($workspaceId, $actingUserId, 'workspace.owner_transferred', 'Workspace ownership transferred', 'user', $newOwnerUserId);
}

function leave_workspace(string $userId, string $email, string $workspaceId): array {
    $db = db();
    $target = get_workspace_member($workspaceId, $userId);
    if (!$target) {
      json_error('You are not a member of that workspace', 404);
    }
    if ($target['role'] === 'owner') {
      json_error('Transfer ownership before leaving this workspace', 409);
    }

    $db->prepare('DELETE FROM organization_members WHERE organization_id = ? AND user_id = ?')
      ->execute([$workspaceId, $userId]);
    log_workspace_activity($workspaceId, $userId, 'workspace.left', 'Member left workspace', 'user', $userId);

    $remaining = list_workspaces_for_user($userId);
    if (count($remaining) === 0) {
        $created = create_workspace_for_user($userId, $email, 'New Workspace', true);
        return $created;
    }

    $nextWorkspaceId = $remaining[0]['id'];
    $db->prepare('UPDATE users SET active_organization_id = ? WHERE id = ?')->execute([$nextWorkspaceId, $userId]);
    return get_workspace_for_user($userId);
}

function archive_workspace(string $actingUserId, string $workspaceId): array {
    require_workspace_role($actingUserId, ['owner']);
    $db = db();
    $db->prepare('UPDATE organizations SET archived_at = NOW(), updated_at = NOW() WHERE id = ?')
      ->execute([$workspaceId]);
    log_workspace_activity($workspaceId, $actingUserId, 'workspace.archived', 'Workspace archived', 'workspace', $workspaceId);

    $remaining = list_workspaces_for_user($actingUserId);
    foreach ($remaining as $candidate) {
        if ($candidate['id'] !== $workspaceId && !$candidate['is_archived']) {
            $db->prepare('UPDATE users SET active_organization_id = ? WHERE id = ?')->execute([$candidate['id'], $actingUserId]);
            return get_workspace_for_user($actingUserId);
        }
    }

    $emailStmt = $db->prepare('SELECT email FROM users WHERE id = ?');
    $emailStmt->execute([$actingUserId]);
    $email = (string) ($emailStmt->fetchColumn() ?: '');
    return create_workspace_for_user($actingUserId, $email, 'New Workspace', true);
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
        log_workspace_activity($invite['organization_id'], $userId, 'invite.accepted', 'Invite accepted', 'invite', $invite['id'], [
            'email' => $email,
        ]);
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
    log_workspace_activity($invite['organization_id'], $userId, 'invite.accepted', 'Invite accepted via token', 'invite', $invite['id']);

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
