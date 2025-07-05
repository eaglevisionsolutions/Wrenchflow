<?php
// backend/controllers/ConfigController.php
// Ensure no whitespace or output before this line!
class ConfigController {
    public function getAll() {
        // Always read .env file directly for APP_DEBUG
        $envPath = __DIR__ . '/../.env';
        $debug = false;
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '' || strpos($line, '#') === 0) continue;
                if (strpos($line, 'APP_DEBUG=') === 0) {
                    $value = trim(substr($line, strlen('APP_DEBUG=')));
                    $debug = ($value === 'true' || $value === '1');
                    break;
                }
            }
        }
        header('Content-Type: application/json');
        echo json_encode([
            'APP_DEBUG' => $debug
        ]);
    }
    public function create($data) { http_response_code(405); }
    public function update($data) { http_response_code(405); }
    public function delete($id) { http_response_code(405); }
}
