<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Sale.php';
require_once __DIR__ . '/BaseController.php';

class SaleController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /sales?shop_id=...
    public function getAll($shop_id) {
        $stmt = $this->db->prepare('SELECT * FROM sales WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $sales = $stmt->fetchAll();
        $this->jsonResponse($sales);
    }
    // POST /sales
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO sales (shop_id, customer_id, sale_date, total_sale_amount, total_cost_of_goods_sold) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['shop_id'], $data['customer_id'], $data['sale_date'], $data['total_sale_amount'], $data['total_cost_of_goods_sold']
        ]);
        $sale_id = $this->db->lastInsertId();
        $this->jsonResponse(['success' => true, 'sale_id' => $sale_id], 201);
    }
    // GET /sales/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('SELECT * FROM sales WHERE sale_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $sale = $stmt->fetch();
        if ($sale) {
            $this->jsonResponse($sale);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /sales
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $stmt = $this->db->prepare('UPDATE sales SET customer_id=?, sale_date=?, total_sale_amount=?, total_cost_of_goods_sold=? WHERE sale_id=? AND shop_id=?');
        $stmt->execute([
            $data['customer_id'], $data['sale_date'], $data['total_sale_amount'], $data['total_cost_of_goods_sold'], $data['sale_id'], $data['shop_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /sales?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('DELETE FROM sales WHERE sale_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $this->jsonResponse(['success' => true]);
    }
}
