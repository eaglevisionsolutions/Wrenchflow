<?php

require_once __DIR__ . '/../models/PartsOrder.php';
require_once __DIR__ . '/../models/PartsOrderLineItem.php';
require_once __DIR__ . '/../models/PartsOrderReceipt.php';

class PartsOrderController {
    private $partsOrderModel;
    private $lineItemModel;
    private $receiptModel;

    public function __construct($db) {
        $this->partsOrderModel = new PartsOrder($db);
        $this->lineItemModel = new PartsOrderLineItem($db);
        $this->receiptModel = new PartsOrderReceipt($db);
    }

    public function handleRequest($method, $shop_id, $data) {
        switch ($method) {
            case 'POST':
                $this->createPartsOrder($shop_id, $data);
                break;
            case 'PUT':
                $this->recordPartsReception($shop_id, $data);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function createPartsOrder($shop_id, $data) {
        $order_id = $this->partsOrderModel->createPartsOrder(
            $shop_id,
            $data['vendor_id'],
            $data['order_date'],
            'pending'
        );

        foreach ($data['line_items'] as $item) {
            $this->lineItemModel->addLineItem(
                $shop_id,
                $order_id,
                $item['part_id'],
                $item['quantity_ordered'],
                $item['is_new_part']
            );
        }

        echo json_encode(['message' => 'Parts order created successfully', 'order_id' => $order_id]);
    }

    private function recordPartsReception($shop_id, $data) {
        foreach ($data['receipts'] as $receipt) {
            $this->receiptModel->recordReceipt(
                $shop_id,
                $data['order_id'],
                $data['vendor_invoice_number'],
                $receipt['part_id'],
                $receipt['quantity_received'],
                $receipt['actual_cost_per_unit'],
                $receipt['is_backordered']
            );

            // Update inventory logic
            $this->updateInventory($shop_id, $receipt['part_id'], $receipt['quantity_received'], $receipt['actual_cost_per_unit']);
        }

        $this->partsOrderModel->updateOrderStatus($shop_id, $data['order_id'], $data['order_status']);
        echo json_encode(['message' => 'Parts reception recorded successfully']);
    }

    private function updateInventory($shop_id, $part_id, $quantity_received, $actual_cost_per_unit) {
        // Logic to update part inventory or create a new part if necessary
        // This would involve checking if the part exists and updating its quantity and cost
    }
}