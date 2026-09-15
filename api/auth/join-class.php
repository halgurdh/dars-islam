<?php
require_once __DIR__ . '/../_helpers.php';

// POST { join_code: string, display_name: string }
// No sign-in required — this IS how a student account gets created. Kids
// join with a class code instead of an email/magic-link.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$body     = body();
$joinCode = strtoupper(trim((string) ($body['join_code'] ?? '')));
$name     = sanitize_display_name((string) ($body['display_name'] ?? ''));

if (!preg_match('/^[A-Z0-9]{6}$/', $joinCode)) json_error('Invalid class code');
if ($name === null) json_error('Please enter a name');

rate_limit_or_fail('join-class-ip', 20, 900);
rate_limit_or_fail('join-class-code', 15, 900, $joinCode);

$db = db();

$stmt = $db->prepare(
    'SELECT c.id, c.name AS class_name, s.name AS school_name
     FROM classes c JOIN schools s ON s.id = c.school_id
     WHERE c.join_code = ?'
);
$stmt->execute([$joinCode]);
$class = $stmt->fetch();
if (!$class) json_error('That class code was not found');

try {
    $db->beginTransaction();

    $userId = uuid();
    $db->prepare("INSERT INTO users (id, email, account_type, role) VALUES (?, NULL, 'consumer', 'student')")
        ->execute([$userId]);

    ensure_profile($userId);
    $db->prepare('UPDATE profiles SET display_name = ? WHERE user_id = ?')->execute([$name, $userId]);

    $db->prepare('INSERT INTO students (user_id, class_id) VALUES (?, ?)')->execute([$userId, $class['id']]);

    $sessionToken = secure_token(32);
    $expiresAt    = date('Y-m-d H:i:s', time() + SESSION_TTL);
    $db->prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)')
        ->execute([$sessionToken, $userId, $expiresAt]);

    $db->commit();
} catch (Throwable $e) {
    $db->rollBack();
    server_error('Could not join the class', 'join-class failed: ' . $e->getMessage());
}

json_out([
    'session_token' => $sessionToken,
    'class_name'    => $class['class_name'],
    'school_name'   => $class['school_name'],
]);
