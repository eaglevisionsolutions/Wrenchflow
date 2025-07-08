<?php

class Vendor {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createVendor($shop_id, $vendor_name, $contact_name, $phone, $email, $address) {
        $query = "INSERT INTO vendors (shop_id, vendor_name, contact_name, phone, email, address) 
                  VALUES (:shop_id, :vendor_name, :contact_name, :phone, :email, :address)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':vendor_name', $vendor_name);
        $stmt->bindParam(':contact_name', $contact_name);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':address', $address);
        return $stmt->execute();
    }

    public function getVendorsByShop($shop_id) {
        $query = "SELECT * FROM vendors WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getVendorById($shop_id, $vendor_id) {
        $query = "SELECT * FROM vendors WHERE shop_id = :shop_id AND id = :vendor_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':vendor_id', $vendor_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateVendor($shop_id, $vendor_id, $vendor_name, $contact_name, $phone, $email, $address) {
        $query = "UPDATE vendors SET vendor_name = :vendor_name, contact_name = :contact_name, 
                  phone = :phone, email = :email, address = :address 
                  WHERE shop_id = :shop_id AND id = :vendor_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':vendor_id', $vendor_id);
        $stmt->bindParam(':vendor_name', $vendor_name);
        $stmt->bindParam(':contact_name', $contact_name);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':address', $address);
        return $stmt->execute();
    }

    public function deleteVendor($shop_id, $vendor_id) {
        $query = "DELETE FROM vendors WHERE shop_id = :shop_id AND id = :vendor_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':vendor_id', $vendor_id);
        return $stmt->execute();
    }
}