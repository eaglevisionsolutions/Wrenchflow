<?php
require_once __DIR__ . '/../session.php'; // Include session management
require_once __DIR__ . '/../Auth.php';
require_once __DIR__ . '/../AccessControl.php';
require_once __DIR__ . '/../models/WorkOrder.php';
require_once __DIR__ . '/../models/WorkOrderPart.php';
require_once __DIR__ . '/../models/WorkOrderService.php';

class WorkOrderController {
    private $workOrderModel;
    private $workOrderPartModel;
    private $workOrderServiceModel;
    private $auth;
    private $accessControl;

    public function __construct($db) {
        $this->workOrderModel = new WorkOrder($db);
        $this->workOrderPartModel = new WorkOrderPart($db);
        $this->workOrderServiceModel = new WorkOrderService($db);
        $this->auth = new Auth($db);
        $this->accessControl = new AccessControl($this->auth);

        // Protect endpoint for Service Employees and Shop Administrators
        $this->accessControl->checkAccess(['Service Employee', 'Shop Administrator']);
    }

    public function handleRequest($method, $shop_id, $data) {
        // Enforce shop-level access
        $this->accessControl->enforceShopScope($shop_id);

        switch ($method) {
            case 'POST':
                $this->createWorkOrder($shop_id, $data);
                break;
            case 'PUT':
                $this->updateWorkOrder($shop_id, $data);
                break;
            case 'GET':
                if (isset($data['id'])) {
                    $this->getWorkOrder($shop_id, $data['id']);
                } else {
                    $this->getAllWorkOrders($shop_id);
                }
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function createWorkOrder($shop_id, $data) {
        $work_order_id = $this->workOrderModel->createWorkOrder(
            $shop_id,
            $data['customer_id'],
            $data['vehicle_id'],
            $data['order_date'],
            'open'
        );

        foreach ($data['parts'] as $part) {
            $this->workOrderPartModel->addPartToWorkOrder(
                $shop_id,
                $work_order_id,
                $part['part_id'],
                $part['quantity_used'],
                $part['volume_used']
            );
        }

        foreach ($data['services'] as $service) {
            $this->workOrderServiceModel->addServiceToWorkOrder(
                $shop_id,
                $work_order_id,
                $service['service_name'],
                $service['service_cost']
            );
        }

        echo json_encode(['message' => 'Work order created successfully', 'work_order_id' => $work_order_id]);
    }

    private function updateWorkOrder($shop_id, $data) {
        $this->workOrderModel->updateWorkOrderStatus($shop_id, $data['id'], $data['status']);
        echo json_encode(['message' => 'Work order updated successfully']);
    }

    private function getWorkOrder($shop_id, $work_order_id) {
        $workOrder = $this->workOrderModel->getWorkOrderById($shop_id, $work_order_id);
        $parts = $this->workOrderPartModel->getPartsByWorkOrder($shop_id, $work_order_id);
        $services = $this->workOrderServiceModel->getServicesByWorkOrder($shop_id, $work_order_id);

        echo json_encode([
            'work_order' => $workOrder,
            'parts' => $parts,
            'services' => $services
        ]);
    }

    private function getAllWorkOrders($shop_id) {
        $workOrders = $this->workOrderModel->getWorkOrdersByShop($shop_id);
        echo json_encode($workOrders);
    }
}