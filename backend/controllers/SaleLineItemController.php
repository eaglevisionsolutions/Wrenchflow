<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/SaleLineItem.php';
require_once __DIR__ . '/BaseController.php';

class SaleLineItemController extends BaseController {
    // GET /sale_line_items?sale_id=...
    public function getAll($sale_id) {
        $items = SaleLineItem::all($sale_id);
        $result = array_map(function($item) { return $item->toArray(); }, $items);
        $this->jsonResponse($result);
    }

    // GET /sale_line_items/{id}
    public function getById($id) {
        $item = SaleLineItem::find($id);
        if ($item) {
            $this->jsonResponse($item->toArray());
        } else {
            $this->jsonResponse(['error' => 'Not found'], 404);
        }
    }

    // POST /sale_line_items
    public function create($data) {
        $item = new SaleLineItem();
        $item->fromArray($data);
        $item->save();
        $this->jsonResponse($item->toArray(), 201);
    }

    // PUT /sale_line_items/{id}
    public function update($id, $data) {
        $item = SaleLineItem::find($id);
        if ($item) {
            $item->fromArray($data);
            $item->save();
            $this->jsonResponse($item->toArray());
        } else {
            $this->jsonResponse(['error' => 'Not found'], 404);
        }
    }

    // DELETE /sale_line_items/{id}
    public function delete($id) {
        $item = SaleLineItem::find($id);
        if ($item) {
            $item->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->jsonResponse(['error' => 'Not found'], 404);
        }
    }
}
