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
        $themes = Theme::all();
        $result = array_map(function($t) { return $t->toArray(); }, $themes);
        $this->jsonResponse($result);
    }
    // POST /themes
    public function create($data) {
        // ...validate $data...
        $theme = new Theme();
        $theme->fromArray($data);
        $theme->save();
        $this->jsonResponse(['success' => true, 'theme_id' => $theme->theme_id], 201);
    }
    // GET /themes/{id}
    public function getById($id) {
        $theme = Theme::find($id);
        if ($theme) {
            $this->jsonResponse($theme->toArray());
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // PUT /themes
    public function update($data) {
        $theme = Theme::find($data['theme_id']);
        if ($theme) {
            $theme->fromArray($data);
            $theme->save();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
    // DELETE /themes?id=...
    public function delete($id) {
        $theme = Theme::find($id);
        if ($theme) {
            $theme->delete();
            $this->jsonResponse(['success' => true]);
        } else {
            $this->errorResponse('Not found', 404);
        }
    }
}
