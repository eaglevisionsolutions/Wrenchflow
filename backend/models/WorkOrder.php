<?php
require_once __DIR__ . '/../Database.php';

class WorkOrder {
    public $work_order_id;
    public $shop_id;
    public $equipment_id;
    public $customer_id;
    public $date_created;
    public $status;
    public $reported_problem;
    public $diagnosis;
    public $repair_notes;
    public $technician_id;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'work_order_id' => $this->work_order_id,
            'shop_id' => $this->shop_id,
            'equipment_id' => $this->equipment_id,
            'customer_id' => $this->customer_id,
            'date_created' => $this->date_created,
            'status' => $this->status,
            'reported_problem' => $this->reported_problem,
            'diagnosis' => $this->diagnosis,
            'repair_notes' => $this->repair_notes,
            'technician_id' => $this->technician_id
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->work_order_id) {
            $stmt = $db->prepare("UPDATE work_orders SET shop_id=?, equipment_id=?, customer_id=?, date_created=?, status=?, reported_problem=?, diagnosis=?, repair_notes=?, technician_id=? WHERE work_order_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->equipment_id,
                $this->customer_id,
                $this->date_created,
                $this->status,
                $this->reported_problem,
                $this->diagnosis,
                $this->repair_notes,
                $this->technician_id,
                $this->work_order_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO work_orders (shop_id, equipment_id, customer_id, date_created, status, reported_problem, diagnosis, repair_notes, technician_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->equipment_id,
                $this->customer_id,
                $this->date_created,
                $this->status,
                $this->reported_problem,
                $this->diagnosis,
                $this->repair_notes,
                $this->technician_id
            ]);
            $this->work_order_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->work_order_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM work_orders WHERE work_order_id=?");
        $stmt->execute([$this->work_order_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM work_orders WHERE work_order_id=?");
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
        $stmt = $db->prepare("SELECT * FROM work_orders WHERE shop_id=?");
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
