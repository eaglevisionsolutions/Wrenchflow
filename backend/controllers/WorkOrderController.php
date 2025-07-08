<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/WorkOrder.php';
require_once __DIR__ . '/BaseController.php';

class WorkOrderController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = Database::getConnection();
    }
    // GET /work_orders?shop_id=...
    public function getAll($shop_id) {
        Auth::check();
        $orders = WorkOrder::all($shop_id);
        $result = array_map(function($o) { return $o->toArray(); }, $orders);
        $this->jsonResponse($result);
    }
    // POST /work_orders
    public function create($data) {
        Auth::check();
        // ...validate $data...
        $order = new WorkOrder();
        $order->fromArray($data);
        $order->save();
        $this->jsonResponse(['success' => true, 'work_order_id' => $order->work_order_id], 201);
    }
    // GET /work_orders/{id}
    public function getById($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $order = WorkOrder::find($id);
        if ($order && $order->shop_id == $shop_id) {
            $this->jsonResponse($order->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /work_orders
    public function update($data) {
        Auth::check();
        AccessControl::requireShopAccess($data['shop_id']);
        $order = WorkOrder::find($data['work_order_id']);
        if ($order && $order->shop_id == $data['shop_id']) {
            $order->fromArray($data);
            $order->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /work_orders?id=...&shop_id=...
    public function delete($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $order = WorkOrder::find($id);
        if ($order && $order->shop_id == $shop_id) {
            $order->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
