<?php

require_once __DIR__ . '/../models/PartVendor.php';

class PartVendorController {
    private $partVendorModel;

    public function __construct($db) {
        $this->partVendorModel = new PartVendor($db);
    }

    public function handleRequest($method, $shop_id, $data) {
        switch ($method) {
            case 'GET':
                if (isset($data['part_id'])) {
                    $this->getVendorsForPart($shop_id, $data['part_id']);
                } elseif (isset($data['vendor_id'])) {
                    $this->getPartsForVendor($shop_id, $data['vendor_id']);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Invalid request']);
                }
                break;
            case 'POST':
                $this->associatePartWithVendor($shop_id, $data);
                break;
            case 'DELETE':
                $this->removePartVendorAssociation($shop_id, $data);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function getVendorsForPart($shop_id, $part_id) {
        $vendors = $this->partVendorModel->getVendorsForPart($shop_id, $part_id);
        echo json_encode($vendors);
    }

    private function getPartsForVendor($shop_id, $vendor_id) {
        $parts = $this->partVendorModel->getPartsForVendor($shop_id, $vendor_id);
        echo json_encode($parts);
    }

    private function associatePartWithVendor($shop_id, $data) {
        if ($this->partVendorModel->associatePartWithVendor($shop_id, $data['part_id'], $data['vendor_id'])) {
            http_response_code(201);
            echo json_encode(['message' => 'Part associated with vendor successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to associate part with vendor']);
        }
    }

    private function removePartVendorAssociation($shop_id, $data) {
        if ($this->partVendorModel->removePartVendorAssociation($shop_id, $data['part_id'], $data['vendor_id'])) {
            echo json_encode(['message' => 'Part-vendor association removed successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to remove part-vendor association']);
        }
    }
}