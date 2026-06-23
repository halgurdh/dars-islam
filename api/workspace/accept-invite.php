<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$body = body();
$token = (string) ($body['token'] ?? '');
if ($token === '') json_error('token is required');

$workspace = accept_invite_token_for_user($session['user_id'], $token);

json_out([
    'ok' => true,
    'workspace' => $workspace,
    'workspaces' => list_workspaces_for_user($session['user_id']),
    'members' => list_workspace_members($workspace['id']),
    'invites' => list_workspace_invites($workspace['id']),
    'activity' => list_workspace_activity($workspace['id']),
]);
