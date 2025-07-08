<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Sale.php';
require_once __DIR__ . '/BaseController.php';

class SaleController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /sales?shop_id=...
    public function getAll($shop_id) {
        $sales = Sale::all($shop_id);
        $result = array_map(function($s) { return $s->toArray(); }, $sales);
        $this->jsonResponse($result);
    }
    // POST /sales
    public function create($data) {
        // ...validate $data...
        $sale = new Sale();
        $sale->fromArray($data);
        $sale->save();
        $this->jsonResponse(['success' => true, 'sale_id' => $sale->sale_id], 201);
    }
    // GET /sales/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $sale = Sale::find($id);
        if ($sale && $sale->shop_id == $shop_id) {
            $this->jsonResponse($sale->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /sales
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $sale = Sale::find($data['sale_id']);
        if ($sale && $sale->shop_id == $data['shop_id']) {
            $sale->fromArray($data);
            $sale->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /sales?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $sale = Sale::find($id);
        if ($sale && $sale->shop_id == $shop_id) {
            $sale->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
