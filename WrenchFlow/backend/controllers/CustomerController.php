<?php

require_once __DIR__ . '/../models/Customer.php';

class CustomerController {
    private $customerModel;

    public function __construct($db) {
        $this->customerModel = new Customer($db);
    }

    public function handleRequest($method, $shop_id, $data) {
        switch ($method) {
            case 'GET':
                if (isset($data['id'])) {
                    $this->getCustomer($shop_id, $data['id']);
                } else {
                    $this->getCustomers($shop_id);
                }
                break;
            case 'POST':
                $this->createCustomer($shop_id, $data);
                break;
            case 'PUT':
                $this->updateCustomer($shop_id, $data);
                break;
            case 'DELETE':
                $this->deleteCustomer($shop_id, $data['id']);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    private function getCustomers($shop_id) {
        $customers = $this->customerModel->getCustomersByShop($shop_id);
        echo json_encode($customers);
    }

    private function getCustomer($shop_id, $customer_id) {
        $customer = $this->customerModel->getCustomerById($shop_id, $customer_id);
        if ($customer) {
            echo json_encode($customer);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Customer not found']);
        }
    }

    private function createCustomer($shop_id, $data) {
        if ($this->customerModel->createCustomer(
            $shop_id,
            $data['first_name'],
            $data['last_name'],
            $data['phone_number'],
            $data['email'],
            $data['address']
        )) {
            http_response_code(201);
            echo json_encode(['message' => 'Customer created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create customer']);
        }
    }

    private function updateCustomer($shop_id, $data) {
        if ($this->customerModel->updateCustomer(
            $shop_id,
            $data['id'],
            $data['first_name'],
            $data['last_name'],
            $data['phone_number'],
            $data['email'],
            $data['address']
        )) {
            echo json_encode(['message' => 'Customer updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update customer']);
        }
    }

    private function deleteCustomer($shop_id, $customer_id) {
        if ($this->customerModel->deleteCustomer($shop_id, $customer_id)) {
            echo json_encode(['message' => 'Customer deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete customer']);
        }
    }
}