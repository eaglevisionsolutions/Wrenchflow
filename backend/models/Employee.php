<?php

class Employee {
    public $shop_user_id;
    public $shop_id;
    public $username;
    public $role;
    public $first_name;
    public $last_name;
    public $email;
    public $selected_theme_id;
    // ...add methods as needed...

    // Find user by email (for login)
    public static function findByEmail($email) {
        $db = get_db();
        $stmt = $db->prepare('SELECT * FROM employees WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }
}
