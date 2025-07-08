<?php
require_once __DIR__ . '/../Database.php';

class Part {
    public $part_id;
    public $shop_id;
    public $part_name;
    public $part_number;
    public $description;
    public $cost_price;
    public $sale_price;
    public $quantity_on_hand;
    public $minimum_stock_level;
    public $bin_location;
    public $is_bulk;
    public $bulk_unit_measure;
    public $bulk_total_cost_delivery;
    public $bulk_total_volume_delivered;
    public $bulk_markup_percentage;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'part_id' => $this->part_id,
            'shop_id' => $this->shop_id,
            'part_name' => $this->part_name,
            'part_number' => $this->part_number,
            'description' => $this->description,
            'cost_price' => $this->cost_price,
            'sale_price' => $this->sale_price,
            'quantity_on_hand' => $this->quantity_on_hand,
            'minimum_stock_level' => $this->minimum_stock_level,
            'bin_location' => $this->bin_location,
            'is_bulk' => $this->is_bulk,
            'bulk_unit_measure' => $this->bulk_unit_measure,
            'bulk_total_cost_delivery' => $this->bulk_total_cost_delivery,
            'bulk_total_volume_delivered' => $this->bulk_total_volume_delivered,
            'bulk_markup_percentage' => $this->bulk_markup_percentage
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->part_id) {
            $stmt = $db->prepare("UPDATE parts SET shop_id=?, part_name=?, part_number=?, description=?, cost_price=?, sale_price=?, quantity_on_hand=?, minimum_stock_level=?, bin_location=?, is_bulk=?, bulk_unit_measure=?, bulk_total_cost_delivery=?, bulk_total_volume_delivered=?, bulk_markup_percentage=? WHERE part_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->part_name,
                $this->part_number,
                $this->description,
                $this->cost_price,
                $this->sale_price,
                $this->quantity_on_hand,
                $this->minimum_stock_level,
                $this->bin_location,
                $this->is_bulk,
                $this->bulk_unit_measure,
                $this->bulk_total_cost_delivery,
                $this->bulk_total_volume_delivered,
                $this->bulk_markup_percentage,
                $this->part_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO parts (shop_id, part_name, part_number, description, cost_price, sale_price, quantity_on_hand, minimum_stock_level, bin_location, is_bulk, bulk_unit_measure, bulk_total_cost_delivery, bulk_total_volume_delivered, bulk_markup_percentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->part_name,
                $this->part_number,
                $this->description,
                $this->cost_price,
                $this->sale_price,
                $this->quantity_on_hand,
                $this->minimum_stock_level,
                $this->bin_location,
                $this->is_bulk,
                $this->bulk_unit_measure,
                $this->bulk_total_cost_delivery,
                $this->bulk_total_volume_delivered,
                $this->bulk_markup_percentage
            ]);
            $this->part_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->part_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM parts WHERE part_id=?");
        $stmt->execute([$this->part_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM parts WHERE part_id=?");
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
        $stmt = $db->prepare("SELECT * FROM parts WHERE shop_id=?");
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
