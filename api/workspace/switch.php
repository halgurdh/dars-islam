<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$body = body();
$workspaceId = (string) ($body['workspace_id'] ?? '');
if ($workspaceId === '') json_error('workspace_id is required');

$workspace = switch_workspace_for_user($session['user_id'], $workspaceId);

json_out([
    'ok' => true,
    'workspace' => $workspace,
    'workspaces' => list_workspaces_for_user($session['user_id']),
    'members' => list_workspace_members($workspace['id']),
    'invites' => list_workspace_invites($workspace['id']),
]);
