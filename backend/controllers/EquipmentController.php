<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Equipment.php';
require_once __DIR__ . '/BaseController.php';

class EquipmentController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /equipment?shop_id=...
    public function getAll($shop_id) {
        $equipment = Equipment::all($shop_id);
        $result = array_map(function($e) { return $e->toArray(); }, $equipment);
        $this->jsonResponse($result);
    }
    // POST /equipment
    public function create($data) {
        // ...validate $data...
        $equipment = new Equipment();
        $equipment->fromArray($data);
        $equipment->save();
        $this->jsonResponse(['success' => true, 'equipment_id' => $equipment->equipment_id], 201);
    }
    // GET /equipment/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $equipment = Equipment::find($id);
        if ($equipment && $equipment->shop_id == $shop_id) {
            $this->jsonResponse($equipment->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /equipment
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $equipment = Equipment::find($data['equipment_id']);
        if ($equipment && $equipment->shop_id == $data['shop_id']) {
            $equipment->fromArray($data);
            $equipment->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /equipment?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $equipment = Equipment::find($id);
        if ($equipment && $equipment->shop_id == $shop_id) {
            $equipment->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
