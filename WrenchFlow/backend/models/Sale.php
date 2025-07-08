<?php

class Sale {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createSale($shop_id, $customer_id, $sale_date, $total_amount) {
        $query = "INSERT INTO sales (shop_id, customer_id, sale_date, total_amount) 
                  VALUES (:shop_id, :customer_id, :sale_date, :total_amount)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':customer_id', $customer_id);
        $stmt->bindParam(':sale_date', $sale_date);
        $stmt->bindParam(':total_amount', $total_amount);
        $stmt->execute();
        return $this->db->lastInsertId();
    }

    public function getSalesByShop($shop_id, $start_date = null, $end_date = null) {
        $query = "SELECT * FROM sales WHERE shop_id = :shop_id";
        if ($start_date && $end_date) {
            $query .= " AND sale_date BETWEEN :start_date AND :end_date";
        }
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        if ($start_date && $end_date) {
            $stmt->bindParam(':start_date', $start_date);
            $stmt->bindParam(':end_date', $end_date);
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}