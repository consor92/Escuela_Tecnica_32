<?php
/**
 * Funciones Globales del Sistema
 * Manejo de sesiones, seguridad y utilidades.
 */

session_start();

/**
 * Sanitizar entradas de texto
 */
function cleanInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

/**
 * Verificar si el usuario está logueado
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

/**
 * Redirigir si no está logueado
 */
function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: login.php");
        exit();
    }
}

/**
 * Obtener datos del usuario actual
 */
function getCurrentUser($pdo) {
    if (!isLoggedIn()) return null;
    
    $stmt = $pdo->prepare("SELECT id, username, full_name, course, packs_available, album_completed, is_admin FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

/**
 * Respuesta JSON estandarizada para la API
 */
function jsonResponse($success, $message, $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}
?>
