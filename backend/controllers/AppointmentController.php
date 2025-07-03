<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Appointment.php';
require_once __DIR__ . '/BaseController.php';

class AppointmentController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /appointments?shop_id=...
    public function getAll($shop_id) {
        $stmt = $this->db->prepare('SELECT * FROM appointments WHERE shop_id = ?');
        $stmt->execute([$shop_id]);
        $appointments = $stmt->fetchAll();
        $this->jsonResponse($appointments);
    }
    // POST /appointments
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO appointments (appointment_id, shop_id, customer_id, equipment_id, appointment_date, appointment_time, service_type, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $data['appointment_id'], $data['shop_id'], $data['customer_id'], $data['equipment_id'],
            $data['appointment_date'], $data['appointment_time'], $data['service_type'], $data['notes'], $data['status']
        ]);
        $this->jsonResponse(['success' => true, 'appointment_id' => $data['appointment_id']], 201);
    }
    // GET /appointments/{id}
    public function getById($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('SELECT * FROM appointments WHERE appointment_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $appointment = $stmt->fetch();
        if ($appointment) {
            $this->jsonResponse($appointment);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /appointments
    public function update($data) {
        AccessControl::requireShopAccess($data['shop_id']);
        $stmt = $this->db->prepare('UPDATE appointments SET customer_id=?, equipment_id=?, appointment_date=?, appointment_time=?, service_type=?, notes=?, status=? WHERE appointment_id=? AND shop_id=?');
        $stmt->execute([
            $data['customer_id'], $data['equipment_id'], $data['appointment_date'], $data['appointment_time'], $data['service_type'], $data['notes'], $data['status'], $data['appointment_id'], $data['shop_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /appointments?id=...&shop_id=...
    public function delete($id, $shop_id) {
        AccessControl::requireShopAccess($shop_id);
        $stmt = $this->db->prepare('DELETE FROM appointments WHERE appointment_id = ? AND shop_id = ?');
        $stmt->execute([$id, $shop_id]);
        $this->jsonResponse(['success' => true]);
    }
}
