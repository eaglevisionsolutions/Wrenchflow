<?php
// Secure session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1); // Use only if HTTPS is enabled
ini_set('session.use_strict_mode', 1);

// Start or resume the session
session_start();

// Regenerate session ID to prevent fixation attacks
if (!isset($_SESSION['initiated'])) {
    session_regenerate_id(true);
    $_SESSION['initiated'] = true;
}

// Implement session timeout (30 minutes)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
    session_unset();
    session_destroy();
    session_start(); // Restart session after timeout
}
$_SESSION['last_activity'] = time();