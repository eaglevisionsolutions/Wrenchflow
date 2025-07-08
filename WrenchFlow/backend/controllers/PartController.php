<?php
require_once __DIR__ . '/../models/Part.php';

class PartController {
    private $partModel;

    public function __construct($db) {
        $this->partModel = new Part($db);
    }

    public function handleRequest($method, $shop_id, $data) {
        switch ($method) {
            case 'GET':
                if (isset($data['id'])) {
                    $this->getPart($shop_id, $data['id']);
                } else {
                    $this->getAllParts($shop_id);
                }
                break;
            case 'POST':
                $this->createPart($shop_id, $data);
                break;
            case 'PUT':
                $this->updatePart($shop_id, $data);
                break;
            case 'DELETE':
                $this->deletePart($shop_id, $data['id']);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function getAllParts($shop_id) {
        $parts = $this->partModel->getPartsByShop($shop_id);
        echo json_encode($parts);
    }

    private function getPart($shop_id, $part_id) {
        $part = $this->partModel->getPartById($shop_id, $part_id);
        if ($part) {
            echo json_encode($part);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Part not found']);
        }
    }

    private function createPart($shop_id, $data) {
        $sale_price_per_unit = $this->calculateSalePrice($data['cost_per_unit'], $data['markup_percentage']);
        if ($this->partModel->createPart(
            $shop_id,
            $data['name'],
            $data['part_number'],
            $data['type'],
            $data['quantity'],
            $data['cost_per_unit'],
            $data['markup_percentage'],
            $sale_price_per_unit
        )) {
            http_response_code(201);
            echo json_encode(['message' => 'Part created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create part']);
        }
    }

    private function updatePart($shop_id, $data) {
        $sale_price_per_unit = $this->calculateSalePrice($data['cost_per_unit'], $data['markup_percentage']);
        if ($this->partModel->updatePart(
            $shop_id,
            $data['id'],
            $data['name'],
            $data['part_number'],
            $data['type'],
            $data['quantity'],
            $data['cost_per_unit'],
            $data['markup_percentage'],
            $sale_price_per_unit
        )) {
            echo json_encode(['message' => 'Part updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update part']);
        }
    }

    private function deletePart($shop_id, $part_id) {
        if ($this->partModel->deletePart($shop_id, $part_id)) {
            echo json_encode(['message' => 'Part deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete part']);
        }
    }

    private function calculateSalePrice($cost_per_unit, $markup_percentage) {
        return $cost_per_unit + ($cost_per_unit * ($markup_percentage / 100));
    }
}