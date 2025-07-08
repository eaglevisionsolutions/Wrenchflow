<?php

class Appointment {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createAppointment($shop_id, $customer_id, $equipment_id, $appointment_date, $appointment_time, $status) {
        $query = "INSERT INTO appointments (shop_id, customer_id, equipment_id, appointment_date, appointment_time, status) 
                  VALUES (:shop_id, :customer_id, :equipment_id, :appointment_date, :appointment_time, :status)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':customer_id', $customer_id);
        $stmt->bindParam(':equipment_id', $equipment_id);
        $stmt->bindParam(':appointment_date', $appointment_date);
        $stmt->bindParam(':appointment_time', $appointment_time);
        $stmt->bindParam(':status', $status);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function getAppointmentsByShop($shop_id) {
        $query = "SELECT a.*, c.first_name AS customer_first_name, c.last_name AS customer_last_name, 
                         e.name AS equipment_name, e.serial_number AS equipment_serial_number
                  FROM appointments a
                  INNER JOIN customers c ON a.customer_id = c.id
                  INNER JOIN equipment e ON a.equipment_id = e.id
                  WHERE a.shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAppointmentById($shop_id, $appointment_id) {
        $query = "SELECT a.*, c.first_name AS customer_first_name, c.last_name AS customer_last_name, 
                         e.name AS equipment_name, e.serial_number AS equipment_serial_number
                  FROM appointments a
                  INNER JOIN customers c ON a.customer_id = c.id
                  INNER JOIN equipment e ON a.equipment_id = e.id
                  WHERE a.shop_id = :shop_id AND a.id = :appointment_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':appointment_id', $appointment_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateAppointment($shop_id, $appointment_id, $appointment_date, $appointment_time, $status) {
        $query = "UPDATE appointments SET appointment_date = :appointment_date, appointment_time = :appointment_time, 
                  status = :status WHERE shop_id = :shop_id AND id = :appointment_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':appointment_id', $appointment_id);
        $stmt->bindParam(':appointment_date', $appointment_date);
        $stmt->bindParam(':appointment_time', $appointment_time);
        $stmt->bindParam(':status', $status);
        return $stmt->execute();
    }

    public function deleteAppointment($shop_id, $appointment_id) {
        $query = "DELETE FROM appointments WHERE shop_id = :shop_id AND id = :appointment_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':appointment_id', $appointment_id);
        return $stmt->execute();
    }
}