<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

/**
 * Endpoint de Login
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método no permitido');
}

$username = cleanInput($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    jsonResponse(false, 'Usuario y contraseña requeridos');
}

$stmt = $pdo->prepare("SELECT id, password, is_admin FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(false, 'Usuario no encontrado en la base de datos');
}

if (password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    jsonResponse(true, 'Inicio de sesión exitoso', ['is_admin' => (bool)$user['is_admin']]);
} else {
    jsonResponse(false, 'Contraseña incorrecta');
}
?>
