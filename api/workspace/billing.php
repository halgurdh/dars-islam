<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$session = require_session();
$workspace = ensure_workspace_for_user($session['user_id'], $session['email']);
$limits = $workspace['limits'] ?? [];
$usage = $workspace['usage'] ?? [];
$stmt = db()->prepare(
    'SELECT status, current_period_end, stripe_customer_id, stripe_subscription_id
     FROM stripe_subscriptions
     WHERE organization_id = ? OR user_id = ?
     ORDER BY organization_id = ? DESC, updated_at DESC
     LIMIT 1'
);
$stmt->execute([$workspace['id'], $session['user_id'], $workspace['id']]);
$subscription = $stmt->fetch() ?: null;
$hasCustomer = !empty($subscription['stripe_customer_id']);
$hasSubscription = !empty($subscription['stripe_subscription_id']);

json_out([
    'workspace' => $workspace,
    'billing' => [
        'plan_key' => $workspace['plan_key'],
        'seats_used' => (int) ($usage['members'] ?? 0),
        'seat_limit' => (int) ($limits['members'] ?? 0),
        'games_limit' => (int) ($limits['games'] ?? 0),
        'private_rooms_limit' => (int) ($limits['private_rooms'] ?? 0),
        'upgrade_label' => $workspace['plan_key'] === 'studio' ? 'Studio active' : 'Upgrade to Studio',
        'can_manage_subscription' => $hasCustomer,
        'subscription_status' => $subscription['status'] ?? 'none',
        'current_period_end' => $subscription['current_period_end'] ?? null,
        'has_customer' => $hasCustomer,
        'has_subscription' => $hasSubscription,
    ],
]);
