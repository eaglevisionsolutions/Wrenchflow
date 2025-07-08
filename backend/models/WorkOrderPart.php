<?php
require_once __DIR__ . '/../Database.php';

class WorkOrderPart {
    public $work_order_part_id;
    public $work_order_id;
    public $part_id;
    public $quantity_used;
    public $is_bulk;
    public $volume_used;
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
            'work_order_part_id' => $this->work_order_part_id,
            'work_order_id' => $this->work_order_id,
            'part_id' => $this->part_id,
            'quantity_used' => $this->quantity_used,
            'is_bulk' => $this->is_bulk,
            'volume_used' => $this->volume_used,
            'sale_price' => $this->sale_price
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->work_order_part_id) {
            $stmt = $db->prepare("UPDATE work_order_parts SET work_order_id=?, part_id=?, quantity_used=?, is_bulk=?, volume_used=?, sale_price=? WHERE work_order_part_id=?");
            $stmt->execute([
                $this->work_order_id,
                $this->part_id,
                $this->quantity_used,
                $this->is_bulk,
                $this->volume_used,
                $this->sale_price,
                $this->work_order_part_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO work_order_parts (work_order_id, part_id, quantity_used, is_bulk, volume_used, sale_price) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->work_order_id,
                $this->part_id,
                $this->quantity_used,
                $this->is_bulk,
                $this->volume_used,
                $this->sale_price
            ]);
            $this->work_order_part_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->work_order_part_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM work_order_parts WHERE work_order_part_id=?");
        $stmt->execute([$this->work_order_part_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM work_order_parts WHERE work_order_part_id=?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $obj = new self();
            $obj->fromArray($row);
            return $obj;
        }
        return null;
    }

    public static function all($work_order_id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM work_order_parts WHERE work_order_id=?");
        $stmt->execute([$work_order_id]);
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }
}
