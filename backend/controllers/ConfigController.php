echo json_encode([
<?php
// backend/controllers/ConfigController.php
class ConfigController {
    public function getAll() {
        require_once __DIR__ . '/../config.php';
        header('Content-Type: application/json');
        $debug = (getenv('APP_DEBUG') === 'true') || (defined('APP_DEBUG') && APP_DEBUG === true);
        echo json_encode([
            'APP_DEBUG' => $debug
        ]);
    }
    public function create($data) { http_response_code(405); }
    public function update($data) { http_response_code(405); }
    public function delete($id) { http_response_code(405); }
}
