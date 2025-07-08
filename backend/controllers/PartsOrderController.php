<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/PartsOrder.php';
require_once __DIR__ . '/BaseController.php';

class PartsOrderController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = Database::getConnection();
    }
    // GET /parts_orders?shop_id=...
    public function getAll($shop_id) {
        $orders = PartsOrder::all($shop_id);
        $result = array_map(function($o) { return $o->toArray(); }, $orders);
        $this->jsonResponse($result);
    }
    // POST /parts_orders
    public function create($data) {
        // ...validate $data...
        $order = new PartsOrder();
        $order->fromArray($data);
        $order->save();
        $this->jsonResponse(['success' => true, 'order_id' => $order->order_id], 201);
    }
    // GET /parts_orders/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $order = PartsOrder::find($id);
        if ($order && $order->shop_id == $shop_id) {
            $this->jsonResponse($order->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /parts_orders
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $order = PartsOrder::find($data['order_id']);
        if ($order && $order->shop_id == $data['shop_id']) {
            $order->fromArray($data);
            $order->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /parts_orders?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $order = PartsOrder::find($id);
        if ($order && $order->shop_id == $shop_id) {
            $order->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
