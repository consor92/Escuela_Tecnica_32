<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

/**
 * Endpoint de Registro
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método no permitido');
}

// Configurar Zona Horaria de Argentina
date_default_timezone_set('America/Argentina/Buenos_Aires');

// 1. Validar Horario (17:30 a 22:30)
$horaActual = (int)date('Hi');
if ($horaActual < 1730 || $horaActual > 2230) {
    jsonResponse(false, 'El registro solo está habilitado durante el horario del turno vespertino (17:30 a 22:30).');
}

$username  = cleanInput($_POST['username'] ?? '');
$password  = $_POST['password'] ?? '';
$full_name = cleanInput($_POST['full_name'] ?? '');
$course    = cleanInput($_POST['course'] ?? '');
$dni       = cleanInput($_POST['dni'] ?? '');

if (empty($username) || empty($password) || empty($full_name) || empty($course) || empty($dni)) {
    jsonResponse(false, 'Todos los campos son obligatorios, incluyendo el DNI');
}

// 2. Validar contra Whitelist (DNI y Nombre)
$stmt = $pdo->prepare("SELECT full_name, is_used FROM whitelist WHERE dni = ?");
$stmt->execute([$dni]);
$alumno = $stmt->fetch();

if (!$alumno) {
    jsonResponse(false, 'No te encuentras en la lista de alumnos autorizados para el turno vespertino');
}

if ($alumno['is_used']) {
    jsonResponse(false, 'Este DNI ya ha sido utilizado para registrar una cuenta');
}

// Validación de Nombre (Evitar que alguien registre un DNI ajeno con otro nombre)
// Comparamos simplificando espacios y mayúsculas
$nameWhitelist = strtolower(trim($alumno['full_name']));
$nameInput = strtolower(trim($full_name));

if ($nameWhitelist !== $nameInput) {
    jsonResponse(false, 'El nombre ingresado no coincide con el registrado para este DNI');
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
    // 3. Iniciar Transacción para asegurar integridad
    $pdo->beginTransaction();

    // Insertar en tabla users (Estructura Original)
    $stmt = $pdo->prepare("INSERT INTO users (username, password, full_name, course, packs_available) VALUES (?, ?, ?, ?, 5)"); 
    $stmt->execute([$username, $passwordHash, $full_name, $course]);
    
    // Marcar el DNI como usado en la whitelist
    $stmt = $pdo->prepare("UPDATE whitelist SET is_used = 1 WHERE dni = ?");
    $stmt->execute([$dni]);

    $pdo->commit();
    jsonResponse(true, 'Registro exitoso. Ya puedes iniciar sesión.');
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    jsonResponse(false, 'Error interno del servidor');
}
?>
