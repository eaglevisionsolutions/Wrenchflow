<?php
require_once __DIR__ . '/../Database.php';

class PartsOrderReceipt {
    public $receipt_id;
    public $order_id;
    public $line_item_id;
    public $received_quantity;
    public $vendor_invoice_number;
    public $actual_cost_per_unit;
    public $is_backordered;
    public $received_at;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'receipt_id' => $this->receipt_id,
            'order_id' => $this->order_id,
            'line_item_id' => $this->line_item_id,
            'received_quantity' => $this->received_quantity,
            'vendor_invoice_number' => $this->vendor_invoice_number,
            'actual_cost_per_unit' => $this->actual_cost_per_unit,
            'is_backordered' => $this->is_backordered,
            'received_at' => $this->received_at
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->receipt_id) {
            $stmt = $db->prepare("UPDATE parts_order_receipts SET order_id=?, line_item_id=?, received_quantity=?, vendor_invoice_number=?, actual_cost_per_unit=?, is_backordered=?, received_at=? WHERE receipt_id=?");
            $stmt->execute([
                $this->order_id,
                $this->line_item_id,
                $this->received_quantity,
                $this->vendor_invoice_number,
                $this->actual_cost_per_unit,
                $this->is_backordered,
                $this->received_at,
                $this->receipt_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO parts_order_receipts (order_id, line_item_id, received_quantity, vendor_invoice_number, actual_cost_per_unit, is_backordered, received_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->order_id,
                $this->line_item_id,
                $this->received_quantity,
                $this->vendor_invoice_number,
                $this->actual_cost_per_unit,
                $this->is_backordered,
                $this->received_at
            ]);
            $this->receipt_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->receipt_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM parts_order_receipts WHERE receipt_id=?");
        $stmt->execute([$this->receipt_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM parts_order_receipts WHERE receipt_id=?");
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
        $stmt = $db->prepare("SELECT * FROM parts_order_receipts WHERE order_id=?");
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
