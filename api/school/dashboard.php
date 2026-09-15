<?php
require_once __DIR__ . '/../_helpers.php';

// GET ?school_id=... — aggregate view across every class in the school:
// per-class averages plus school-wide top/bottom 5 students by XP.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') json_error('Method not allowed', 405);

$session  = require_session();
$schoolId = (string) ($_GET['school_id'] ?? '');
if ($schoolId === '') json_error('Missing school_id');

$db = db();

$member = $db->prepare('SELECT 1 FROM school_members WHERE school_id = ? AND teacher_id = ?');
$member->execute([$schoolId, $session['user_id']]);
if (!$member->fetch()) json_error('Forbidden', 403);

$schoolStmt = $db->prepare('SELECT id, name, invite_code FROM schools WHERE id = ?');
$schoolStmt->execute([$schoolId]);
$school = $schoolStmt->fetch();
if (!$school) json_error('School not found', 404);

$classesStmt = $db->prepare(
    'SELECT c.id, c.name,
            COUNT(st.user_id) AS student_count,
            COALESCE(AVG(p.xp), 0) AS avg_xp
     FROM classes c
     LEFT JOIN students st ON st.class_id = c.id
     LEFT JOIN profiles p ON p.user_id = st.user_id
     WHERE c.school_id = ?
     GROUP BY c.id
     ORDER BY avg_xp DESC'
);
$classesStmt->execute([$schoolId]);
$classes = array_map(fn($c) => [
    'id'            => $c['id'],
    'name'          => $c['name'],
    'student_count' => (int) $c['student_count'],
    'avg_xp'        => round((float) $c['avg_xp']),
], $classesStmt->fetchAll());

function fetch_ranked_students(PDO $db, string $schoolId, string $order, int $limit): array {
    $stmt = $db->prepare(
        "SELECT p.display_name, p.xp, c.name AS class_name
         FROM students st
         JOIN profiles p ON p.user_id = st.user_id
         JOIN classes c ON c.id = st.class_id
         WHERE c.school_id = ? AND p.display_name IS NOT NULL
         ORDER BY p.xp $order
         LIMIT $limit"
    );
    $stmt->execute([$schoolId]);
    return array_map(fn($r) => [
        'display_name' => $r['display_name'],
        'xp'           => (int) $r['xp'],
        'level'        => (int) floor(sqrt(((int) $r['xp']) / 100)) + 1,
        'class_name'   => $r['class_name'],
    ], $stmt->fetchAll());
}

json_out([
    'school'         => $school,
    'classes'        => $classes,
    'top_students'   => fetch_ranked_students($db, $schoolId, 'DESC', 5),
    'bottom_students' => fetch_ranked_students($db, $schoolId, 'ASC', 5),
]);
