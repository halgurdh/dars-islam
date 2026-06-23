<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$workspace = require_workspace_role($session['user_id'], ['owner']);
$nextWorkspace = archive_workspace($session['user_id'], $workspace['id']);

json_out([
    'ok' => true,
    'workspace' => $nextWorkspace,
    'workspaces' => list_workspaces_for_user($session['user_id']),
    'members' => list_workspace_members($nextWorkspace['id']),
    'invites' => list_workspace_invites($nextWorkspace['id']),
    'activity' => list_workspace_activity($nextWorkspace['id']),
]);
