<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/ShopSetting.php';
require_once __DIR__ . '/BaseController.php';

class ShopSettingController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /shop_settings?shop_id=...
    public function get($shop_id) {
        $stmt = $this->db->prepare('SELECT * FROM shop_settings WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $setting = $stmt->fetch();
        $this->jsonResponse($setting);
    }
    // POST /shop_settings
    public function createOrUpdate($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('REPLACE INTO shop_settings (shop_id, shop_labour_rate) VALUES (?, ?)');
        $stmt->execute([
            $data['shop_id'], $data['shop_labour_rate']
        ]);
        $this->jsonResponse(['success' => true, 'shop_id' => $data['shop_id']], 201);
    }
}
