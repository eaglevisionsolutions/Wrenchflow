<?php

require_once __DIR__ . '/../session.php'; // Include session management
require_once __DIR__ . '/../Auth.php';
require_once __DIR__ . '/../AccessControl.php';
require_once __DIR__ . '/../models/Appointment.php';

class AppointmentController {
    private $appointmentModel;
    private $auth;
    private $accessControl;

    public function __construct($db) {
        $this->appointmentModel = new Appointment($db);
        $this->auth = new Auth($db);
        $this->accessControl = new AccessControl($this->auth);

        // Protect endpoint for Service Employees and Shop Administrators
        $this->accessControl->checkAccess(['Service Employee', 'Shop Administrator']);
    }

    public function handleRequest($method, $shop_id, $data) {
        // Enforce shop-level access
        $this->accessControl->enforceShopScope($shop_id);

        switch ($method) {
            case 'GET':
                if (isset($data['id'])) {
                    $this->getAppointment($shop_id, $data['id']);
                } else {
                    $this->getAllAppointments($shop_id);
                }
                break;
            case 'POST':
                $this->createAppointment($shop_id, $data);
                break;
            case 'PUT':
                $this->updateAppointment($shop_id, $data);
                break;
            case 'DELETE':
                $this->deleteAppointment($shop_id, $data['id']);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function getAllAppointments($shop_id) {
        $appointments = $this->appointmentModel->getAppointmentsByShop($shop_id);
        echo json_encode($appointments);
    }

    private function getAppointment($shop_id, $appointment_id) {
        $appointment = $this->appointmentModel->getAppointmentById($shop_id, $appointment_id);
        if ($appointment) {
            echo json_encode($appointment);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Appointment not found']);
        }
    }

    private function createAppointment($shop_id, $data) {
        $appointment_id = $this->appointmentModel->createAppointment(
            $shop_id,
            $data['customer_id'],
            $data['equipment_id'],
            $data['appointment_date'],
            $data['appointment_time'],
            'scheduled'
        );

        echo json_encode(['message' => 'Appointment created successfully', 'appointment_id' => $appointment_id]);
    }

    private function updateAppointment($shop_id, $data) {
        if ($this->appointmentModel->updateAppointment(
            $shop_id,
            $data['id'],
            $data['appointment_date'],
            $data['appointment_time'],
            $data['status']
        )) {
            echo json_encode(['message' => 'Appointment updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update appointment']);
        }
    }

    private function deleteAppointment($shop_id, $appointment_id) {
        if ($this->appointmentModel->deleteAppointment($shop_id, $appointment_id)) {
            echo json_encode(['message' => 'Appointment deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete appointment']);
        }
    }
}