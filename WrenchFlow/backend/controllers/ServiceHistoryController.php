<?php

require_once __DIR__ . '/../models/WorkOrder.php';
require_once __DIR__ . '/../models/WorkOrderPart.php';
require_once __DIR__ . '/../models/WorkOrderService.php';

class ServiceHistoryController {
    private $workOrderModel;
    private $workOrderPartModel;
    private $workOrderServiceModel;

    public function __construct($db) {
        $this->workOrderModel = new WorkOrder($db);
        $this->workOrderPartModel = new WorkOrderPart($db);
        $this->workOrderServiceModel = new WorkOrderService($db);
    }

    public function handleRequest($method, $shop_id, $data) {
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