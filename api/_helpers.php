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
    error_log('[darsislam api] ' . $logMsg);
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
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'darsislam-rate-limit';
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
        error_log('[darsislam api] Invalid FROM_EMAIL configured: ' . FROM_EMAIL);
        return false;
    }

    $headers = implode("\r\n", [
        'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
        'Reply-To: ' . FROM_EMAIL,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'X-Mailer: PHP/' . phpversion(),
    ]);

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

function is_hex_token(string $value, int $bytes = 32): bool {
    return (bool) preg_match('/^[a-f0-9]{' . ($bytes * 2) . '}$/', strtolower(trim($value)));
}

function require_session(): array {
    $token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? '';
    if (!$token) json_error('Unauthorized', 401);

    $stmt = db()->prepare(
        'SELECT s.user_id, u.email, u.account_type, u.role
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token = ? AND s.expires_at > NOW()'
    );
    $stmt->execute([$token]);
    $row = $stmt->fetch();
    if (!$row) json_error('Unauthorized', 401);

    return $row;
}

// Leaderboard/roster-safe: letters, numbers, spaces and a few marks only.
// Shared by profile/update.php (player renaming themselves) and
// auth/join-class.php (a student picking a name when they join a class).
function sanitize_display_name(?string $value): ?string {
    if ($value === null) return null;
    $clean = trim(preg_replace('/[^\p{L}\p{N} _.\'-]/u', '', $value));
    $clean = mb_substr($clean, 0, 24);
    return $clean !== '' ? $clean : null;
}

// Short, human-typeable codes for class/school invites — excludes visually
// ambiguous characters (0/O, 1/I/L) since kids type these on a keyboard.
function random_code(int $len): string {
    $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $code = '';
    for ($i = 0; $i < $len; $i++) {
        $code .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    return $code;
}

// Generates a random_code() and retries on the rare unique-constraint
// collision. $exists must return true if that code is already taken.
function unique_code(int $len, callable $exists): string {
    for ($attempt = 0; $attempt < 20; $attempt++) {
        $code = random_code($len);
        if (!$exists($code)) return $code;
    }
    server_error('Could not generate a unique code', 'unique_code() exhausted retries');
}

// Promotes a player to teacher the first time they create/join a school.
// One-way: a teacher who stops teaching keeps the role (no downgrade path
// needed yet, and it's harmless — it only gates the dashboard link).
function promote_to_teacher(string $userId): void {
    db()->prepare("UPDATE users SET role = 'teacher' WHERE id = ? AND role = 'player'")
        ->execute([$userId]);
}

function ensure_profile(string $userId): void {
    $db = db();
    $exists = $db->prepare('SELECT 1 FROM profiles WHERE user_id = ?');
    $exists->execute([$userId]);
    if (!$exists->fetch()) {
        $db->prepare(
            "INSERT INTO profiles (user_id, owned_card_backs, badges)
             VALUES (?, JSON_ARRAY('cardBack_blue1'), JSON_ARRAY())"
        )->execute([$userId]);
    }
}

function get_profile(string $userId): array {
    ensure_profile($userId);
    $stmt = db()->prepare('SELECT * FROM profiles WHERE user_id = ?');
    $stmt->execute([$userId]);
    $row = $stmt->fetch();
    $row['owned_card_backs'] = json_decode($row['owned_card_backs'], true);
    $row['badges'] = json_decode($row['badges'] ?? '[]', true) ?? [];
    $row['premium_active'] = $row['premium_until'] && strtotime($row['premium_until']) > time();
    return $row;
}
