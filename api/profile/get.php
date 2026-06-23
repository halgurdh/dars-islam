<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$session = require_session();
$profile = get_profile($session['user_id']);

json_out([
    'user_id'          => $session['user_id'],
    'email'            => $session['email'],
    'account_type'     => $session['account_type'] ?? classify_account_type($session['email']),
    'coins'            => (int) $profile['coins'],
    'active_card_back' => $profile['active_card_back'],
    'owned_card_backs' => $profile['owned_card_backs'],
    'premium_until'    => $profile['premium_until'],
    'premium_active'   => $profile['premium_active'],
    'wins'             => (int) $profile['wins'],
    'losses'           => (int) $profile['losses'],
    'games_played'     => (int) $profile['games_played'],
    'best_streak'      => (int) $profile['best_streak'],
    'current_streak'   => (int) $profile['current_streak'],
]);
