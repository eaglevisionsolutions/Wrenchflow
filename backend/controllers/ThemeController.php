<?php
require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../models/Theme.php';
require_once __DIR__ . '/BaseController.php';

class ThemeController extends BaseController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->getConnection();
    }
    // GET /themes
    public function getAll() {
        $stmt = $this->db->query('SELECT * FROM themes');
        $themes = $stmt->fetchAll();
        $this->jsonResponse($themes);
    }
    // POST /themes
    public function create($data) {
        // ...validate $data...
        $stmt = $this->db->prepare('INSERT INTO themes (theme_id, theme_name, config_json) VALUES (?, ?, ?)');
        $stmt->execute([
            $data['theme_id'], $data['theme_name'], $data['config_json']
        ]);
        $this->jsonResponse(['success' => true, 'theme_id' => $data['theme_id']], 201);
    }
    // GET /themes/{id}
    public function getById($id) {
        $stmt = $this->db->prepare('SELECT * FROM themes WHERE theme_id = ?');
        $stmt->execute([$id]);
        $theme = $stmt->fetch();
        if ($theme) {
            $this->jsonResponse($theme);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /themes
    public function update($data) {
        $stmt = $this->db->prepare('UPDATE themes SET theme_name=?, config_json=? WHERE theme_id=?');
        $stmt->execute([
            $data['theme_name'], $data['config_json'], $data['theme_id']
        ]);
        $this->jsonResponse(['success' => true]);
    }
    // DELETE /themes?id=...
    public function delete($id) {
        $stmt = $this->db->prepare('DELETE FROM themes WHERE theme_id = ?');
        $stmt->execute([$id]);
        $this->jsonResponse(['success' => true]);
    }
}
