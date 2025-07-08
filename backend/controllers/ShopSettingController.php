<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/ShopSetting.php';
require_once __DIR__ . '/BaseController.php';

class ShopSettingController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = Database::getConnection();
    }
    // GET /shop_settings?shop_id=...
    public function get($shop_id) {
        $setting = ShopSetting::find($shop_id);
        if ($setting) {
            $this->jsonResponse($setting->toArray());
        } else {
            $this->jsonResponse(null);
        }
    }
    // POST /shop_settings
    public function createOrUpdate($data) {
        // ...validate $data...
        $setting = new ShopSetting();
        $setting->fromArray($data);
        $setting->save();
        $this->jsonResponse(['success' => true, 'shop_id' => $setting->shop_id], 201);
    }
}
