<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Customer.php';
require_once __DIR__ . '/BaseController.php';

class CustomerController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /customers?shop_id=...
    public function getAll($shop_id) {
        $stmt = $this->db->prepare('SELECT * FROM customers WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $customers = $stmt->fetchAll();
        $this->jsonResponse($customers);
    }
    // POST /customers
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO customers (shop_id, first_name, last_name, phone_number, email, address) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['shop_id'], $data['first_name'], $data['last_name'],
            $data['phone_number'], $data['email'], $data['address']
        ]);
        $customer_id = $this->db->lastInsertId();
        $this->jsonResponse(['success' => true, 'customer_id' => $customer_id], 201);
    }
    // GET /customers/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('SELECT * FROM customers WHERE customer_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $customer = $stmt->fetch();
        if ($customer) {
            $this->jsonResponse($customer);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /customers
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $stmt = $this->db->prepare('UPDATE customers SET first_name=?, last_name=?, phone_number=?, email=?, address=? WHERE customer_id=? AND shop_id=?');
        $stmt->execute([
            $data['first_name'], $data['last_name'], $data['phone_number'], $data['email'], $data['address'], $data['customer_id'], $data['shop_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /customers?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('DELETE FROM customers WHERE customer_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $this->jsonResponse(['success' => true]);
    }
}
