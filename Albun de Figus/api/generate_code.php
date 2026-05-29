<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

// Seguridad: Solo admin
if (!isLoggedIn()) jsonResponse(false, "No autorizado");
$user = getCurrentUser($pdo);
if (!$user || !$user['is_admin']) jsonResponse(false, "Acceso denegado");

$code = cleanInput($_POST['code'] ?? '');
$max_uses = intval($_POST['max_uses'] ?? 50);

if (empty($code)) {
    jsonResponse(false, "El código no puede estar vacío.");
}

try {
    // Definir expiración en 3 días (72 horas)
    $expiresAt = date('Y-m-d H:i:s', strtotime('+72 hours'));

    $stmt = $pdo->prepare("
        INSERT INTO promo_codes (code, packs_reward, expires_at, max_uses) 
        VALUES (?, 1, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            packs_reward = 1,
            expires_at = VALUES(expires_at),
            max_uses = VALUES(max_uses),
            used_by_count = 0
    ");
    $stmt->execute([strtoupper($code), $expiresAt, $max_uses]);
    
    jsonResponse(true, "Código generado por 3 días para $max_uses alumnos.");
} catch (Exception $e) {
    jsonResponse(false, "Error al generar código: " . $e->getMessage());
}
?>