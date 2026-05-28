<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

// Seguridad: Solo admin
if (!isLoggedIn()) jsonResponse(false, "No autorizado");
$user = getCurrentUser($pdo);
if (!$user || !$user['is_admin']) jsonResponse(false, "Acceso denegado");

$code = cleanInput($_POST['code'] ?? '');
$packs = intval($_POST['packs'] ?? 1);

if (empty($code)) {
    jsonResponse(false, "El código no puede estar vacío.");
}

try {
    // Definir expiración en 24 horas
    $expiresAt = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $stmt = $pdo->prepare("
        INSERT INTO promo_codes (code, packs_reward, expires_at) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
            packs_reward = VALUES(packs_reward),
            expires_at = VALUES(expires_at),
            used_by_count = 0
    ");
    $stmt->execute([strtoupper($code), $packs, $expiresAt]);
    
    header("Location: ../admin/dashboard.php?success=1&msg=Codigo+generado+por+24hs");
    exit();
} catch (Exception $e) {
    jsonResponse(false, "Error al generar código: " . $e->getMessage());
}
