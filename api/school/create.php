<?php
require_once __DIR__ . '/../_helpers.php';

// POST { name: string } — any signed-in account can create a school; doing
// so is what makes them a teacher (see promote_to_teacher).
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session = require_session();
$body    = body();
$name    = trim(preg_replace('/[\x00-\x1F\x7F]/', '', (string) ($body['name'] ?? '')));
$name    = mb_substr($name, 0, 120);
if ($name === '') json_error('Please enter a school name');

$db = db();
$id = uuid();
$inviteCode = unique_code(8, function (string $code) use ($db) {
    $s = $db->prepare('SELECT 1 FROM schools WHERE invite_code = ?');
    $s->execute([$code]);
    return (bool) $s->fetch();
});

try {
    $db->beginTransaction();
    $db->prepare('INSERT INTO schools (id, name, invite_code, owner_user_id) VALUES (?, ?, ?, ?)')
        ->execute([$id, $name, $inviteCode, $session['user_id']]);
    $db->prepare("INSERT INTO school_members (school_id, teacher_id, role) VALUES (?, ?, 'owner')")
        ->execute([$id, $session['user_id']]);
    promote_to_teacher($session['user_id']);
    $db->commit();
} catch (Throwable $e) {
    $db->rollBack();
    server_error('Could not create the school', 'school/create failed: ' . $e->getMessage());
}

json_out(['id' => $id, 'name' => $name, 'invite_code' => $inviteCode]);
