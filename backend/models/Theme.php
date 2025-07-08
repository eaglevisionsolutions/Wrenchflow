<?php
require_once __DIR__ . '/../Database.php';

class Theme {
    public $theme_id;
    public $theme_name;
    public $config_json;
    public $created_at;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'theme_id' => $this->theme_id,
            'theme_name' => $this->theme_name,
            'config_json' => $this->config_json,
            'created_at' => $this->created_at
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->theme_id) {
            $stmt = $db->prepare("UPDATE themes SET theme_name=?, config_json=?, created_at=? WHERE theme_id=?");
            $stmt->execute([
                $this->theme_name,
                $this->config_json,
                $this->created_at,
                $this->theme_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO themes (theme_name, config_json, created_at) VALUES (?, ?, ?)");
            $stmt->execute([
                $this->theme_name,
                $this->config_json,
                $this->created_at
            ]);
            $this->theme_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->theme_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM themes WHERE theme_id=?");
        $stmt->execute([$this->theme_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM themes WHERE theme_id=?");
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
        $stmt = $db->query("SELECT * FROM themes");
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }
}
