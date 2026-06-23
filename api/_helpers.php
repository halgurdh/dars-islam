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

function body(): array {
    $raw = file_get_contents('php://input');
    return $raw ? (json_decode($raw, true) ?? []) : [];
}

// ── Session auth ─────────────────────────────────────────────────────────────
function require_session(): array {
    $token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? '';
    if (!$token) json_error('Unauthorized', 401);

    $stmt = db()->prepare(
        'SELECT s.user_id, u.email FROM sessions s
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
             VALUES (?, JSON_ARRAY('cardBack_blue2'))"
        )->execute([$user_id]);
    }
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
