<?php
class Customer {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createCustomer($shop_id, $first_name, $last_name, $phone_number, $email, $address) {
        $query = "INSERT INTO customers (shop_id, first_name, last_name, phone_number, email, address) 
                  VALUES (:shop_id, :first_name, :last_name, :phone_number, :email, :address)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':first_name', $first_name);
        $stmt->bindParam(':last_name', $last_name);
        $stmt->bindParam(':phone_number', $phone_number);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':address', $address);
        return $stmt->execute();
    }

    public function getCustomersByShop($shop_id) {
        $query = "SELECT * FROM customers WHERE shop_id = :shop_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getCustomerById($shop_id, $customer_id) {
        $query = "SELECT * FROM customers WHERE shop_id = :shop_id AND id = :customer_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':customer_id', $customer_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function updateCustomer($shop_id, $customer_id, $first_name, $last_name, $phone_number, $email, $address) {
        $query = "UPDATE customers SET first_name = :first_name, last_name = :last_name, 
                  phone_number = :phone_number, email = :email, address = :address 
                  WHERE shop_id = :shop_id AND id = :customer_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':customer_id', $customer_id);
        $stmt->bindParam(':first_name', $first_name);
        $stmt->bindParam(':last_name', $last_name);
        $stmt->bindParam(':phone_number', $phone_number);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':address', $address);
        return $stmt->execute();
    }

    public function deleteCustomer($shop_id, $customer_id) {
        $query = "DELETE FROM customers WHERE shop_id = :shop_id AND id = :customer_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':shop_id', $shop_id);
        $stmt->bindParam(':customer_id', $customer_id);
        return $stmt->execute();
    }
}