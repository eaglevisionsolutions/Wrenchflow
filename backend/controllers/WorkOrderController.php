<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/WorkOrder.php';
require_once __DIR__ . '/BaseController.php';

class WorkOrderController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /work_orders?shop_id=...
    public function getAll($shop_id) {
        Auth::check();
        $stmt = $this->db->prepare('SELECT * FROM work_orders WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $orders = $stmt->fetchAll();
        $this->jsonResponse($orders);
    }
    // POST /work_orders
    public function create($data) {
        Auth::check();
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO work_orders (work_order_id, shop_id, equipment_id, customer_id, date_created, status, reported_problem, diagnosis, repair_notes, technician_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['work_order_id'], $data['shop_id'], $data['equipment_id'], $data['customer_id'], $data['date_created'],
            $data['status'], $data['reported_problem'], $data['diagnosis'], $data['repair_notes'], $data['technician_id']
        ]);
        $this->jsonResponse(['success' => true, 'work_order_id' => $data['work_order_id']], 201);
    }
    // GET /work_orders/{id}
    public function getById($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('SELECT * FROM work_orders WHERE work_order_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $order = $stmt->fetch();
        if ($order) {
            $this->jsonResponse($order);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /work_orders
    public function update($data) {
        Auth::check();
        AccessControl::requireShopAccess($data['shop_id']);
        $stmt = $this->db->prepare('UPDATE work_orders SET equipment_id=?, customer_id=?, date_created=?, status=?, reported_problem=?, diagnosis=?, repair_notes=?, technician_id=? WHERE work_order_id=? AND shop_id=?');
        $stmt->execute([
            $data['equipment_id'], $data['customer_id'], $data['date_created'], $data['status'], $data['reported_problem'], $data['diagnosis'], $data['repair_notes'], $data['technician_id'], $data['work_order_id'], $data['shop_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /work_orders?id=...&shop_id=...
    public function delete($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('DELETE FROM work_orders WHERE work_order_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $this->jsonResponse(['success' => true]);
    }
}
