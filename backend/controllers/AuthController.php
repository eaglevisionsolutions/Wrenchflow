<?php
// AuthController for login/logout endpoints
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../Auth.php';
require_once __DIR__ . '/../models/Employee.php'; // Assuming Employee is the user model

class AuthController {
    // POST /api/auth (login)
    public function create($data) {
        // Accepts: email, password
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }
        $email = $data['email'];
        $password = $data['password'];
        $user = Employee::findByEmail($email);
        if (!$user || !password_verify($password, $user->password_hash)) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }
        // Remove sensitive info
        $user->password_hash = null;
        $userArr = $user->toArray();
        Auth::login($userArr);
        echo json_encode($userArr);
    }
    // POST /api/auth/logout
    public function logout() {
        Auth::logout();
        echo json_encode(['success' => true]);
    }
}
