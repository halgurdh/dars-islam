<?php
require_once __DIR__ . '/../_helpers.php';

// POST { email: string }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$body  = body();
$email = strtolower(trim($body['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Invalid email');

$db = db();

// Get or create user
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    $id = uuid();
    $db->prepare('INSERT INTO users (id, email) VALUES (?, ?)')->execute([$id, $email]);
    $user = ['id' => $id];
}

// Delete any existing unused tokens for this user
$db->prepare('DELETE FROM auth_tokens WHERE user_id = ? AND used = 0')->execute([$user['id']]);

// Create magic link token
$token     = secure_token(32);
$expiresAt = date('Y-m-d H:i:s', time() + AUTH_TOKEN_TTL);
$db->prepare(
    'INSERT INTO auth_tokens (token, user_id, expires_at) VALUES (?, ?, ?)'
)->execute([$token, $user['id'], $expiresAt]);

// Build magic link
$link = SITE_URL . '/api/auth/verify.php?token=' . urlencode($token);

// Send email
$subject = 'Your Minitoon Games sign-in link';
$message = "Hi!\n\nClick the link below to sign in to Minitoon Games:\n\n$link\n\nThis link expires in 1 hour and can only be used once.\n\nIf you didn't request this, ignore this email.\n\nMinitoon Games";
$headers = implode("\r\n", [
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion(),
]);

$sent = mail($email, $subject, $message, $headers);
if (!$sent) json_error('Failed to send email — check server mail config', 500);

json_out(['ok' => true]);
