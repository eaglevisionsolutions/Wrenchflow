<?php
require_once __DIR__ . '/../Database.php';

class Vendor {
    public $vendor_id;
    public $shop_id;
    public $vendor_name;
    public $contact_person;
    public $phone_number;
    public $email;
    public $address;
    public $notes;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'vendor_id' => $this->vendor_id,
            'shop_id' => $this->shop_id,
            'vendor_name' => $this->vendor_name,
            'contact_person' => $this->contact_person,
            'phone_number' => $this->phone_number,
            'email' => $this->email,
            'address' => $this->address,
            'notes' => $this->notes
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->vendor_id) {
            $stmt = $db->prepare("UPDATE vendors SET shop_id=?, vendor_name=?, contact_person=?, phone_number=?, email=?, address=?, notes=? WHERE vendor_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->vendor_name,
                $this->contact_person,
                $this->phone_number,
                $this->email,
                $this->address,
                $this->notes,
                $this->vendor_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO vendors (shop_id, vendor_name, contact_person, phone_number, email, address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->vendor_name,
                $this->contact_person,
                $this->phone_number,
                $this->email,
                $this->address,
                $this->notes
            ]);
            $this->vendor_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->vendor_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM vendors WHERE vendor_id=?");
        $stmt->execute([$this->vendor_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM vendors WHERE vendor_id=?");
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
        $stmt = $db->prepare("SELECT * FROM vendors WHERE shop_id=?");
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
