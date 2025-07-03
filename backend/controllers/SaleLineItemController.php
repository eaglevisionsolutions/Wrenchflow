<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/SaleLineItem.php';
require_once __DIR__ . '/BaseController.php';

class SaleLineItemController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /sale_line_items?sale_id=...&shop_id=...
    public function getAll($sale_id, $shop_id) {
        $stmt = $this->db->prepare('SELECT * FROM sale_line_items WHERE sale_id = ?');
        $stmt->execute([$sale_id]);
        $items = $stmt->fetchAll();
        $this->jsonResponse($items);
    }
    // (Other CRUD methods can be added as needed)
}
