<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$session = require_session();
$workspace = ensure_workspace_for_user($session['user_id'], $session['email']);

json_out([
    'account_type' => $session['account_type'] ?? classify_account_type($session['email']),
    'workspace' => $workspace,
]);
