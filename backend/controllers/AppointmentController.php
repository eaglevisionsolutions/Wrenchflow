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
        Auth::check();
        $appointments = Appointment::all($shop_id);
        $result = array_map(function($appt) { return $appt->toArray(); }, $appointments);
        $this->jsonResponse($result);
    }
    // POST /appointments
    public function create($data) {
        Auth::check();
        // ...validate $data...
        $appt = new Appointment();
        $appt->fromArray($data);
        $appt->save();
        $this->jsonResponse(['success' => true, 'appointment_id' => $appt->appointment_id], 201);
    }
    // GET /appointments/{id}
    public function getById($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $appt = Appointment::find($id);
        if ($appt && $appt->shop_id == $shop_id) {
            $this->jsonResponse($appt->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /appointments
    public function update($data) {
        Auth::check();
        AccessControl::requireShopAccess($data['shop_id']);
        $appt = Appointment::find($data['appointment_id']);
        if ($appt && $appt->shop_id == $data['shop_id']) {
            $appt->fromArray($data);
            $appt->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /appointments?id=...&shop_id=...
    public function delete($id, $shop_id) {
        Auth::check();
        AccessControl::requireShopAccess($shop_id);
        $appt = Appointment::find($id);
        if ($appt && $appt->shop_id == $shop_id) {
            $appt->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
