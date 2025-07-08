<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Shop.php';
require_once __DIR__ . '/BaseController.php';

class ShopController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = Database::getConnection();
    }
    // GET /shops
    public function getAll() {
        $shops = Shop::all();
        $result = array_map(function($s) { return $s->toArray(); }, $shops);
        $this->jsonResponse($result);
    }
    // POST /shops
    public function create($data) {
        // ...validate $data...
        $shop = new Shop();
        $shop->fromArray($data);
        $shop->save();
        $this->jsonResponse(['success' => true, 'shop_id' => $shop->shop_id], 201);
    }
    // You may want to add update, delete, getById methods here as in other controllers
    // ...add update, delete, getById methods...
}
