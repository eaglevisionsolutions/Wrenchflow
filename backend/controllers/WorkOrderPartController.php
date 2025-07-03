<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/WorkOrderPart.php';
require_once __DIR__ . '/BaseController.php';

class WorkOrderPartController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /work_order_parts?work_order_id=...
    public function getAll($work_order_id) {
        $stmt = $this->db->prepare('SELECT * FROM work_order_parts WHERE work_order_id = ?');
        $stmt->execute([$work_order_id]);
        $parts = $stmt->fetchAll();
        $this->jsonResponse($parts);
    }
    // POST /work_order_parts
    public function create($data) {
        $stmt = $this->db->prepare('INSERT INTO work_order_parts (work_order_id, part_id, quantity_used, is_bulk, volume_used, sale_price) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['work_order_id'], $data['part_id'], $data['quantity_used'], $data['is_bulk'], $data['volume_used'], $data['sale_price']
        ]);
        $work_order_part_id = $this->db->lastInsertId();
        $this->jsonResponse(['success' => true, 'work_order_part_id' => $work_order_part_id], 201);
    }
    // PUT /work_order_parts/{id}
    public function update($data) {
        $stmt = $this->db->prepare('UPDATE work_order_parts SET part_id=?, quantity_used=?, is_bulk=?, volume_used=?, sale_price=? WHERE work_order_part_id=?');
        $stmt->execute([
            $data['part_id'], $data['quantity_used'], $data['is_bulk'], $data['volume_used'], $data['sale_price'], $data['work_order_part_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /work_order_parts/{id}
    public function delete($id) {
        $stmt = $this->db->prepare('DELETE FROM work_order_parts WHERE work_order_part_id = ?');
        $stmt->execute([$id]);
        $this->jsonResponse(['success' => true]);
    }
}
