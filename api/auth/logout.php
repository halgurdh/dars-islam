<?php
require_once __DIR__ . '/../_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Method not allowed', 405);

$token = $_SERVER['HTTP_X_SESSION_TOKEN'] ?? '';
if ($token) {
    db()->prepare('DELETE FROM sessions WHERE token = ?')->execute([$token]);
}

json_out(['ok' => true]);
