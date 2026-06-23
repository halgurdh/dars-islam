<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$workspace = require_workspace_role($session['user_id'], ['owner', 'admin']);
$body = body();
$memberUserId = (string) ($body['user_id'] ?? '');
if ($memberUserId === '') json_error('user_id is required');

remove_workspace_member($session['user_id'], $workspace['id'], $memberUserId);

json_out([
    'ok' => true,
    'members' => list_workspace_members($workspace['id']),
]);
