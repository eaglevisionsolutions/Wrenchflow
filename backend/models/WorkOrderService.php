<?php
require_once __DIR__ . '/../Database.php';

class WorkOrderService {
    public $work_order_service_id;
    public $work_order_id;
    public $service_description;
    public $hours_spent;
    public $labour_rate_at_time;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'work_order_service_id' => $this->work_order_service_id,
            'work_order_id' => $this->work_order_id,
            'service_description' => $this->service_description,
            'hours_spent' => $this->hours_spent,
            'labour_rate_at_time' => $this->labour_rate_at_time
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->work_order_service_id) {
            $stmt = $db->prepare("UPDATE work_order_services SET work_order_id=?, service_description=?, hours_spent=?, labour_rate_at_time=? WHERE work_order_service_id=?");
            $stmt->execute([
                $this->work_order_id,
                $this->service_description,
                $this->hours_spent,
                $this->labour_rate_at_time,
                $this->work_order_service_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO work_order_services (work_order_id, service_description, hours_spent, labour_rate_at_time) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $this->work_order_id,
                $this->service_description,
                $this->hours_spent,
                $this->labour_rate_at_time
            ]);
            $this->work_order_service_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->work_order_service_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM work_order_services WHERE work_order_service_id=?");
        $stmt->execute([$this->work_order_service_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM work_order_services WHERE work_order_service_id=?");
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
        $stmt = $db->prepare("SELECT * FROM work_order_services WHERE work_order_id=?");
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
