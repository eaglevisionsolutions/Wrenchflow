<?php
// endpoints.php

// Include the configuration file
require_once '../config.php';

// Function to handle GET requests for shops
function getShops() {
    global $conn; // Use the global database connection

    $sql = "SELECT * FROM shops";
    $result = $conn->query($sql);

    $shops = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $shops[] = $row;
        }
    }
    return json_encode($shops);
}

// Function to handle POST requests to create a new shop
function createShop($shopName) {
    global $conn;

    $stmt = $conn->prepare("INSERT INTO shops (shop_name) VALUES (?)");
    $stmt->bind_param("s", $shopName);
    $stmt->execute();
    return json_encode(['success' => true, 'shop_id' => $stmt->insert_id]);
}

// Handle incoming requests
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo getShops();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['shop_name'])) {
        echo createShop($data['shop_name']);
    } else {
        echo json_encode(['error' => 'Shop name is required']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>