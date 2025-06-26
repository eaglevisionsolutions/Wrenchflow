<?php

class Part {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createPart($shop_id, $name, $part_number, $type, $quantity, $cost_per_unit, $markup_percentage, $sale_price_per_unit) {
        $query = "INSERT INTO parts (shop_id, name, part_number, type, quantity, cost_per_unit, markup_percentage, sale_price_per_unit) 
                  VALUES (:shop_id, :name, :part_number, :type, :quantity, :cost_per_unit, :markup_percentage, :sale_price_per_unit)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':part_number', $part_number);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':cost_per_unit', $cost_per_unit);
        $stmt->bindParam(':markup_percentage', $markup_percentage);
        $stmt->bindParam(':sale_price_per_unit', $sale_price_per_unit);
        return $stmt->execute();
    }

    public function getPartsByShop($shop_id) {
        $query = "SELECT * FROM parts WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPartById($shop_id, $part_id) {
        $query = "SELECT * FROM parts WHERE shop_id = :shop_id AND id = :part_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updatePart($shop_id, $part_id, $name, $part_number, $type, $quantity, $cost_per_unit, $markup_percentage, $sale_price_per_unit) {
        $query = "UPDATE parts SET name = :name, part_number = :part_number, type = :type, quantity = :quantity, 
                  cost_per_unit = :cost_per_unit, markup_percentage = :markup_percentage, sale_price_per_unit = :sale_price_per_unit 
                  WHERE shop_id = :shop_id AND id = :part_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':part_number', $part_number);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':quantity', $quantity);
        $stmt->bindParam(':cost_per_unit', $cost_per_unit);
        $stmt->bindParam(':markup_percentage', $markup_percentage);
        $stmt->bindParam(':sale_price_per_unit', $sale_price_per_unit);
        return $stmt->execute();
    }

    public function deletePart($shop_id, $part_id) {
        $query = "DELETE FROM parts WHERE shop_id = :shop_id AND id = :part_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':part_id', $part_id);
        return $stmt->execute();
    }
}