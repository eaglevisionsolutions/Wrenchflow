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
    // GET /shops/:id
    public function get($shop_id) {
        $shop = Shop::find($shop_id);
        if ($shop) {
            $this->jsonResponse($shop->toArray());
        } else {
            $this->jsonResponse(['error' => 'Shop not found'], 404);
        }
    }

    // PUT /shops/:id
    public function update($data) {
        if (!isset($data['shop_id'])) {
            $this->jsonResponse(['error' => 'Missing shop_id'], 400);
            return;
        }
        $shop = Shop::find($data['shop_id']);
        if (!$shop) {
            $this->jsonResponse(['error' => 'Shop not found'], 404);
            return;
        }
        $shop->fromArray($data);
        $shop->save();
        $this->jsonResponse(['success' => true, 'shop_id' => $shop->shop_id], 200);
    }
}
