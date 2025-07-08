<?php
class Equipment {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createEquipment($shop_id, $customer_id, $name, $serial_number, $description) {
        $query = "INSERT INTO equipment (shop_id, customer_id, name, serial_number, description) 
                  VALUES (:shop_id, :customer_id, :name, :serial_number, :description)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':customer_id', $customer_id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':serial_number', $serial_number);
        $stmt->bindParam(':description', $description);
        return $stmt->execute();
    }

    public function getEquipmentByShop($shop_id) {
        $query = "SELECT * FROM equipment WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEquipmentById($shop_id, $equipment_id) {
        $query = "SELECT * FROM equipment WHERE shop_id = :shop_id AND id = :equipment_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':equipment_id', $equipment_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateEquipment($shop_id, $equipment_id, $name, $serial_number, $description) {
        $query = "UPDATE equipment SET name = :name, serial_number = :serial_number, description = :description 
                  WHERE shop_id = :shop_id AND id = :equipment_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':equipment_id', $equipment_id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':serial_number', $serial_number);
        $stmt->bindParam(':description', $description);
        return $stmt->execute();
    }

    public function deleteEquipment($shop_id, $equipment_id) {
        $query = "DELETE FROM equipment WHERE shop_id = :shop_id AND id = :equipment_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':equipment_id', $equipment_id);
        return $stmt->execute();
    }
}