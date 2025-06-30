<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/AccessControl.php';

function validateCsrfToken() {
    session_start();
    $csrfToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!isset($_SESSION['csrf_token']) || $_SESSION['csrf_token'] !== $csrfToken) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        exit;
    }
}

// Apply CSRF validation to all state-changing requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    validateCsrfToken();
}

// Simple API router
$request = $_SERVER['REQUEST_URI'];

switch ($request) {
    case '/api/health':
        echo json_encode(['status' => 'ok']);
        break;
    case '/api/login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // Parse JSON input
            $data = json_decode(file_get_contents('php://input'), true);
            $email = $data['email'] ?? '';
            $password = $data['password'] ?? '';
            // Call your authentication logic (example: Auth::login)
            $result = Auth::login($email, $password, $db); // You may need to adjust this call
            echo json_encode($result);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
        break;
    // Add more routes here
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
        break;
}

if ($request === '/api/logout' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    session_start();
    session_unset();
    session_destroy();
    echo json_encode(['message' => 'Logout successful']);
    exit;
}

if ($request === '/api/sync/data' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $syncController = new SyncController($db);
    echo json_encode($syncController->syncData($data));
    exit;
}