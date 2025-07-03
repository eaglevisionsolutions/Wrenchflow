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
        $stmt = $this->db->prepare('SELECT * FROM work_order_services WHERE work_order_id = ?');
        $stmt->execute([$work_order_id]);
        $services = $stmt->fetchAll();
        $this->jsonResponse($services);
    }
    // POST /work_order_services
    public function create($data) {
        $stmt = $this->db->prepare('INSERT INTO work_order_services (work_order_id, service_description, hours_spent, labour_rate_at_time) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $data['work_order_id'], $data['service_description'], $data['hours_spent'], $data['labour_rate_at_time']
        ]);
        $work_order_service_id = $this->db->lastInsertId();
        $this->jsonResponse(['success' => true, 'work_order_service_id' => $work_order_service_id], 201);
    }
    // PUT /work_order_services/{id}
    public function update($data) {
        $stmt = $this->db->prepare('UPDATE work_order_services SET service_description=?, hours_spent=?, labour_rate_at_time=? WHERE work_order_service_id=?');
        $stmt->execute([
            $data['service_description'], $data['hours_spent'], $data['labour_rate_at_time'], $data['work_order_service_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /work_order_services/{id}
    public function delete($id) {
        $stmt = $this->db->prepare('DELETE FROM work_order_services WHERE work_order_service_id = ?');
        $stmt->execute([$id]);
        $this->jsonResponse(['success' => true]);
    }
}
