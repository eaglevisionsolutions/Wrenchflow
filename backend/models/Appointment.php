<?php
class Appointment {
    public $appointment_id;
    public $shop_id;
    public $customer_id;
    public $equipment_id;
    public $appointment_date;
    public $appointment_time;
    public $service_type;
    public $notes;
    public $status;
    // Populate properties from an associative array
    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    // Export properties as an associative array
    public function toArray() {
        return [
            'appointment_id' => $this->appointment_id,
            'shop_id' => $this->shop_id,
            'customer_id' => $this->customer_id,
            'equipment_id' => $this->equipment_id,
            'appointment_date' => $this->appointment_date,
            'appointment_time' => $this->appointment_time,
            'service_type' => $this->service_type,
            'notes' => $this->notes,
            'status' => $this->status
        ];
    }

    // Save (insert or update) this appointment
    public function save() {
        $db = Database::getConnection();
        if ($this->appointment_id) {
            // Update
            $stmt = $db->prepare("UPDATE appointments SET shop_id=?, customer_id=?, equipment_id=?, appointment_date=?, appointment_time=?, service_type=?, notes=?, status=? WHERE appointment_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->customer_id,
                $this->equipment_id,
                $this->appointment_date,
                $this->appointment_time,
                $this->service_type,
                $this->notes,
                $this->status,
                $this->appointment_id
            ]);
        } else {
            // Insert
            $stmt = $db->prepare("INSERT INTO appointments (shop_id, customer_id, equipment_id, appointment_date, appointment_time, service_type, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->customer_id,
                $this->equipment_id,
                $this->appointment_date,
                $this->appointment_time,
                $this->service_type,
                $this->notes,
                $this->status
            ]);
            $this->appointment_id = $db->lastInsertId();
        }
    }

    // Delete this appointment
    public function delete() {
        if (!$this->appointment_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM appointments WHERE appointment_id=?");
        $stmt->execute([$this->appointment_id]);
    }

    // Find an appointment by ID
    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM appointments WHERE appointment_id=?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $appt = new self();
            $appt->fromArray($row);
            return $appt;
        }
        return null;
    }

    // Get all appointments for a shop
    public static function all($shop_id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM appointments WHERE shop_id=?");
        $stmt->execute([$shop_id]);
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $appt = new self();
            $appt->fromArray($row);
            $results[] = $appt;
        }
        return $results;
    }
}
