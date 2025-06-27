<?php

require_once __DIR__ . '/../session.php'; // Include session management
require_once __DIR__ . '/../Auth.php';
require_once __DIR__ . '/../AccessControl.php';
require_once __DIR__ . '/../models/Theme.php';

class ThemeController {
    private $themeModel;
    private $auth;
    private $accessControl;

    public function __construct($db) {
        $this->themeModel = new Theme($db);
        $this->auth = new Auth($db);
        $this->accessControl = new AccessControl($this->auth);

        // Protect endpoint for Platform Admins and Platform Employees
        $this->accessControl->checkAccess(['Super Admin', 'Platform Employee']);
    }

    public function handleRequest($method, $data) {
        switch ($method) {
            case 'GET':
                if (isset($data['id'])) {
                    $this->getTheme($data['id']);
                } else {
                    $this->getAllThemes();
                }
                break;
            case 'POST':
                $this->createTheme($data);
                break;
            case 'PUT':
                $this->updateTheme($data);
                break;
            case 'DELETE':
                $this->deleteTheme($data['id']);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error' => 'Method Not Allowed']);
        }
    }

    public function createTheme($data) {
        validateCsrfToken(); // Validate CSRF token
        try {
            if ($this->themeModel->createTheme($data['theme_name'], json_encode($data['theme_config']))) {
                echo json_encode(['message' => 'Theme created successfully']);
            } else {
                throw new Exception('Failed to create theme');
            }
        } catch (Exception $e) {
            error_log("Error creating theme: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create theme', 'details' => $e->getMessage()]);
        }
    }

    private function updateTheme($data) {
        if ($this->themeModel->updateTheme($data['id'], $data['theme_name'], json_encode($data['theme_config']))) {
            echo json_encode(['message' => 'Theme updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update theme']);
        }
    }

    private function deleteTheme($theme_id) {
        if ($this->themeModel->deleteTheme($theme_id)) {
            echo json_encode(['message' => 'Theme deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete theme']);
        }
    }

    private function getAllThemes() {
        $themes = $this->themeModel->getThemes();
        echo json_encode($themes);
    }

    private function getTheme($theme_id) {
        $theme = $this->themeModel->getThemeById($theme_id);
        if ($theme) {
            echo json_encode($theme);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Theme not found']);
        }
    }
}