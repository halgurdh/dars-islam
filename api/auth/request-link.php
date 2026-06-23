<?php
require_once __DIR__ . '/../_helpers.php';

// POST { email: string }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$body  = body();
$email = strtolower(trim($body['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) json_error('Invalid email');

rate_limit_or_fail('auth-request-link-ip', 10, 900);
rate_limit_or_fail('auth-request-link-email', 5, 900, $email);

try {
    $db = db();
    $accountType = classify_account_type($email);

    // Get or create user
    $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        $id = uuid();
        $db->prepare('INSERT INTO users (id, email, account_type) VALUES (?, ?, ?)')
            ->execute([$id, $email, $accountType]);
        $user = ['id' => $id];
    } else {
        $db->prepare('UPDATE users SET account_type = ? WHERE id = ?')->execute([$accountType, $user['id']]);
    }

    // Delete any existing unused tokens for this user
    $db->prepare('DELETE FROM auth_tokens WHERE user_id = ? AND used = 0')->execute([$user['id']]);

    // Create magic link token
    $token     = secure_token(32);
    $expiresAt = date('Y-m-d H:i:s', time() + AUTH_TOKEN_TTL);
    $db->prepare(
        'INSERT INTO auth_tokens (token, user_id, expires_at) VALUES (?, ?, ?)'
    )->execute([$token, $user['id'], $expiresAt]);
} catch (Throwable $e) {
    server_error('Failed to create sign-in link', 'request-link setup failed: ' . $e->getMessage());
}

// Build magic link
$link = SITE_URL . '/api/auth/verify.php?token=' . urlencode($token);

// Send email
$subject = 'Your Minitoon Games sign-in link';
$message = "Hi!\n\nClick the link below to sign in to Minitoon Games:\n\n$link\n\nThis link expires in 1 hour and can only be used once.\n\nIf you didn't request this, ignore this email.\n\nMinitoon Games";
$sent = send_text_mail($email, $subject, $message);
if (!$sent) {
    if (defined('AUTH_DEBUG_RETURN_LINK_ON_MAIL_FAIL') && AUTH_DEBUG_RETURN_LINK_ON_MAIL_FAIL) {
        json_out([
            'ok' => false,
            'debug_mail_failed' => true,
            'magic_link' => $link,
        ], 200);
    }
    server_error(
        'Failed to send email — check server mail config',
        'mail() returned false for magic link request to ' . $email
    );
}

json_out(['ok' => true]);
