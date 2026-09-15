<?php
require_once __DIR__ . '/../_helpers.php';

// POST { invite_code: string } — a second teacher joining an existing
// school (e.g. a colleague at the same school).
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$body    = body();
$code    = strtoupper(trim((string) ($body['invite_code'] ?? '')));
if (!preg_match('/^[A-Z0-9]{8}$/', $code)) json_error('Invalid invite code');

rate_limit_or_fail('school-join', 20, 900, $session['user_id']);

$db = db();
$stmt = $db->prepare('SELECT id, name FROM schools WHERE invite_code = ?');
$stmt->execute([$code]);
$school = $stmt->fetch();
if (!$school) json_error('That invite code was not found');

$db->prepare(
    "INSERT INTO school_members (school_id, teacher_id, role) VALUES (?, ?, 'teacher')
     ON DUPLICATE KEY UPDATE teacher_id = teacher_id"
)->execute([$school['id'], $session['user_id']]);
promote_to_teacher($session['user_id']);

json_out(['id' => $school['id'], 'name' => $school['name']]);
