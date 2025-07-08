<?php
require_once __DIR__ . '/../session.php'; // Include session management
require_once __DIR__ . '/../Auth.php';
require_once __DIR__ . '/../AccessControl.php';

$auth = new Auth($db);
$accessControl = new AccessControl($auth);

// Protect endpoint for Parts Employees and Shop Administrators
$accessControl->checkAccess(['Parts Employee', 'Shop Administrator']);

// Enforce shop-level access
$shopId = $_GET['shop_id'] ?? null;
$accessControl->enforceShopScope($shopId);

// Proceed with the rest of the controller logic