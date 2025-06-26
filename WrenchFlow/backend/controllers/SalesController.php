<?php

require_once __DIR__ . '/../session.php'; // Include session management
require_once __DIR__ . '/../Auth.php';
require_once __DIR__ . '/../AccessControl.php';
require_once __DIR__ . '/../models/Sale.php';
require_once __DIR__ . '/../models/SaleLineItem.php';
require_once __DIR__ . '/../models/Part.php';

class SalesController {
    private $saleModel;
    private $saleLineItemModel;
    private $partModel;
    private $auth;
    private $accessControl;

    public function __construct($db) {
        $this->saleModel = new Sale($db);
        $this->saleLineItemModel = new SaleLineItem($db);
        $this->partModel = new Part($db);
        $this->auth = new Auth($db);
        $this->accessControl = new AccessControl($this->auth);

        // Protect endpoint for Shop Administrators and Parts Employees
        $this->accessControl->checkAccess(['Shop Administrator', 'Parts Employee']);
    }

    public function handleRequest($method, $shop_id, $data) {
        // Enforce shop-level access
        $this->accessControl->enforceShopScope($shop_id);

        switch ($method) {
            case 'POST':
                $this->recordSale($shop_id, $data);
                break;
            case 'GET':
                if (isset($data['report_type'])) {
                    $this->generateReport($shop_id, $data);
                } else {
                    $this->getSales($shop_id, $data);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function recordSale($shop_id, $data) {
        $sale_id = $this->saleModel->createSale(
            $shop_id,
            $data['customer_id'] ?? null,
            $data['sale_date'],
            $data['total_amount']
        );

        foreach ($data['line_items'] as $item) {
            $this->saleLineItemModel->addLineItem(
                $sale_id,
                $item['part_id'],
                $item['quantity_sold'],
                $item['sale_price']
            );

            // Decrement inventory for the sold part
            $this->partModel->decrementInventory($shop_id, $item['part_id'], $item['quantity_sold']);
        }

        echo json_encode(['message' => 'Sale recorded successfully', 'sale_id' => $sale_id]);
    }

    private function getSales($shop_id, $data) {
        $sales = $this->saleModel->getSalesByShop($shop_id, $data['start_date'] ?? null, $data['end_date'] ?? null);
        echo json_encode($sales);
    }

    private function generateReport($shop_id, $data) {
        switch ($data['report_type']) {
            case 'parts_sales':
                $this->generatePartsSalesReport($shop_id, $data);
                break;
            case 'service_sales':
                $this->generateServiceSalesReport($shop_id, $data);
                break;
            case 'overall_sales':
                $this->generateOverallSalesDashboard($shop_id, $data);
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid report type']);
        }
    }

    private function generatePartsSalesReport($shop_id, $data) {
        // Logic to aggregate parts sales from work orders and OTC sales
        // Example response:
        echo json_encode([
            'total_units_sold' => 100,
            'total_revenue' => 5000,
            'total_cost' => 3000,
            'gross_profit' => 2000,
            'gross_profit_margin' => 40
        ]);
    }

    private function generateServiceSalesReport($shop_id, $data) {
        // Logic to aggregate service sales from work orders
        // Example response:
        echo json_encode([
            'total_service_hours' => 50,
            'total_service_revenue' => 7500,
            'total_cost' => 2500,
            'gross_profit' => 5000,
            'gross_profit_margin' => 66.67
        ]);
    }

    private function generateOverallSalesDashboard($shop_id, $data) {
        // Logic to combine parts and service sales for a dashboard
        // Example response:
        echo json_encode([
            'total_revenue' => 12500,
            'total_cost' => 5500,
            'gross_profit' => 7000,
            'gross_profit_margin' => 56
        ]);
    }
}