<?php
class SyncController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function syncData($data) {
        try {
            $this->db->beginTransaction();

            foreach ($data['changes'] as $change) {
                // Process each change (e.g., create/update/delete)
                // Validate shop_id and apply changes to the database
            }

            $this->db->commit();
            return ['message' => 'Synchronization successful'];
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error during synchronization: " . $e->getMessage());
            http_response_code(500);
            return ['error' => 'Synchronization failed', 'details' => $e->getMessage()];
        }
    }
}