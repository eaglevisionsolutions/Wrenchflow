<?php
require_once __DIR__ . '/../Database.php';

class Shop {
    public $shop_id;
    public $shop_name;
    public $subscription_status;
    public $billing_email;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'shop_id' => $this->shop_id,
            'shop_name' => $this->shop_name,
            'subscription_status' => $this->subscription_status,
            'billing_email' => $this->billing_email
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->shop_id) {
            $stmt = $db->prepare("UPDATE shops SET shop_name=?, subscription_status=?, billing_email=? WHERE shop_id=?");
            $stmt->execute([
                $this->shop_name,
                $this->subscription_status,
                $this->billing_email,
                $this->shop_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO shops (shop_name, subscription_status, billing_email) VALUES (?, ?, ?)");
            $stmt->execute([
                $this->shop_name,
                $this->subscription_status,
                $this->billing_email
            ]);
            $this->shop_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->shop_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM shops WHERE shop_id=?");
        $stmt->execute([$this->shop_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM shops WHERE shop_id=?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $obj = new self();
            $obj->fromArray($row);
            return $obj;
        }
        return null;
    }

    public static function all() {
        $db = Database::getConnection();
        $stmt = $db->query("SELECT * FROM shops");
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }
}
