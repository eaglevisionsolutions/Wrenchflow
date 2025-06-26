<?php

class PartVendor {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getVendorsForPart($shop_id, $part_id) {
        $query = "SELECT v.* FROM vendors v
                  INNER JOIN part_vendor_relations pvr ON v.id = pvr.vendor_id
                  WHERE pvr.shop_id = :shop_id AND pvr.part_id = :part_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getPartsForVendor($shop_id, $vendor_id) {
        $query = "SELECT p.* FROM parts p
                  INNER JOIN part_vendor_relations pvr ON p.id = pvr.part_id
                  WHERE pvr.shop_id = :shop_id AND pvr.vendor_id = :vendor_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':vendor_id', $vendor_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function associatePartWithVendor($shop_id, $part_id, $vendor_id) {
        $query = "INSERT INTO part_vendor_relations (shop_id, part_id, vendor_id)
                  VALUES (:shop_id, :part_id, :vendor_id)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->bindParam(':vendor_id', $vendor_id);
        return $stmt->execute();
    }

    public function removePartVendorAssociation($shop_id, $part_id, $vendor_id) {
        $query = "DELETE FROM part_vendor_relations
                  WHERE shop_id = :shop_id AND part_id = :part_id AND vendor_id = :vendor_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':part_id', $part_id);
        $stmt->bindParam(':vendor_id', $vendor_id);
        return $stmt->execute();
    }
}