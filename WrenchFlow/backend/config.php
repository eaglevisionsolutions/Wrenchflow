<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'wrenchflow_db');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}