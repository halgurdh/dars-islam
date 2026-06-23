<?php
header('Content-Type: application/json; charset=utf-8');

$result = [
    'ok' => true,
    'php_version' => PHP_VERSION,
    'steps' => [],
];

function diag_step(string $name, bool $ok, array $extra = []): void {
    global $result;
    $result['steps'][] = array_merge([
        'name' => $name,
        'ok' => $ok,
    ], $extra);
    if (!$ok) $result['ok'] = false;
}

try {
    require_once __DIR__ . '/_config.php';
    diag_step('load_config', true, [
        'site_url' => defined('SITE_URL') ? SITE_URL : null,
        'from_email' => defined('FROM_EMAIL') ? FROM_EMAIL : null,
    ]);
} catch (Throwable $e) {
    diag_step('load_config', false, ['error' => $e->getMessage()]);
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

try {
    require_once __DIR__ . '/_db.php';
    diag_step('load_db_helpers', true);
} catch (Throwable $e) {
    diag_step('load_db_helpers', false, ['error' => $e->getMessage()]);
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

try {
    require_once __DIR__ . '/_helpers.php';
    diag_step('load_helpers', true);
} catch (Throwable $e) {
    diag_step('load_helpers', false, ['error' => $e->getMessage()]);
    echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

diag_step('mail_function_exists', function_exists('mail'));

try {
    $pdo = db();
    $driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
    $version = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
    diag_step('db_connect', true, [
        'driver' => $driver,
        'server_version' => $version,
    ]);
} catch (Throwable $e) {
    diag_step('db_connect', false, ['error' => $e->getMessage()]);
}

try {
    $tables = [];
    foreach (['users', 'auth_tokens', 'sessions', 'profiles'] as $table) {
        try {
            db()->query("SELECT 1 FROM {$table} LIMIT 1");
            $tables[$table] = true;
        } catch (Throwable $e) {
            $tables[$table] = false;
        }
    }
    diag_step('db_tables', !in_array(false, $tables, true), ['tables' => $tables]);
} catch (Throwable $e) {
    diag_step('db_tables', false, ['error' => $e->getMessage()]);
}

try {
    $mailReady = defined('FROM_EMAIL')
        && filter_var(FROM_EMAIL, FILTER_VALIDATE_EMAIL)
        && defined('FROM_NAME')
        && defined('SITE_URL');
    diag_step('mail_config_shape', $mailReady, [
        'from_email_valid' => defined('FROM_EMAIL') ? (bool) filter_var(FROM_EMAIL, FILTER_VALIDATE_EMAIL) : false,
    ]);
} catch (Throwable $e) {
    diag_step('mail_config_shape', false, ['error' => $e->getMessage()]);
}

echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
