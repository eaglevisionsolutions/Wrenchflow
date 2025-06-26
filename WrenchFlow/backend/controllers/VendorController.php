<?php

require_once __DIR__ . '/../models/Vendor.php';

class VendorController {
    private $vendorModel;

    public function __construct($db) {
        $this->vendorModel = new Vendor($db);
    }

    public function handleRequest($method, $shop_id, $data) {
        switch ($method) {
            case 'GET':
                if (isset($data['id'])) {
                    $this->getVendor($shop_id, $data['id']);
                } else {
                    $this->getAllVendors($shop_id);
                }
                break;
            case 'POST':
                $this->createVendor($shop_id, $data);
                break;
            case 'PUT':
                $this->updateVendor($shop_id, $data);
                break;
            case 'DELETE':
                $this->deleteVendor($shop_id, $data['id']);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function getAllVendors($shop_id) {
        $vendors = $this->vendorModel->getVendorsByShop($shop_id);
        echo json_encode($vendors);
    }

    private function getVendor($shop_id, $vendor_id) {
        $vendor = $this->vendorModel->getVendorById($shop_id, $vendor_id);
        if ($vendor) {
            echo json_encode($vendor);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Vendor not found']);
        }
    }

    private function createVendor($shop_id, $data) {
        if ($this->vendorModel->createVendor(
            $shop_id,
            $data['vendor_name'],
            $data['contact_name'],
            $data['phone'],
            $data['email'],
            $data['address']
        )) {
            http_response_code(201);
            echo json_encode(['message' => 'Vendor created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create vendor']);
        }
    }

    private function updateVendor($shop_id, $data) {
        if ($this->vendorModel->updateVendor(
            $shop_id,
            $data['id'],
            $data['vendor_name'],
            $data['contact_name'],
            $data['phone'],
            $data['email'],
            $data['address']
        )) {
            echo json_encode(['message' => 'Vendor updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update vendor']);
        }
    }

    private function deleteVendor($shop_id, $vendor_id) {
        if ($this->vendorModel->deleteVendor($shop_id, $vendor_id)) {
            echo json_encode(['message' => 'Vendor deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete vendor']);
        }
    }
}