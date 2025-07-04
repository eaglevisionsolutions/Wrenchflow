<?php
// Load .env for debug flag
$envFile = __DIR__ . '/.env';
$env = [];
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        [$k, $v] = array_map('trim', explode('=', $line, 2) + [1 => '']);
        $env[$k] = $v;
    }
}
$appDebug = isset($env['APP_DEBUG']) && strtolower($env['APP_DEBUG']) === 'true';
if ($appDebug) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);
}
// Basic API routing for WrenchFlow
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/AccessControl.php';

// Autoload controllers
$controllers = [
    'customers' => 'CustomerController',
    'equipment' => 'EquipmentController',
    'parts' => 'PartController',
    'vendors' => 'VendorController',
    'parts_orders' => 'PartsOrderController',
    'work_orders' => 'WorkOrderController',
    'work_order_parts' => 'WorkOrderPartController',
    'work_order_services' => 'WorkOrderServiceController',
    'appointments' => 'AppointmentController',
    'sales' => 'SaleController',
    'themes' => 'ThemeController',
    'employees' => 'EmployeeController',
    'shops' => 'ShopController',
    'shop_settings' => 'ShopSettingController',
    'auth' => 'AuthController', // Add auth controller
];

foreach ($controllers as $key => $class) {
    $file = __DIR__ . "/controllers/{$class}.php";
    if (file_exists($file)) require_once $file;
}

// Parse request
$uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$method = $_SERVER['REQUEST_METHOD'];
$segments = explode('/', $uri);
$resource = $segments[1] ?? null; // e.g. /api/customers
if ($segments[0] !== 'api' || !$resource || !isset($controllers[$resource])) {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}
$controller = new $controllers[$resource]();

// Auth check (except login route)
if (!(($resource === 'auth' && $method === 'POST') || ($resource === 'auth' && $method === 'logout'))) {
    Auth::check();
}

// Route dispatch
switch ($method) {
    case 'GET':
        // For work_order_parts and work_order_services, require work_order_id
        if (in_array($resource, ['work_order_parts', 'work_order_services'])) {
            if (!isset($_GET['work_order_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing work_order_id']);
                exit;
            }
            $controller->getAll($_GET['work_order_id']);
        } else if (isset($_GET['shop_id'])) {
            AccessControl::requireShopAccess($_GET['shop_id']);
            $controller->getAll($_GET['shop_id']);
        } else {
            $controller->getAll();
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['shop_id'])) {
            AccessControl::requireShopAccess($data['shop_id']);
        }
        $controller->create($data);
        break;
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (isset($data['shop_id'])) {
            AccessControl::requireShopAccess($data['shop_id']);
        }
        if (method_exists($controller, 'update')) {
            $controller->update($data);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
        break;
    case 'DELETE':
        $id = $_GET['id'] ?? null;
        $shop_id = $_GET['shop_id'] ?? null;
        if ($shop_id) {
            AccessControl::requireShopAccess($shop_id);
        }
        if ($id && method_exists($controller, 'delete')) {
            // For work_order_parts/services, only id is needed
            if (in_array($resource, ['work_order_parts', 'work_order_services'])) {
                $controller->delete($id);
            } else {
                $controller->delete($id, $shop_id);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
}
