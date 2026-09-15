<?php
require_once __DIR__ . '/../_helpers.php';

// POST { school_id: string, name: string }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$session  = require_session();
$body     = body();
$schoolId = (string) ($body['school_id'] ?? '');
$name     = trim(preg_replace('/[\x00-\x1F\x7F]/', '', (string) ($body['name'] ?? '')));
$name     = mb_substr($name, 0, 80);
if ($name === '') json_error('Please enter a class name');

$db = db();

$member = $db->prepare('SELECT 1 FROM school_members WHERE school_id = ? AND teacher_id = ?');
$member->execute([$schoolId, $session['user_id']]);
if (!$member->fetch()) json_error('Forbidden', 403);

$id = uuid();
$joinCode = unique_code(6, function (string $code) use ($db) {
    $s = $db->prepare('SELECT 1 FROM classes WHERE join_code = ?');
    $s->execute([$code]);
    return (bool) $s->fetch();
});

$db->prepare('INSERT INTO classes (id, school_id, teacher_id, name, join_code) VALUES (?, ?, ?, ?, ?)')
    ->execute([$id, $schoolId, $session['user_id'], $name, $joinCode]);

json_out(['id' => $id, 'school_id' => $schoolId, 'name' => $name, 'join_code' => $joinCode]);
