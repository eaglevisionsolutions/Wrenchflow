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
        public function getAll($shop_id) {
        $settings = ShopSetting::all($shop_id);
        $result = array_map(function($s) { return $s->toArray(); }, $settings);
        $this->jsonResponse($result);
    }

    public function get($shop_id) {
        $setting = ShopSetting::find($shop_id);
        if ($setting) {
            $this->jsonResponse($setting->toArray());
        } else {
            $this->jsonResponse(null);
        }
    }
    // POST /shop_settings
    public function create($data) {
        // ...validate $data...
        $setting = new ShopSetting();
        $setting->fromArray($data);
        $setting->create();
        $this->jsonResponse(['success' => true, 'shop_id' => $setting->shop_id], 201);
    }

    // PUT /shop_settings
    public function update($data) {
        // ...validate $data...
        $setting = new ShopSetting();
        $setting->fromArray($data);
        $setting->update();
        $this->jsonResponse(['success' => true, 'shop_id' => $setting->shop_id], 200);
    }
}
