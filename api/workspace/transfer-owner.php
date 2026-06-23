<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$workspace = require_workspace_role($session['user_id'], ['owner']);
$body = body();
$newOwnerUserId = (string) ($body['user_id'] ?? '');
if ($newOwnerUserId === '') json_error('user_id is required');

transfer_workspace_owner($session['user_id'], $workspace['id'], $newOwnerUserId);

json_out([
    'ok' => true,
    'workspace' => get_workspace_for_user($session['user_id']),
    'members' => list_workspace_members($workspace['id']),
]);
