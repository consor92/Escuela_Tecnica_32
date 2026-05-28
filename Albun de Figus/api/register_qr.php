<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

// Seguridad: Solo admin
if (!isLoggedIn()) jsonResponse(false, "No autorizado");
$user = getCurrentUser($pdo);
if (!$user || !$user['is_admin']) jsonResponse(false, "Acceso denegado");

$displayName = cleanInput($_POST['display_name'] ?? '');
$type = $_POST['type'] ?? 'pack';

if (empty($displayName)) {
    jsonResponse(false, "El nombre de la estación es obligatorio.");
}

try {
    // Generar un SLUG aleatorio seguro de 8 caracteres
    $slug = substr(str_shuffle("ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"), 0, 8);

    $stmt = $pdo->prepare("INSERT INTO qr_stations (display_name, slug, type) VALUES (?, ?, ?)");
    $stmt->execute([$displayName, $slug, $type]);
    
    header("Location: ../admin/dashboard.php?success=1&msg=Estacion+QR+creada");
    exit();
} catch (Exception $e) {
    jsonResponse(false, "Error al crear estación: " . $e->getMessage());
}
