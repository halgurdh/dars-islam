<?php
require_once __DIR__ . '/../_helpers.php';

// GET ?token=XXX
// Validates the magic link token, creates a session, redirects to the site.

$token = $_GET['token'] ?? '';
if (!$token) {
    header('Location: ' . SITE_URL . '/?auth_error=missing_token');
    exit;
}

$db   = db();
$stmt = $db->prepare(
    'SELECT at.user_id FROM auth_tokens at
     WHERE at.token = ? AND at.used = 0 AND at.expires_at > NOW()'
);
$stmt->execute([$token]);
$row = $stmt->fetch();

if (!$row) {
    header('Location: ' . SITE_URL . '/?auth_error=invalid_token');
    exit;
}

// Mark token as used
$db->prepare('UPDATE auth_tokens SET used = 1 WHERE token = ?')->execute([$token]);

// Create session
$sessionToken = secure_token(32);
$expiresAt    = date('Y-m-d H:i:s', time() + SESSION_TTL);
$db->prepare(
    'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)'
)->execute([$sessionToken, $row['user_id'], $expiresAt]);

// Ensure profile row exists
ensure_profile($row['user_id']);
$emailStmt = $db->prepare('SELECT email FROM users WHERE id = ?');
$emailStmt->execute([$row['user_id']]);
$user = $emailStmt->fetch();
ensure_workspace_for_user($row['user_id'], $user['email'] ?? '');
accept_pending_invites_for_user($row['user_id'], $user['email'] ?? '');

// Redirect back to site — JS will pick up mt_session and store it
header('Location: ' . SITE_URL . '/?mt_session=' . urlencode($sessionToken));
exit;
