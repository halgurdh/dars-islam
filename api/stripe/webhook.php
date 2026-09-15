<?php
require_once __DIR__ . '/../_helpers.php';

// Raw body must be read before any output
$payload   = file_get_contents('php://input');
$sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

// ── Verify Stripe signature ───────────────────────────────────────────────────
if (!verify_stripe_signature($payload, $sigHeader, STRIPE_WEBHOOK_SECRET)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

$event = json_decode($payload, true);
$type  = $event['type'] ?? '';
$obj   = $event['data']['object'] ?? [];

$db = db();

switch ($type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
        handle_subscription($db, $obj, $type);
        break;

    case 'customer.subscription.deleted':
        handle_cancellation($db, $obj);
        break;
}

http_response_code(200);
echo json_encode(['received' => true]);
exit;

// ── Handlers ─────────────────────────────────────────────────────────────────

function subscription_grants_access(string $status): bool {
    return in_array($status, ['active', 'trialing', 'past_due'], true);
}

function handle_subscription(PDO $db, array $sub, string $eventType): void {
    $uid        = $sub['metadata']['darsislam_user_id'] ?? ($sub['client_reference_id'] ?? null);
    $customerId = $sub['customer'] ?? null;
    $subId      = $sub['id'] ?? null;
    $status     = $sub['status'] ?? 'unknown';
    $isActive   = subscription_grants_access($status);
    $periodEnd  = isset($sub['current_period_end'])
        ? date('Y-m-d H:i:s', (int) $sub['current_period_end'])
        : null;

    if (!$uid || !$customerId) return;

    // Upsert subscription record
    $db->prepare("
        INSERT INTO stripe_subscriptions
            (id, user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end)
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            current_period_end = VALUES(current_period_end),
            updated_at = NOW()
    ")->execute([uuid(), $uid, $customerId, $subId, $status, $periodEnd]);

    // Update premium_until on profile
    ensure_profile($uid);
    $db->prepare(
        'UPDATE profiles SET premium_until = ?, updated_at = NOW() WHERE user_id = ?'
    )->execute([$periodEnd, $uid]);

    // Grant 500 coin bonus + Dragon card backs on new subscription
    if ($isActive && $eventType === 'customer.subscription.created') {
        $db->prepare(
            'UPDATE profiles SET coins = coins + 500, updated_at = NOW() WHERE user_id = ?'
        )->execute([$uid]);

        $stmt = $db->prepare('SELECT owned_card_backs FROM profiles WHERE user_id = ?');
        $stmt->execute([$uid]);
        $row    = $stmt->fetch(PDO::FETCH_ASSOC);
        $owned  = json_decode($row['owned_card_backs'] ?? '[]', true);
        $dragon = ['cardBack_red1','cardBack_red2','cardBack_red3','cardBack_red4','cardBack_red5'];
        $merged = array_values(array_unique(array_merge($owned, $dragon)));

        $db->prepare(
            'UPDATE profiles SET owned_card_backs = ?, updated_at = NOW() WHERE user_id = ?'
        )->execute([json_encode($merged), $uid]);
    }
}

function handle_cancellation(PDO $db, array $sub): void {
    $subId = $sub['id'] ?? null;
    if (!$subId) return;

    $db->prepare(
        "UPDATE stripe_subscriptions SET status='canceled', current_period_end=NULL, updated_at=NOW()
         WHERE stripe_subscription_id = ?"
    )->execute([$subId]);

    // Get user_id and clear premium
    $stmt = $db->prepare('SELECT user_id FROM stripe_subscriptions WHERE stripe_subscription_id = ?');
    $stmt->execute([$subId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $db->prepare(
            'UPDATE profiles SET premium_until = NULL, updated_at = NOW() WHERE user_id = ?'
        )->execute([$row['user_id']]);
    }
}

// ── Stripe signature verification (no SDK needed) ─────────────────────────────
function verify_stripe_signature(string $payload, string $sigHeader, string $secret): bool {
    if (!$sigHeader) return false;

    // Parse t=timestamp,v1=hash from the Stripe-Signature header
    $parts = [];
    foreach (explode(',', $sigHeader) as $part) {
        [$k, $v] = array_pad(explode('=', $part, 2), 2, '');
        $parts[$k] = $v;
    }

    if (empty($parts['t']) || empty($parts['v1'])) return false;

    $tolerance = 300; // 5 minutes
    if (abs(time() - (int) $parts['t']) > $tolerance) return false;

    $signed    = $parts['t'] . '.' . $payload;
    $expected  = hash_hmac('sha256', $signed, $secret);

    return hash_equals($expected, $parts['v1']);
}
