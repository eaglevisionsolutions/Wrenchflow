<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Customer.php';
require_once __DIR__ . '/BaseController.php';

class CustomerController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = Database::getConnection();
    }
    // GET /customers?shop_id=...
    public function getAll($shop_id) {
        $customers = Customer::all($shop_id);
        $result = array_map(function($c) { return $c->toArray(); }, $customers);
        $this->jsonResponse($result);
    }
    // POST /customers
    public function create($data) {
        // ...validate $data...
        $customer = new Customer();
        $customer->fromArray($data);
        $customer->save();
        $this->jsonResponse(['success' => true, 'customer_id' => $customer->customer_id], 201);
    }
    // GET /customers/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $customer = Customer::find($id);
        if ($customer && $customer->shop_id == $shop_id) {
            $this->jsonResponse($customer->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /customers
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $customer = Customer::find($data['customer_id']);
        if ($customer && $customer->shop_id == $data['shop_id']) {
            $customer->fromArray($data);
            $customer->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /customers?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $customer = Customer::find($id);
        if ($customer && $customer->shop_id == $shop_id) {
            $customer->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
