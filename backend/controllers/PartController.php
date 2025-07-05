<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Part.php';
require_once __DIR__ . '/BaseController.php';

class PartController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /parts?shop_id=...
    public function getAll($shop_id) {
        Auth::check();
        $stmt = $this->db->prepare('SELECT * FROM parts WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $parts = $stmt->fetchAll();
        $this->jsonResponse($parts);
    }
    // POST /parts
    public function create($data) {
        Auth::check();
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO parts (shop_id, part_name, part_number, description, cost_price, sale_price, quantity_on_hand, minimum_stock_level, bin_location, is_bulk, bulk_unit_measure, bulk_total_cost_delivery, bulk_total_volume_delivered, bulk_markup_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['shop_id'], $data['part_name'], $data['part_number'], $data['description'],
            $data['cost_price'], $data['sale_price'], $data['quantity_on_hand'], $data['minimum_stock_level'], $data['bin_location'],
            $data['is_bulk'], $data['bulk_unit_measure'], $data['bulk_total_cost_delivery'], $data['bulk_total_volume_delivered'], $data['bulk_markup_percentage']
        ]);
        $part_id = $this->db->lastInsertId();
        $this->jsonResponse(['success' => true, 'part_id' => $part_id], 201);
    }
    // GET /parts/{id}
    public function getById($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('SELECT * FROM parts WHERE part_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $part = $stmt->fetch();
        if ($part) {
            $this->jsonResponse($part);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /parts
    public function update($data) {
        Auth::check();
        AccessControl::requireShopAccess($data['shop_id']);
        $stmt = $this->db->prepare('UPDATE parts SET part_name=?, part_number=?, description=?, cost_price=?, sale_price=?, quantity_on_hand=?, minimum_stock_level=?, bin_location=?, is_bulk=?, bulk_unit_measure=?, bulk_total_cost_delivery=?, bulk_total_volume_delivered=?, bulk_markup_percentage=? WHERE part_id=? AND shop_id=?');
        $stmt->execute([
            $data['part_name'], $data['part_number'], $data['description'], $data['cost_price'], $data['sale_price'], $data['quantity_on_hand'], $data['minimum_stock_level'], $data['bin_location'], $data['is_bulk'], $data['bulk_unit_measure'], $data['bulk_total_cost_delivery'], $data['bulk_total_volume_delivered'], $data['bulk_markup_percentage'], $data['part_id'], $data['shop_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /parts?id=...&shop_id=...
    public function delete($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('DELETE FROM parts WHERE part_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $this->jsonResponse(['success' => true]);
    }
}
