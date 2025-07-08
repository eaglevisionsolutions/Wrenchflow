<?php
require_once __DIR__ . '/../Database.php';

class Employee {
    public $shop_user_id;
    public $shop_id;
    public $username;
    public $role;
    public $first_name;
    public $last_name;
    public $email;
    public $selected_theme_id;

    public function fromArray($data) {
        foreach ($data as $key => $value) {
            if (property_exists($this, $key)) {
                $this->$key = $value;
            }
        }
    }

    public function toArray() {
        return [
            'shop_user_id' => $this->shop_user_id,
            'shop_id' => $this->shop_id,
            'username' => $this->username,
            'role' => $this->role,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'selected_theme_id' => $this->selected_theme_id
        ];
    }

    public function save() {
        $db = Database::getConnection();
        if ($this->shop_user_id) {
            $stmt = $db->prepare("UPDATE shop_users SET shop_id=?, username=?, role=?, first_name=?, last_name=?, email=?, selected_theme_id=? WHERE shop_user_id=?");
            $stmt->execute([
                $this->shop_id,
                $this->username,
                $this->role,
                $this->first_name,
                $this->last_name,
                $this->email,
                $this->selected_theme_id,
                $this->shop_user_id
            ]);
        } else {
            $stmt = $db->prepare("INSERT INTO shop_users (shop_id, username, role, first_name, last_name, email, selected_theme_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $this->shop_id,
                $this->username,
                $this->role,
                $this->first_name,
                $this->last_name,
                $this->email,
                $this->selected_theme_id
            ]);
            $this->shop_user_id = $db->lastInsertId();
        }
    }

    public function delete() {
        if (!$this->shop_user_id) return;
        $db = Database::getConnection();
        $stmt = $db->prepare("DELETE FROM shop_users WHERE shop_user_id=?");
        $stmt->execute([$this->shop_user_id]);
    }

    public static function find($id) {
        $db = Database::getConnection();
        $stmt = $db->prepare("SELECT * FROM shop_users WHERE shop_user_id=?");
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
        $stmt = $db->prepare("SELECT * FROM shop_users WHERE shop_id=?");
        $stmt->execute([$shop_id]);
        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $obj = new self();
            $obj->fromArray($row);
            $results[] = $obj;
        }
        return $results;
    }

    // Find user by email (for login)
    public static function findByEmail($email) {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM shop_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $obj = new self();
            $obj->fromArray($row);
            return $obj;
        }
        return null;
    }
}
