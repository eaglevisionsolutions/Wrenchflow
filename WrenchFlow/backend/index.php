<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/AccessControl.php';

// Simple API router
$request = $_SERVER['REQUEST_URI'];

switch ($request) {
    case '/api/health':
        echo json_encode(['status' => 'ok']);
        break;
    // Add more routes here
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
        break;
}