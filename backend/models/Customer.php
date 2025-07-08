<?php
require_once __DIR__ . '/../Database.php';

class Customer {
    public $customer_id;
    public $shop_id;
    public $first_name;
    public $last_name;
    public $phone_number;
    public $email;
    public $address;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'customer_id' => $this->customer_id,
            'shop_id' => $this->shop_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'phone_number' => $this->phone_number,
            'email' => $this->email,
            'address' => $this->address
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->customer_id) {
            $stmt = $db->prepare("UPDATE customers SET shop_id=?, first_name=?, last_name=?, phone_number=?, email=?, address=? WHERE customer_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->first_name,
                $this->last_name,
                $this->phone_number,
                $this->email,
                $this->address,
                $this->customer_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO customers (shop_id, first_name, last_name, phone_number, email, address) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->first_name,
                $this->last_name,
                $this->phone_number,
                $this->email,
                $this->address
            ]);
            $this->customer_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->customer_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM customers WHERE customer_id=?");
        $stmt->execute([$this->customer_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM customers WHERE customer_id=?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $obj = new self();
            $obj->fromArray($row);
            return $obj;
        }
        return null;
    }

    public static function all($shop_id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM customers WHERE shop_id=?");
        $stmt->execute([$shop_id]);
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }
}
