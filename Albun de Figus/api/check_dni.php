<?php
// --- INICIO MODO DEBUG ---
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
// --- FIN MODO DEBUG ---    
    
require_once '../includes/db.php';
require_once '../includes/functions.php';

/**
 * Endpoint para verificar DNI y devolver curso/nombre
 */

$dni = cleanInput($_GET['dni'] ?? '');

if (empty($dni)) {
    jsonResponse(false, 'DNI requerido');
}

$stmt = $pdo->prepare("SELECT full_name, course, is_used FROM whitelist WHERE dni = ?");
$stmt->execute([$dni]);
$alumno = $stmt->fetch();

if (!$alumno) {
    jsonResponse(false, 'DNI no encontrado en la lista autorizada');
}

if ($alumno['is_used']) {
    jsonResponse(false, 'Este DNI ya ha sido utilizado para registrar una cuenta');
}

jsonResponse(true, 'DNI válido', [
    'full_name' => $alumno['full_name'],
    'course' => $alumno['course']
]);
?>
