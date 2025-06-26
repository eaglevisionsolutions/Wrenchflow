<?php
require_once __DIR__ . '/../models/Equipment.php';

class EquipmentController {
    private $equipmentModel;

    public function __construct($db) {
        $this->equipmentModel = new Equipment($db);
    }

    public function handleRequest($method, $shop_id, $data) {
        switch ($method) {
            case 'GET':
                if (isset($data['id'])) {
                    $this->getEquipment($shop_id, $data['id']);
                } else {
                    $this->getAllEquipment($shop_id);
                }
                break;
            case 'POST':
                $this->createEquipment($shop_id, $data);
                break;
            case 'PUT':
                $this->updateEquipment($shop_id, $data);
                break;
            case 'DELETE':
                $this->deleteEquipment($shop_id, $data['id']);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function getAllEquipment($shop_id) {
        $equipment = $this->equipmentModel->getEquipmentByShop($shop_id);
        echo json_encode($equipment);
    }

    private function getEquipment($shop_id, $equipment_id) {
        $equipment = $this->equipmentModel->getEquipmentById($shop_id, $equipment_id);
        if ($equipment) {
            echo json_encode($equipment);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Equipment not found']);
        }
    }

    private function createEquipment($shop_id, $data) {
        if ($this->equipmentModel->createEquipment(
            $shop_id,
            $data['customer_id'],
            $data['name'],
            $data['serial_number'],
            $data['description']
        )) {
            http_response_code(201);
            echo json_encode(['message' => 'Equipment created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create equipment']);
        }
    }

    private function updateEquipment($shop_id, $data) {
        if ($this->equipmentModel->updateEquipment(
            $shop_id,
            $data['id'],
            $data['name'],
            $data['serial_number'],
            $data['description']
        )) {
            echo json_encode(['message' => 'Equipment updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update equipment']);
        }
    }

    private function deleteEquipment($shop_id, $equipment_id) {
        if ($this->equipmentModel->deleteEquipment($shop_id, $equipment_id)) {
            echo json_encode(['message' => 'Equipment deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete equipment']);
        }
    }
}