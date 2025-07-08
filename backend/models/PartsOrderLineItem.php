<?php
require_once __DIR__ . '/../Database.php';

class PartsOrderLineItem {
    public $line_item_id;
    public $order_id;
    public $part_id;
    public $ordered_quantity;
    public $unit_cost_at_order;
    public $is_new_part;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'line_item_id' => $this->line_item_id,
            'order_id' => $this->order_id,
            'part_id' => $this->part_id,
            'ordered_quantity' => $this->ordered_quantity,
            'unit_cost_at_order' => $this->unit_cost_at_order,
            'is_new_part' => $this->is_new_part
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->line_item_id) {
            $stmt = $db->prepare("UPDATE parts_order_line_items SET order_id=?, part_id=?, ordered_quantity=?, unit_cost_at_order=?, is_new_part=? WHERE line_item_id=?");
            $stmt->execute([
                $this->order_id,
                $this->part_id,
                $this->ordered_quantity,
                $this->unit_cost_at_order,
                $this->is_new_part,
                $this->line_item_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO parts_order_line_items (order_id, part_id, ordered_quantity, unit_cost_at_order, is_new_part) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->order_id,
                $this->part_id,
                $this->ordered_quantity,
                $this->unit_cost_at_order,
                $this->is_new_part
            ]);
            $this->line_item_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->line_item_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM parts_order_line_items WHERE line_item_id=?");
        $stmt->execute([$this->line_item_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM parts_order_line_items WHERE line_item_id=?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $obj = new self();
            $obj->fromArray($row);
            return $obj;
        }
        return null;
    }

    public static function all($order_id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM parts_order_line_items WHERE order_id=?");
        $stmt->execute([$order_id]);
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }
}
