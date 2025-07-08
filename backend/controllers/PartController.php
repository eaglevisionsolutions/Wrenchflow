<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Part.php';
require_once __DIR__ . '/BaseController.php';

class PartController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = Database::getConnection();
    }
    // GET /parts?shop_id=...
    public function getAll($shop_id) {
        Auth::check();
        $parts = Part::all($shop_id);
        $result = array_map(function($p) { return $p->toArray(); }, $parts);
        $this->jsonResponse($result);
    }
    // POST /parts
    public function create($data) {
        Auth::check();
        // ...validate $data...
        $part = new Part();
        $part->fromArray($data);
        $part->save();
        $this->jsonResponse(['success' => true, 'part_id' => $part->part_id], 201);
    }
    // GET /parts/{id}
    public function getById($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $part = Part::find($id);
        if ($part && $part->shop_id == $shop_id) {
            $this->jsonResponse($part->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /parts
    public function update($data) {
        Auth::check();
        AccessControl::requireShopAccess($data['shop_id']);
        $part = Part::find($data['part_id']);
        if ($part && $part->shop_id == $data['shop_id']) {
            $part->fromArray($data);
            $part->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /parts?id=...&shop_id=...
    public function delete($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $part = Part::find($id);
        if ($part && $part->shop_id == $shop_id) {
            $part->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
