<?php
require_once __DIR__ . '/../_helpers.php';

// GET ?class_id=... — full roster for one class, sorted by XP, plus the
// top/bottom 5 within that class. Visible to the owning teacher and to
// any other teacher in the same school.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$session = require_session();
$classId = (string) ($_GET['class_id'] ?? '');
if ($classId === '') json_error('Missing class_id');

$db = db();

$classStmt = $db->prepare('SELECT id, school_id, teacher_id, name, join_code FROM classes WHERE id = ?');
$classStmt->execute([$classId]);
$class = $classStmt->fetch();
if (!$class) json_error('Class not found', 404);

$member = $db->prepare('SELECT 1 FROM school_members WHERE school_id = ? AND teacher_id = ?');
$member->execute([$class['school_id'], $session['user_id']]);
if (!$member->fetch()) json_error('Forbidden', 403);

$rosterStmt = $db->prepare(
    'SELECT p.display_name, p.xp, p.daily_streak, p.badges, p.games_played, st.joined_at
     FROM students st
     JOIN profiles p ON p.user_id = st.user_id
     WHERE st.class_id = ?
     ORDER BY p.xp DESC'
);
$rosterStmt->execute([$classId]);

$students = array_map(function ($r) {
    $badges = json_decode($r['badges'] ?? '[]', true) ?? [];
    return [
        'display_name'  => $r['display_name'] ?? 'Unnamed student',
        'xp'            => (int) $r['xp'],
        'level'         => (int) floor(sqrt(((int) $r['xp']) / 100)) + 1,
        'daily_streak'  => (int) $r['daily_streak'],
        'badge_count'   => count($badges),
        'joined_at'     => $r['joined_at'],
    ];
}, $rosterStmt->fetchAll());

$avgXp = count($students) > 0
    ? round(array_sum(array_column($students, 'xp')) / count($students))
    : 0;

json_out([
    'class' => [
        'id'        => $class['id'],
        'name'      => $class['name'],
        'join_code' => $class['join_code'],
        'is_mine'   => $class['teacher_id'] === $session['user_id'],
    ],
    'students'        => $students,
    'avg_xp'          => $avgXp,
    'top_students'    => array_slice($students, 0, 5),
    'bottom_students' => array_slice(array_reverse($students), 0, 5),
]);
