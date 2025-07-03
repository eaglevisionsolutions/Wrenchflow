<?php
class Auth {
    public static function check() {
        session_start();
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        return $_SESSION['user'];
    }
    public static function login($user) {
        session_start();
        $_SESSION['user'] = $user;
    }
    public static function logout() {
        session_start();
        session_destroy();
    }
    public static function user() {
        session_start();
        return $_SESSION['user'] ?? null;
    }
}
