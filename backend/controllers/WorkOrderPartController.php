<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/WorkOrderPart.php';
require_once __DIR__ . '/BaseController.php';

class WorkOrderPartController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = Database::getConnection();
    }
    // GET /work_order_parts?work_order_id=...
    public function getAll($work_order_id) {
        $parts = WorkOrderPart::all($work_order_id);
        $result = array_map(function($p) { return $p->toArray(); }, $parts);
        $this->jsonResponse($result);
    }
    // POST /work_order_parts
    public function create($data) {
        $part = new WorkOrderPart();
        $part->fromArray($data);
        $part->save();
        $this->jsonResponse(['success' => true, 'work_order_part_id' => $part->work_order_part_id], 201);
    }
    // PUT /work_order_parts/{id}
    public function update($data) {
        $part = WorkOrderPart::find($data['work_order_part_id']);
        if ($part) {
            $part->fromArray($data);
            $part->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /work_order_parts/{id}
    public function delete($id) {
        $part = WorkOrderPart::find($id);
        if ($part) {
            $part->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
