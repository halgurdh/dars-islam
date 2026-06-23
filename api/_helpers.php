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
        'settings' => [
            'brand_name' => $row['brand_name'] ?? $row['name'],
            'brand_tagline' => $row['brand_tagline'],
            'accent_color' => $row['accent_color'] ?? '#ff6b35',
            'logo_url' => $row['logo_url'],
        ],
    ];
}

function require_workspace_role(string $userId, array $allowedRoles = ['owner', 'admin']): array {
    $workspace = get_workspace_for_user($userId);
    if (!in_array($workspace['role'], $allowedRoles, true)) {
        json_error('Forbidden', 403);
    }
    return $workspace;
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
