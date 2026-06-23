<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$body    = body();
$uid     = $session['user_id'];

ensure_profile($uid);

// Only update fields the client is allowed to write
$allowed = ['coins','active_card_back','owned_card_backs','wins','losses','games_played','best_streak','current_streak'];
$sets    = [];
$params  = [];

foreach ($allowed as $field) {
    if (!array_key_exists($field, $body)) continue;

    $value = $body[$field];

    // Type validation
    if ($field === 'coins' || str_ends_with($field, 's') === false) {
        $value = match($field) {
            'coins','wins','losses','games_played','best_streak','current_streak' => max(0, (int) $value),
            'active_card_back' => preg_replace('/[^a-zA-Z0-9_]/', '', (string) $value),
            default => $value,
        };
    }

    if ($field === 'owned_card_backs') {
        if (!is_array($value)) continue;
        // Sanitise each key
        $value = array_values(array_filter(array_map(
            fn($k) => preg_replace('/[^a-zA-Z0-9_]/', '', (string)$k),
            $value
        )));
        $sets[]   = "`owned_card_backs` = ?";
        $params[] = json_encode($value);
        continue;
    }

    $sets[]   = "`$field` = ?";
    $params[] = $value;
}

if (empty($sets)) json_error('Nothing to update');

$sets[]   = '`updated_at` = NOW()';
$params[] = $uid;

db()->prepare(
    'UPDATE profiles SET ' . implode(', ', $sets) . ' WHERE user_id = ?'
)->execute($params);

json_out(['ok' => true]);
