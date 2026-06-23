<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$uid = $session['user_id'];
$email = $session['email'];
$workspace = ensure_workspace_for_user($uid, $email);
$db = db();

$stmt = $db->prepare(
    'SELECT stripe_customer_id FROM stripe_subscriptions
     WHERE organization_id = ? OR user_id = ?
     ORDER BY organization_id = ? DESC
     LIMIT 1'
);
$stmt->execute([$workspace['id'], $uid, $workspace['id']]);
$row = $stmt->fetch();

if (!$row || empty($row['stripe_customer_id'])) {
    json_error('No billing customer found for this workspace', 404);
}

$portal = stripe_post('/v1/billing_portal/sessions', [
    'customer' => $row['stripe_customer_id'],
    'return_url' => SITE_URL . '/',
]);

if (isset($portal['error'])) {
    json_error('Stripe portal error: ' . $portal['error']['message'], 502);
}

json_out(['url' => $portal['url']]);

function stripe_post(string $endpoint, array $params): array {
    $ch = curl_init('https://api.stripe.com' . $endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($params),
        CURLOPT_USERPWD => STRIPE_SECRET_KEY . ':',
        CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
    ]);
    $body = curl_exec($ch);
    curl_close($ch);
    return json_decode($body, true) ?? [];
}
