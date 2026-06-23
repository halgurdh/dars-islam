<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$session = require_session();
$workspace = ensure_workspace_for_user($session['user_id'], $session['email']);
$limit = isset($_GET['limit']) ? max(1, min(200, (int) $_GET['limit'])) : 40;

json_out([
    'workspace' => $workspace,
    'activity' => list_workspace_activity($workspace['id'], $limit),
]);
