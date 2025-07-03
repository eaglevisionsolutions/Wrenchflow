<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Shop.php';
require_once __DIR__ . '/BaseController.php';

class ShopController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /shops
    public function getAll() {
        $stmt = $this->db->query('SELECT * FROM shops');
        $shops = $stmt->fetchAll();
        $this->jsonResponse($shops);
    }
    // POST /shops
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO shops (shop_id, shop_name, subscription_status, billing_email) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            $data['shop_id'], $data['shop_name'], $data['subscription_status'], $data['billing_email']
        ]);
        $this->jsonResponse(['success' => true, 'shop_id' => $data['shop_id']], 201);
    }
    // ...add update, delete, getById methods...
}
