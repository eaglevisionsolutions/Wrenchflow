<?php

class Shop {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }

    public function createShop($shopName) {
        $query = "INSERT INTO shops (shop_name) VALUES (:shop_name)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_name', $shopName);
        return $stmt->execute();
    }

    public function getShop($shopId) {
        $query = "SELECT * FROM shops WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shopId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAllShops() {
        $query = "SELECT * FROM shops";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateShop($shopId, $shopName) {
        $query = "UPDATE shops SET shop_name = :shop_name WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_name', $shopName);
        $stmt->bindParam(':shop_id', $shopId);
        return $stmt->execute();
    }

    public function deleteShop($shopId) {
        $query = "DELETE FROM shops WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shopId);
        return $stmt->execute();
    }
}