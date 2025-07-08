<?php
class PartsOrderLineItem {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function addLineItem($shop_id, $order_id, $part_id, $quantity_ordered, $is_new_part) {
        $query = "INSERT INTO parts_order_line_items (shop_id, order_id, part_id, quantity_ordered, is_new_part) 
                  VALUES (:shop_id, :order_id, :part_id, :quantity_ordered, :is_new_part)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->bindParam(':quantity_ordered', $quantity_ordered);
        $stmt->bindParam(':is_new_part', $is_new_part);
        return $stmt->execute();
    }

    public function getLineItemsByOrder($shop_id, $order_id) {
        $query = "SELECT * FROM parts_order_line_items WHERE shop_id = :shop_id AND order_id = :order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}