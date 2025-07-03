<?php
class AccessControl {
    public static function canAccessShop($shop_id) {
        $user = Auth::user();
        if (!$user) return false;
        if (isset($user['role']) && in_array($user['role'], ['super_admin', 'platform_employee'])) {
            return true;
        }
        return isset($user['shop_id']) && $user['shop_id'] === $shop_id;
    }
    public static function requireShopAccess($shop_id) {
        if (!self::canAccessShop($shop_id)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
    }
    public static function requireRole($roles) {
        $user = Auth::user();
        if (!$user || !in_array($user['role'], (array)$roles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
    }
}
