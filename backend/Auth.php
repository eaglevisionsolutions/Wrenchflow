<?php
class Auth {
    public static function check() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
        return $_SESSION['user'];
    }
    public static function login($user) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $_SESSION['user'] = $user;
    }
    public static function logout() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        session_destroy();
    }
    public static function user() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        return $_SESSION['user'] ?? null;
    }
}
