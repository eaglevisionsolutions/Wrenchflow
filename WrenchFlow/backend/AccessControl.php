<?php

class AccessControl {
    private $auth;

    public function __construct($auth) {
        $this->auth = $auth;
    }

    public function checkAccess($requiredRoles) {
        if (!$this->auth->isAuthenticated()) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        $userRole = $this->auth->getUserRole();
        if (!in_array($userRole, $requiredRoles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
    }

    public function enforceShopScope($shopId) {
        $userShopId = $this->auth->getShopId();
        if ($userShopId !== $shopId) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied for this shop']);
            exit;
        }
    }
}