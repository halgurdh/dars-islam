<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$workspace = require_workspace_role($session['user_id']);
$body = body();
$inviteId = (string) ($body['invite_id'] ?? '');
if ($inviteId === '') json_error('invite_id is required');

revoke_workspace_invite($workspace['id'], $inviteId);

json_out([
    'ok' => true,
    'invites' => list_workspace_invites($workspace['id']),
    'activity' => list_workspace_activity($workspace['id']),
]);
