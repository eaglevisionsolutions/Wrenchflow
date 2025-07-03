<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/PartsOrder.php';
require_once __DIR__ . '/BaseController.php';

class PartsOrderController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /parts_orders?shop_id=...
    public function getAll($shop_id) {
        $stmt = $this->db->prepare('SELECT * FROM parts_orders WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $orders = $stmt->fetchAll();
        $this->jsonResponse($orders);
    }
    // POST /parts_orders
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO parts_orders (shop_id, order_date, expected_delivery_date, vendor_id, order_status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['shop_id'], $data['order_date'], $data['expected_delivery_date'], $data['vendor_id'], $data['order_status']
        ]);
        $order_id = $this->db->lastInsertId();
        $this->jsonResponse(['success' => true, 'order_id' => $order_id], 201);
    }
    // GET /parts_orders/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('SELECT * FROM parts_orders WHERE order_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $order = $stmt->fetch();
        if ($order) {
            $this->jsonResponse($order);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /parts_orders
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $stmt = $this->db->prepare('UPDATE parts_orders SET order_date=?, expected_delivery_date=?, vendor_id=?, order_status=? WHERE order_id=? AND shop_id=?');
        $stmt->execute([
            $data['order_date'], $data['expected_delivery_date'], $data['vendor_id'], $data['order_status'], $data['order_id'], $data['shop_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /parts_orders?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('DELETE FROM parts_orders WHERE order_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $this->jsonResponse(['success' => true]);
    }
}
