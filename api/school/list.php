<?php
require_once __DIR__ . '/../_helpers.php';

// GET — schools the signed-in teacher belongs to, each with its classes
// and a per-class student count + average XP.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$session = require_session();
$db = db();

$schoolsStmt = $db->prepare(
    'SELECT s.id, s.name, s.invite_code, sm.role AS my_role
     FROM schools s
     JOIN school_members sm ON sm.school_id = s.id
     WHERE sm.teacher_id = ?
     ORDER BY s.created_at ASC'
);
$schoolsStmt->execute([$session['user_id']]);
$schools = $schoolsStmt->fetchAll();

if (!$schools) json_out(['schools' => []]);

$schoolIds = array_column($schools, 'id');
$placeholders = implode(',', array_fill(0, count($schoolIds), '?'));

$classesStmt = $db->prepare(
    "SELECT c.id, c.school_id, c.name, c.join_code, c.teacher_id,
            COUNT(st.user_id) AS student_count,
            COALESCE(AVG(p.xp), 0) AS avg_xp
     FROM classes c
     LEFT JOIN students st ON st.class_id = c.id
     LEFT JOIN profiles p ON p.user_id = st.user_id
     WHERE c.school_id IN ($placeholders)
     GROUP BY c.id
     ORDER BY c.created_at ASC"
);
$classesStmt->execute($schoolIds);
$classes = $classesStmt->fetchAll();

$classesBySchool = [];
foreach ($classes as $c) {
    $classesBySchool[$c['school_id']][] = [
        'id'            => $c['id'],
        'name'          => $c['name'],
        'join_code'     => $c['join_code'],
        'is_mine'       => $c['teacher_id'] === $session['user_id'],
        'student_count' => (int) $c['student_count'],
        'avg_xp'        => round((float) $c['avg_xp']),
    ];
}

$result = array_map(fn($s) => [
    'id'          => $s['id'],
    'name'        => $s['name'],
    'invite_code' => $s['invite_code'],
    'my_role'     => $s['my_role'],
    'classes'     => $classesBySchool[$s['id']] ?? [],
], $schools);

json_out(['schools' => $result]);
