<?php
require_once __DIR__ . '/../_helpers.php';

$session = require_session();
$workspace = require_workspace_role($session['user_id'], ['owner', 'admin']);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_out([
        'workspace' => $workspace,
        'members' => list_workspace_members($workspace['id']),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = body();
    $memberUserId = (string) ($body['user_id'] ?? '');
    $role = (string) ($body['role'] ?? '');
    if ($memberUserId === '' || $role === '') json_error('user_id and role are required');
    update_workspace_member_role($session['user_id'], $workspace['id'], $memberUserId, $role);
    json_out([
        'ok' => true,
        'members' => list_workspace_members($workspace['id']),
    ]);
}

json_error('Method not allowed', 405);
