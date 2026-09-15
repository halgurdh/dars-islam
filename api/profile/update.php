<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$body    = body();
$uid     = $session['user_id'];

ensure_profile($uid);

// Only update fields the client is allowed to write
$allowed = [
    'coins','active_card_back','owned_card_backs','wins','losses','games_played','best_streak','current_streak',
    'display_name','xp','daily_streak','best_daily_streak','last_played_date','badges',
];
$sets    = [];
$params  = [];

foreach ($allowed as $field) {
    if (!array_key_exists($field, $body)) continue;

    $value = $body[$field];

    if ($field === 'owned_card_backs' || $field === 'badges') {
        if (!is_array($value)) continue;
        // Sanitise each key
        $value = array_values(array_filter(array_map(
            fn($k) => preg_replace('/[^a-zA-Z0-9_]/', '', (string)$k),
            $value
        )));
        $sets[]   = "`$field` = ?";
        $params[] = json_encode($value);
        continue;
    }

    if ($field === 'display_name') {
        $sets[]   = "`display_name` = ?";
        $params[] = sanitize_display_name($value !== null ? (string) $value : null);
        continue;
    }

    if ($field === 'last_played_date') {
        if ($value !== null && !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) $value)) continue;
        $sets[]   = "`last_played_date` = ?";
        $params[] = $value;
        continue;
    }

    // Type validation
    if ($field === 'coins' || str_ends_with($field, 's') === false) {
        $value = match($field) {
            'coins','wins','losses','games_played','best_streak','current_streak',
            'xp','daily_streak','best_daily_streak' => max(0, (int) $value),
            'active_card_back' => preg_replace('/[^a-zA-Z0-9_]/', '', (string) $value),
            default => $value,
        };
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
