<?php

class PartsOrderReceipt {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function recordReceipt($shop_id, $order_id, $vendor_invoice_number, $part_id, $quantity_received, $actual_cost_per_unit, $is_backordered) {
        $query = "INSERT INTO parts_order_receipts (shop_id, order_id, vendor_invoice_number, part_id, quantity_received, actual_cost_per_unit, is_backordered) 
                  VALUES (:shop_id, :order_id, :vendor_invoice_number, :part_id, :quantity_received, :actual_cost_per_unit, :is_backordered)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':order_id', $order_id);
        $stmt->bindParam(':vendor_invoice_number', $vendor_invoice_number);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->bindParam(':quantity_received', $quantity_received);
        $stmt->bindParam(':actual_cost_per_unit', $actual_cost_per_unit);
        $stmt->bindParam(':is_backordered', $is_backordered);
        return $stmt->execute();
    }
}