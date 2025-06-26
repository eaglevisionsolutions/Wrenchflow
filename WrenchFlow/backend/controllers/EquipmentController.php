<?php
require_once __DIR__ . '/../session.php'; // Include session management
require_once __DIR__ . '/../Auth.php';
require_once __DIR__ . '/../AccessControl.php';
require_once __DIR__ . '/../models/Equipment.php'; // Keep the model intact

class EquipmentController {
    private $auth;
    private $accessControl;
    private $equipmentModel;

    public function __construct($db) {
        $this->auth = new Auth($db);
        $this->accessControl = new AccessControl($this->auth);
        $this->equipmentModel = new Equipment($db); // Keep the model initialization intact

        // Protect endpoint for Service Employees and Shop Administrators
        $this->accessControl->checkAccess(['Service Employee', 'Shop Administrator']);
    }

    public function getEquipmentByShop($shopId) {
        // Enforce shop-level access
        $this->accessControl->enforceShopScope($shopId);

        // Existing functionality for fetching equipment by shop
        $equipment = $this->equipmentModel->getEquipmentByShop($shopId);

        // Return response
        http_response_code(200);
        echo json_encode($equipment);
    }

    public function createEquipment($shopId) {
        // Enforce shop-level access
        $this->accessControl->enforceShopScope($shopId);

        // Use existing request handling logic to get input data
        $name = $_POST['name'] ?? null;
        $serialNumber = $_POST['serial_number'] ?? null;

        // Validate input
        if (!$name || !$serialNumber) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
            return;
        }

        // Existing functionality for creating equipment
        $result = $this->equipmentModel->createEquipment($shopId, [
            'name' => $name,
            'serial_number' => $serialNumber,
        ]);

        // Return response
        if ($result) {
            http_response_code(201);
            echo json_encode(['message' => 'Equipment created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create equipment']);
        }
    }

    public function deleteEquipment($equipmentId) {
        // Existing functionality for deleting equipment
        $result = $this->equipmentModel->deleteEquipment($equipmentId);

        // Return response
        if ($result) {
            http_response_code(200);
            echo json_encode(['message' => 'Equipment deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete equipment']);
        }
    }

    public function updateEquipment($equipmentId) {
        // Use existing request handling logic to get input data
        $name = $_POST['name'] ?? null;
        $serialNumber = $_POST['serial_number'] ?? null;

        // Validate input
        if (!$name || !$serialNumber) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid input data']);
            return;
        }

        // Existing functionality for updating equipment
        $result = $this->equipmentModel->updateEquipment($equipmentId, [
            'name' => $name,
            'serial_number' => $serialNumber,
        ]);

        // Return response
        if ($result) {
            http_response_code(200);
            echo json_encode(['message' => 'Equipment updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update equipment']);
        }
    }
}