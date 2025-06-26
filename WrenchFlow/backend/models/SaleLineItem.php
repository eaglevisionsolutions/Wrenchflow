<?php

class SaleLineItem {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function addLineItem($sale_id, $part_id, $quantity_sold, $sale_price) {
        $query = "INSERT INTO sale_line_items (sale_id, part_id, quantity_sold, sale_price) 
                  VALUES (:sale_id, :part_id, :quantity_sold, :sale_price)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':sale_id', $sale_id);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->bindParam(':quantity_sold', $quantity_sold);
        $stmt->bindParam(':sale_price', $sale_price);
        return $stmt->execute();
    }

    public function getLineItemsBySale($sale_id) {
        $query = "SELECT sli.*, p.part_name, p.part_number 
                  FROM sale_line_items sli
                  INNER JOIN parts p ON sli.part_id = p.id
                  WHERE sli.sale_id = :sale_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':sale_id', $sale_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}