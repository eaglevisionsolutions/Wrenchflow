<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Vendor.php';
require_once __DIR__ . '/BaseController.php';

class VendorController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /vendors?shop_id=...
    public function getAll($shop_id) {
        Auth::check();
        $vendors = Vendor::all($shop_id);
        $result = array_map(function($v) { return $v->toArray(); }, $vendors);
        $this->jsonResponse($result);
    }
    // POST /vendors
    public function create($data) {
        Auth::check();
        // ...validate $data...
        $vendor = new Vendor();
        $vendor->fromArray($data);
        $vendor->save();
        $this->jsonResponse(['success' => true, 'vendor_id' => $vendor->vendor_id], 201);
    }
    // GET /vendors/{id}
    public function getById($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $vendor = Vendor::find($id);
        if ($vendor && $vendor->shop_id == $shop_id) {
            $this->jsonResponse($vendor->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /vendors
    public function update($data) {
        Auth::check();
        AccessControl::requireShopAccess($data['shop_id']);
        $vendor = Vendor::find($data['vendor_id']);
        if ($vendor && $vendor->shop_id == $data['shop_id']) {
            $vendor->fromArray($data);
            $vendor->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /vendors?id=...&shop_id=...
    public function delete($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $vendor = Vendor::find($id);
        if ($vendor && $vendor->shop_id == $shop_id) {
            $vendor->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
