<?php

require_once __DIR__ . '/../session.php'; // Include session management
require_once __DIR__ . '/../Auth.php';
require_once __DIR__ . '/../AccessControl.php';
require_once __DIR__ . '/../models/WorkOrder.php';
require_once __DIR__ . '/../models/WorkOrderPart.php';
require_once __DIR__ . '/../models/WorkOrderService.php';

class ServiceHistoryController {
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

        if ($method === 'GET' && isset($data['equipment_id'])) {
            $this->getServiceHistory($shop_id, $data['equipment_id']);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function getServiceHistory($shop_id, $equipment_id) {
        $workOrders = $this->workOrderModel->getCompletedWorkOrdersByEquipment($shop_id, $equipment_id);

        foreach ($workOrders as &$workOrder) {
            $workOrder['parts'] = $this->workOrderPartModel->getPartsByWorkOrder($shop_id, $workOrder['id']);
            $workOrder['services'] = $this->workOrderServiceModel->getServicesByWorkOrder($shop_id, $workOrder['id']);
        }

        echo json_encode($workOrders);
    }
}