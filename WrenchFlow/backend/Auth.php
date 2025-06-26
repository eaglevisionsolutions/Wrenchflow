<?php

class Auth {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function login($email, $password) {
        $query = "SELECT id, shop_id, role, password_hash FROM users WHERE email = :email";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($password, $user['password_hash'])) {
            // Start a secure session
            session_start();
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['shop_id'] = $user['shop_id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['logged_in'] = true;

            return ['message' => 'Login successful', 'role' => $user['role']];
        } else {
            http_response_code(401);
            return ['error' => 'Invalid email or password'];
        }
    }

    public function logout() {
        session_start();
        session_unset();
        session_destroy();
        return ['message' => 'Logout successful'];
    }

    public function isAuthenticated() {
        session_start();
        return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
    }

    public function getUserRole() {
        session_start();
        return $_SESSION['role'] ?? null;
    }

    public function getShopId() {
        session_start();
        return $_SESSION['shop_id'] ?? null;
    }
}