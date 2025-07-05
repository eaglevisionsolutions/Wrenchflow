<?php
// backend/controllers/ConfigController.php
require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');

echo json_encode([
    'APP_DEBUG' => (bool)getenv('APP_DEBUG') || (defined('APP_DEBUG') && APP_DEBUG === true)
]);
