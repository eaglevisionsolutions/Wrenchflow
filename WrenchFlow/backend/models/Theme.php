<?php

class Theme {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createTheme($theme_name, $theme_config) {
        try {
            $query = "INSERT INTO themes (theme_name, theme_config) VALUES (:theme_name, :theme_config)";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':theme_name', $theme_name);
            $stmt->bindParam(':theme_config', $theme_config);
            $stmt->execute();
            return true;
        } catch (PDOException $e) {
            error_log("Error creating theme: " . $e->getMessage());
            return false;
        }
    }

    public function updateTheme($theme_id, $theme_name, $theme_config) {
        $query = "UPDATE themes SET theme_name = :theme_name, theme_config = :theme_config WHERE id = :theme_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':theme_id', $theme_id);
        $stmt->bindParam(':theme_name', $theme_name);
        $stmt->bindParam(':theme_config', $theme_config);
        return $stmt->execute();
    }

    public function deleteTheme($theme_id) {
        $query = "DELETE FROM themes WHERE id = :theme_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':theme_id', $theme_id);
        return $stmt->execute();
    }

    public function getThemes() {
        $query = "SELECT * FROM themes";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getThemeById($theme_id) {
        $query = "SELECT * FROM themes WHERE id = :theme_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':theme_id', $theme_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}