<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$uid     = $session['user_id'];
$email   = $session['email'];
$db      = db();

// Look up or create a Stripe customer for this user
$stmt = $db->prepare(
    'SELECT stripe_customer_id FROM stripe_subscriptions WHERE user_id = ? LIMIT 1'
);
$stmt->execute([$uid]);
$existing = $stmt->fetch();

$customerId = null;

if ($existing) {
    $customerId = $existing['stripe_customer_id'];
} else {
    // Create customer via Stripe API
    $response = stripe_post('/v1/customers', [
        'email'                    => $email,
        'metadata[minitoon_user_id]' => $uid,
    ]);
    if (isset($response['error'])) json_error('Stripe error: ' . $response['error']['message'], 502);
    $customerId = $response['id'];
}

// Resolve the active price for the product (so price can change without code deploy)
$pricesResponse = stripe_get('/v1/prices?product=' . STRIPE_PRODUCT_ID . '&active=true&limit=1');
$priceId = $pricesResponse['data'][0]['id'] ?? null;
if (!$priceId) json_error('No active price found for product', 502);

// Create Checkout Session
$checkoutResponse = stripe_post('/v1/checkout/sessions', [
    'customer'                     => $customerId,
    'mode'                         => 'subscription',
    'line_items[0][price]'         => $priceId,
    'line_items[0][quantity]'      => '1',
    'client_reference_id'          => $uid,
    'success_url'                  => SITE_URL . '/?premium=success',
    'cancel_url'                   => SITE_URL . '/',
    'subscription_data[metadata][minitoon_user_id]' => $uid,
]);

if (isset($checkoutResponse['error'])) {
    json_error('Stripe checkout error: ' . $checkoutResponse['error']['message'], 502);
}

json_out(['url' => $checkoutResponse['url']]);

// ── Stripe helpers ────────────────────────────────────────────────────────────
function stripe_get(string $endpoint): array {
    $ch = curl_init('https://api.stripe.com' . $endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD        => STRIPE_SECRET_KEY . ':',
    ]);
    $body = curl_exec($ch);
    curl_close($ch);
    return json_decode($body, true) ?? [];
}

function stripe_post(string $endpoint, array $params): array {
    $ch = curl_init('https://api.stripe.com' . $endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query($params),
        CURLOPT_USERPWD        => STRIPE_SECRET_KEY . ':',
        CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
    ]);
    $body = curl_exec($ch);
    curl_close($ch);
    return json_decode($body, true) ?? [];
}
