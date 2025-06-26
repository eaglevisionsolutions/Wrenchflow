<?php

class WorkOrderPart {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function addPartToWorkOrder($shop_id, $work_order_id, $part_id, $quantity_used, $volume_used) {
        $query = "INSERT INTO work_order_parts (shop_id, work_order_id, part_id, quantity_used, volume_used) 
                  VALUES (:shop_id, :work_order_id, :part_id, :quantity_used, :volume_used)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':work_order_id', $work_order_id);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->bindParam(':quantity_used', $quantity_used);
        $stmt->bindParam(':volume_used', $volume_used);
        return $stmt->execute();
    }

    public function getPartsByWorkOrder($shop_id, $work_order_id) {
        $query = "SELECT * FROM work_order_parts WHERE shop_id = :shop_id AND work_order_id = :work_order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':work_order_id', $work_order_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}