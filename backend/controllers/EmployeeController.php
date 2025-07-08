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
        $employees = Employee::all($shop_id);
        $result = array_map(function($e) { return $e->toArray(); }, $employees);
        $this->jsonResponse($result);
    }
    // POST /employees
    public function create($data) {
        // ...validate $data...
        $employee = new Employee();
        $employee->fromArray($data);
        $employee->save();
        $this->jsonResponse(['success' => true, 'shop_user_id' => $employee->shop_user_id], 201);
    }
    // You may want to add update, delete, getById methods here as in other controllers
    // ...add update, delete, getById methods...
}
