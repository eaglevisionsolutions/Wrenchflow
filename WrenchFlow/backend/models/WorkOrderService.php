<?php

class WorkOrderService {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function addServiceToWorkOrder($shop_id, $work_order_id, $service_name, $service_cost) {
        $query = "INSERT INTO work_order_services (shop_id, work_order_id, service_name, service_cost) 
                  VALUES (:shop_id, :work_order_id, :service_name, :service_cost)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':work_order_id', $work_order_id);
        $stmt->bindParam(':service_name', $service_name);
        $stmt->bindParam(':service_cost', $service_cost);
        return $stmt->execute();
    }

    public function getServicesByWorkOrder($shop_id, $work_order_id) {
        $query = "SELECT service_name, service_cost 
                  FROM work_order_services 
                  WHERE shop_id = :shop_id AND work_order_id = :work_order_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':work_order_id', $work_order_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}