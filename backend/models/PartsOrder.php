<?php
require_once __DIR__ . '/../Database.php';

class PartsOrder {
    public $order_id;
    public $shop_id;
    public $order_date;
    public $expected_delivery_date;
    public $vendor_id;
    public $order_status;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'order_id' => $this->order_id,
            'shop_id' => $this->shop_id,
            'order_date' => $this->order_date,
            'expected_delivery_date' => $this->expected_delivery_date,
            'vendor_id' => $this->vendor_id,
            'order_status' => $this->order_status
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->order_id) {
            $stmt = $db->prepare("UPDATE parts_orders SET shop_id=?, order_date=?, expected_delivery_date=?, vendor_id=?, order_status=? WHERE order_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->order_date,
                $this->expected_delivery_date,
                $this->vendor_id,
                $this->order_status,
                $this->order_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO parts_orders (shop_id, order_date, expected_delivery_date, vendor_id, order_status) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->order_date,
                $this->expected_delivery_date,
                $this->vendor_id,
                $this->order_status
            ]);
            $this->order_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->order_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM parts_orders WHERE order_id=?");
        $stmt->execute([$this->order_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM parts_orders WHERE order_id=?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $obj = new self();
            $obj->fromArray($row);
            return $obj;
        }
        return null;
    }

    public static function all($shop_id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM parts_orders WHERE shop_id=?");
        $stmt->execute([$shop_id]);
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }
}
