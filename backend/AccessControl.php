<?php
class AccessControl {
    public static function canAccessShop($shop_id) {
        $user = Auth::user();
        error_log('[AccessControl] canAccessShop: user=' . print_r($user, true) . ' shop_id=' . print_r($shop_id, true));
        if (!$user) return false;
        if (isset($user['role']) && in_array($user['role'], ['super_admin', 'platform_employee'])) {
            return true;
        }
        return isset($user['shop_id']) && $user['shop_id'] === $shop_id;
    }
    public static function requireShopAccess($shop_id) {
        $result = self::canAccessShop($shop_id);
        error_log('[AccessControl] requireShopAccess: result=' . ($result ? 'true' : 'false'));
        if (!$result) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
    }
    public static function requireRole($roles) {
        $user = Auth::user();
        error_log('[AccessControl] requireRole: user=' . print_r($user, true) . ' roles=' . print_r($roles, true));
        if (!$user || !in_array($user['role'], (array)$roles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
    }
}
