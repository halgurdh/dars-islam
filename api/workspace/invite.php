<?php
require_once __DIR__ . '/../_helpers.php';

$session = require_session();
$workspace = require_workspace_role($session['user_id']);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    json_out([
        'workspace' => $workspace,
        'members' => list_workspace_members($workspace['id']),
        'invites' => list_workspace_invites($workspace['id']),
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = body();
    $email = (string) ($body['email'] ?? '');
    $role = (string) ($body['role'] ?? 'member');
    $invite = create_workspace_invite($workspace['id'], $session['user_id'], $email, $role);

    json_out([
        'ok' => true,
        'invite' => $invite,
        'invite_url' => SITE_URL . '/?mt_invite=' . urlencode($invite['token']),
        'members' => list_workspace_members($workspace['id']),
        'invites' => list_workspace_invites($workspace['id']),
    ]);
}

json_error('Method not allowed', 405);
