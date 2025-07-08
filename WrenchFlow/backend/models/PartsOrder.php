<?php

class PartsOrder {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createPartsOrder($shop_id, $vendor_id, $order_date, $order_status) {
        $query = "INSERT INTO parts_orders (shop_id, vendor_id, order_date, order_status) 
                  VALUES (:shop_id, :vendor_id, :order_date, :order_status)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':vendor_id', $vendor_id);
        $stmt->bindParam(':order_date', $order_date);
        $stmt->bindParam(':order_status', $order_status);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function updateOrderStatus($shop_id, $order_id, $order_status) {
        $query = "UPDATE parts_orders SET order_status = :order_status 
                  WHERE shop_id = :shop_id AND id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->bindParam(':order_status', $order_status);
        return $stmt->execute();
    }

    public function getPartsOrderById($shop_id, $order_id) {
        $query = "SELECT * FROM parts_orders WHERE shop_id = :shop_id AND id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}