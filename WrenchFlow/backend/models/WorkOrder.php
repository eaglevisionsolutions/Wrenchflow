<?php

class WorkOrder {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createWorkOrder($shop_id, $customer_id, $vehicle_id, $order_date, $status) {
        $query = "INSERT INTO work_orders (shop_id, customer_id, vehicle_id, order_date, status) 
                  VALUES (:shop_id, :customer_id, :vehicle_id, :order_date, :status)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':customer_id', $customer_id);
        $stmt->bindParam(':vehicle_id', $vehicle_id);
        $stmt->bindParam(':order_date', $order_date);
        $stmt->bindParam(':status', $status);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function getWorkOrdersByShop($shop_id) {
        $query = "SELECT * FROM work_orders WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getWorkOrderById($shop_id, $work_order_id) {
        $query = "SELECT * FROM work_orders WHERE shop_id = :shop_id AND id = :work_order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':work_order_id', $work_order_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateWorkOrderStatus($shop_id, $work_order_id, $status) {
        $query = "UPDATE work_orders SET status = :status WHERE shop_id = :shop_id AND id = :work_order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':work_order_id', $work_order_id);
        $stmt->bindParam(':status', $status);
        return $stmt->execute();
    }
}