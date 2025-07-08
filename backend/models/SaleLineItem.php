<?php
require_once __DIR__ . '/../Database.php';

class SaleLineItem {
    public $sale_line_item_id;
    public $sale_id;
    public $part_id;
    public $quantity_sold;
    public $is_bulk;
    public $volume_sold;
    public $sale_price;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'sale_line_item_id' => $this->sale_line_item_id,
            'sale_id' => $this->sale_id,
            'part_id' => $this->part_id,
            'quantity_sold' => $this->quantity_sold,
            'is_bulk' => $this->is_bulk,
            'volume_sold' => $this->volume_sold,
            'sale_price' => $this->sale_price
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->sale_line_item_id) {
            $stmt = $db->prepare("UPDATE sale_line_items SET sale_id=?, part_id=?, quantity_sold=?, is_bulk=?, volume_sold=?, sale_price=? WHERE sale_line_item_id=?");
            $stmt->execute([
                $this->sale_id,
                $this->part_id,
                $this->quantity_sold,
                $this->is_bulk,
                $this->volume_sold,
                $this->sale_price,
                $this->sale_line_item_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO sale_line_items (sale_id, part_id, quantity_sold, is_bulk, volume_sold, sale_price) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->sale_id,
                $this->part_id,
                $this->quantity_sold,
                $this->is_bulk,
                $this->volume_sold,
                $this->sale_price
            ]);
            $this->sale_line_item_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->sale_line_item_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM sale_line_items WHERE sale_line_item_id=?");
        $stmt->execute([$this->sale_line_item_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM sale_line_items WHERE sale_line_item_id=?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $obj = new self();
            $obj->fromArray($row);
            return $obj;
        }
        return null;
    }

    public static function all($sale_id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM sale_line_items WHERE sale_id=?");
        $stmt->execute([$sale_id]);
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }
}
