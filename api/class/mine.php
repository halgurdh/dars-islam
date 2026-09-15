<?php
require_once __DIR__ . '/../_helpers.php';

// GET — the signed-in student's own class membership + rank. Deliberately
// minimal: a student can see their own standing, not their classmates'
// names/details (that view is for the teacher — see class/roster.php).
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$session = require_session();
$db = db();

$stmt = $db->prepare(
    'SELECT st.class_id, c.name AS class_name, s.name AS school_name
     FROM students st
     JOIN classes c ON c.id = st.class_id
     JOIN schools s ON s.id = c.school_id
     WHERE st.user_id = ?'
);
$stmt->execute([$session['user_id']]);
$membership = $stmt->fetch();

if (!$membership) json_out(['in_class' => false]);

$rosterStmt = $db->prepare(
    'SELECT st.user_id, p.xp
     FROM students st
     JOIN profiles p ON p.user_id = st.user_id
     WHERE st.class_id = ?
     ORDER BY p.xp DESC'
);
$rosterStmt->execute([$membership['class_id']]);
$roster = $rosterStmt->fetchAll();

$rank = 1;
$myXp = 0;
foreach ($roster as $i => $r) {
    if ($r['user_id'] === $session['user_id']) {
        $rank = $i + 1;
        $myXp = (int) $r['xp'];
        break;
    }
}
$classSize = count($roster);
$avgXp = $classSize > 0 ? round(array_sum(array_column($roster, 'xp')) / $classSize) : 0;

json_out([
    'in_class'    => true,
    'class_name'  => $membership['class_name'],
    'school_name' => $membership['school_name'],
    'rank'        => $rank,
    'class_size'  => $classSize,
    'avg_xp'      => $avgXp,
    'my_xp'       => $myXp,
]);
