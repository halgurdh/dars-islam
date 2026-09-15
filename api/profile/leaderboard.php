<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

// Public leaderboard: top 20 by XP. Only players with a display name set
// (i.e. who opted in via the progress panel) are shown. Students (role
// 'student', created via a class join-code — see auth/join-class.php)
// are excluded: this endpoint is unauthenticated and world-readable, and
// a child's name has no business on an open board. Their standing is
// still visible to their own teacher via class/roster.php.
$stmt = db()->prepare(
    "SELECT p.display_name, p.xp
     FROM profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.display_name IS NOT NULL AND p.display_name <> '' AND p.xp > 0 AND u.role <> 'student'
     ORDER BY p.xp DESC
     LIMIT 20"
);
$stmt->execute();
$rows = $stmt->fetchAll();

$entries = array_map(fn($r) => [
    'display_name' => $r['display_name'],
    'xp'           => (int) $r['xp'],
    'level'        => (int) floor(sqrt(((int) $r['xp']) / 100)) + 1,
], $rows);

json_out(['entries' => $entries]);
