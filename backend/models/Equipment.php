<?php
require_once __DIR__ . '/../Database.php';

class Equipment {
    public $equipment_id;
    public $shop_id;
    public $customer_id;
    public $unit_type;
    public $make;
    public $model_number;
    public $serial_number;
    public $purchase_date;
    public $notes;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'equipment_id' => $this->equipment_id,
            'shop_id' => $this->shop_id,
            'customer_id' => $this->customer_id,
            'unit_type' => $this->unit_type,
            'make' => $this->make,
            'model_number' => $this->model_number,
            'serial_number' => $this->serial_number,
            'purchase_date' => $this->purchase_date,
            'notes' => $this->notes
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->equipment_id) {
            $stmt = $db->prepare("UPDATE equipment SET shop_id=?, customer_id=?, unit_type=?, make=?, model_number=?, serial_number=?, purchase_date=?, notes=? WHERE equipment_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->customer_id,
                $this->unit_type,
                $this->make,
                $this->model_number,
                $this->serial_number,
                $this->purchase_date,
                $this->notes,
                $this->equipment_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO equipment (shop_id, customer_id, unit_type, make, model_number, serial_number, purchase_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->customer_id,
                $this->unit_type,
                $this->make,
                $this->model_number,
                $this->serial_number,
                $this->purchase_date,
                $this->notes
            ]);
            $this->equipment_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->equipment_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM equipment WHERE equipment_id=?");
        $stmt->execute([$this->equipment_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM equipment WHERE equipment_id=?");
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
        $stmt = $db->prepare("SELECT * FROM equipment WHERE shop_id=?");
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
