<?php
require_once __DIR__ . '/../Database.php';

class ShopSetting {
    public $shop_id;
    public $retail_labour_rate;
    public $internal_labour_rate;
    public $warranty_labour_rate;

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
            'retail_labour_rate' => $this->retail_labour_rate,
            'internal_labour_rate' => $this->internal_labour_rate,
            'warranty_labour_rate' => $this->warranty_labour_rate
        ];
    }

    public function save() {
        $db = Database::getConnection();
        // Upsert logic: update if exists, else create
        $stmt = $db->prepare("SELECT shop_id FROM shop_settings WHERE shop_id=?");
        $stmt->execute([$this->shop_id]);
        if ($stmt->fetch()) {
            $this->update();
        } else {
            $this->create();
        }
    }

    public function create() {
        $db = Database::getConnection();
        $stmt = $db->prepare("INSERT INTO shop_settings (shop_id, retail_labour_rate, internal_labour_rate, warranty_labour_rate) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $this->shop_id,
            $this->retail_labour_rate,
            $this->internal_labour_rate,
            $this->warranty_labour_rate
        ]);
    }

    public function update() {
        $db = Database::getConnection();
        $stmt = $db->prepare("UPDATE shop_settings SET retail_labour_rate=?, internal_labour_rate=?, warranty_labour_rate=? WHERE shop_id=?");
        $stmt->execute([
            $this->retail_labour_rate,
            $this->internal_labour_rate,
            $this->warranty_labour_rate,
            $this->shop_id
        ]);
    }

    public static function find($shop_id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM shop_settings WHERE shop_id=?");
        $stmt->execute([$shop_id]);
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
        $stmt = $db->query("SELECT * FROM shop_settings");
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }
}
