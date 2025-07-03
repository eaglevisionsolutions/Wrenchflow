<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Equipment.php';
require_once __DIR__ . '/BaseController.php';

class EquipmentController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /equipment?shop_id=...
    public function getAll($shop_id) {
        $stmt = $this->db->prepare('SELECT * FROM equipment WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $equipment = $stmt->fetchAll();
        $this->jsonResponse($equipment);
    }
    // POST /equipment
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO equipment (shop_id, customer_id, unit_type, make, model_number, serial_number, purchase_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['shop_id'], $data['customer_id'], $data['unit_type'],
            $data['make'], $data['model_number'], $data['serial_number'], $data['purchase_date'], $data['notes']
        ]);
        $equipment_id = $this->db->lastInsertId();
        $this->jsonResponse(['success' => true, 'equipment_id' => $equipment_id], 201);
    }
    // GET /equipment/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('SELECT * FROM equipment WHERE equipment_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $equipment = $stmt->fetch();
        if ($equipment) {
            $this->jsonResponse($equipment);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /equipment
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $stmt = $this->db->prepare('UPDATE equipment SET customer_id=?, unit_type=?, make=?, model_number=?, serial_number=?, purchase_date=?, notes=? WHERE equipment_id=? AND shop_id=?');
        $stmt->execute([
            $data['customer_id'], $data['unit_type'], $data['make'], $data['model_number'], $data['serial_number'], $data['purchase_date'], $data['notes'], $data['equipment_id'], $data['shop_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /equipment?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('DELETE FROM equipment WHERE equipment_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $this->jsonResponse(['success' => true]);
    }
}
