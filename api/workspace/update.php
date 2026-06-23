<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$workspace = require_workspace_role($session['user_id']);
$body = body();

$brandName = trim((string) ($body['brand_name'] ?? $workspace['settings']['brand_name']));
$brandTagline = trim((string) ($body['brand_tagline'] ?? ($workspace['settings']['brand_tagline'] ?? '')));
$accentColor = strtoupper(trim((string) ($body['accent_color'] ?? $workspace['settings']['accent_color'])));
$logoUrl = trim((string) ($body['logo_url'] ?? ($workspace['settings']['logo_url'] ?? '')));

if ($brandName === '') {
    $brandName = $workspace['name'];
}
$brandName = substr($brandName, 0, 120);
$brandTagline = $brandTagline !== '' ? substr($brandTagline, 0, 160) : null;
if (!preg_match('/^#[0-9A-F]{6}$/', $accentColor)) {
    $accentColor = '#FF6B35';
}
if ($logoUrl !== '' && !filter_var($logoUrl, FILTER_VALIDATE_URL)) {
    json_error('Logo URL must be a valid URL');
}
$logoUrl = $logoUrl !== '' ? substr($logoUrl, 0, 255) : null;

db()->prepare(
    'UPDATE workspace_settings
     SET brand_name = ?, brand_tagline = ?, accent_color = ?, logo_url = ?, updated_at = NOW()
     WHERE organization_id = ?'
)->execute([$brandName, $brandTagline, $accentColor, $logoUrl, $workspace['id']]);

db()->prepare(
    'UPDATE organizations SET name = ?, updated_at = NOW() WHERE id = ?'
)->execute([$brandName, $workspace['id']]);

json_out([
    'ok' => true,
    'workspace' => get_workspace_for_user($session['user_id']),
]);
