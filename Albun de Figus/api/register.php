<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

/**
 * Endpoint de Registro
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método no permitido');
}

$username  = cleanInput($_POST['username'] ?? '');
$password  = $_POST['password'] ?? '';
$full_name = cleanInput($_POST['full_name'] ?? '');
$course    = cleanInput($_POST['course'] ?? '');

if (empty($username) || empty($password) || empty($full_name) || empty($course)) {
    jsonResponse(false, 'Todos los campos son obligatorios');
}

// Verificar si el usuario ya existe
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    jsonResponse(false, 'El nombre de usuario ya está registrado');
}

// Hash de contraseña
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (username, password, full_name, course, packs_available) VALUES (?, ?, ?, ?, 1)"); // Regalamos 1 sobre al iniciar
    $stmt->execute([$username, $passwordHash, $full_name, $course]);
    
    jsonResponse(true, 'Registro exitoso. Ya puedes iniciar sesión.');
} catch (PDOException $e) {
    error_log($e->getMessage());
    jsonResponse(false, 'Error interno del servidor');
}
?>
