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
        $stmt = $this->db->prepare('SELECT * FROM vendors WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $vendors = $stmt->fetchAll();
        $this->jsonResponse($vendors);
    }
    // POST /vendors
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO vendors (shop_id, vendor_name, contact_person, phone_number, email, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['shop_id'], $data['vendor_name'], $data['contact_person'],
            $data['phone_number'], $data['email'], $data['address'], $data['notes']
        ]);
        $vendor_id = $this->db->lastInsertId();
        $this->jsonResponse(['success' => true, 'vendor_id' => $vendor_id], 201);
    }
    // GET /vendors/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('SELECT * FROM vendors WHERE vendor_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $vendor = $stmt->fetch();
        if ($vendor) {
            $this->jsonResponse($vendor);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /vendors
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $stmt = $this->db->prepare('UPDATE vendors SET vendor_name=?, contact_person=?, phone_number=?, email=?, address=?, notes=? WHERE vendor_id=? AND shop_id=?');
        $stmt->execute([
            $data['vendor_name'], $data['contact_person'], $data['phone_number'], $data['email'], $data['address'], $data['notes'], $data['vendor_id'], $data['shop_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /vendors?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('DELETE FROM vendors WHERE vendor_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $this->jsonResponse(['success' => true]);
    }
}
