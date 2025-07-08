<?php
require_once __DIR__ . '/../Database.php';

class Sale {
    public $sale_id;
    public $shop_id;
    public $customer_id;
    public $sale_date;
    public $total_sale_amount;
    public $total_cost_of_goods_sold;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'sale_id' => $this->sale_id,
            'shop_id' => $this->shop_id,
            'customer_id' => $this->customer_id,
            'sale_date' => $this->sale_date,
            'total_sale_amount' => $this->total_sale_amount,
            'total_cost_of_goods_sold' => $this->total_cost_of_goods_sold
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->sale_id) {
            $stmt = $db->prepare("UPDATE sales SET shop_id=?, customer_id=?, sale_date=?, total_sale_amount=?, total_cost_of_goods_sold=? WHERE sale_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->customer_id,
                $this->sale_date,
                $this->total_sale_amount,
                $this->total_cost_of_goods_sold,
                $this->sale_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO sales (shop_id, customer_id, sale_date, total_sale_amount, total_cost_of_goods_sold) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->customer_id,
                $this->sale_date,
                $this->total_sale_amount,
                $this->total_cost_of_goods_sold
            ]);
            $this->sale_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->sale_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM sales WHERE sale_id=?");
        $stmt->execute([$this->sale_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM sales WHERE sale_id=?");
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
        $stmt = $db->prepare("SELECT * FROM sales WHERE shop_id=?");
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
