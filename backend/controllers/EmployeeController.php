<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Employee.php';
require_once __DIR__ . '/BaseController.php';

class EmployeeController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /employees?shop_id=...
    public function getAll($shop_id) {
        $stmt = $this->db->prepare('SELECT * FROM shop_users WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $employees = $stmt->fetchAll();
        $this->jsonResponse($employees);
    }
    // POST /employees
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO shop_users (shop_user_id, shop_id, username, password_hash, role, first_name, last_name, email, selected_theme_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['shop_user_id'], $data['shop_id'], $data['username'], $data['password_hash'], $data['role'],
            $data['first_name'], $data['last_name'], $data['email'], $data['selected_theme_id']
        ]);
        $this->jsonResponse(['success' => true, 'shop_user_id' => $data['shop_user_id']], 201);
    }
    // ...add update, delete, getById methods...
}
