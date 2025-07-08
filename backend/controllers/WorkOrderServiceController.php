<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/WorkOrderService.php';
require_once __DIR__ . '/BaseController.php';

class WorkOrderServiceController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /work_order_services?work_order_id=...
    public function getAll($work_order_id) {
        $services = WorkOrderService::all($work_order_id);
        $result = array_map(function($s) { return $s->toArray(); }, $services);
        $this->jsonResponse($result);
    }
    // POST /work_order_services
    public function create($data) {
        $service = new WorkOrderService();
        $service->fromArray($data);
        $service->save();
        $this->jsonResponse(['success' => true, 'work_order_service_id' => $service->work_order_service_id], 201);
    }
    // PUT /work_order_services/{id}
    public function update($data) {
        $service = WorkOrderService::find($data['work_order_service_id']);
        if ($service) {
            $service->fromArray($data);
            $service->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /work_order_services/{id}
    public function delete($id) {
        $service = WorkOrderService::find($id);
        if ($service) {
            $service->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
