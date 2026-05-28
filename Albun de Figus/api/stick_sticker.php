<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

if (!isLoggedIn()) {
    jsonResponse(false, 'Sesión no iniciada');
}

$user = getCurrentUser($pdo);
$userId = $user['id'];
$stickerId = intval($_POST['sticker_id'] ?? 0);

if ($stickerId <= 0) {
    jsonResponse(false, 'ID de figurita no válido');
}

try {
    $pdo->beginTransaction();

    // 1. Verificar que tiene la figurita y no está pegada
    $stmt = $pdo->prepare("SELECT quantity, is_stuck FROM user_inventory WHERE user_id = ? AND sticker_id = ?");
    $stmt->execute([$userId, $stickerId]);
    $inv = $stmt->fetch();

    if (!$inv || $inv['quantity'] <= 0) {
        throw new Exception("No tienes esta figurita en tu inventario.");
    }

    if ($inv['is_stuck'] == 1) {
        throw new Exception("Esta figurita ya está pegada en tu álbum.");
    }

    // 2. Pegar figurita (is_stuck = 1)
    $stmtUpdate = $pdo->prepare("UPDATE user_inventory SET is_stuck = 1 WHERE user_id = ? AND sticker_id = ?");
    $stmtUpdate->execute([$userId, $stickerId]);

    // 3. Verificar si completó el álbum (50 figuritas pegadas)
    $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM user_inventory WHERE user_id = ? AND is_stuck = 1");
    $stmtCount->execute([$userId]);
    $totalStuck = $stmtCount->fetchColumn();

    $completed = ($totalStuck >= 50);

    if ($completed) {
        // Registrar premio por completar (Opcional: dar sobres extra o medalla)
        $stmtWin = $pdo->prepare("UPDATE users SET album_completed = 1, completed_at = NOW() WHERE id = ? AND album_completed = 0");
        $stmtWin->execute([$userId]);
        
        // Log auditoría por si el profe quiere ver quién terminó
        $stmtAudit = $pdo->prepare("INSERT INTO audit_packs (user_id, source_type, source_id, amount) VALUES (?, 'admin', 'Album Completado', 0)");
        $stmtAudit->execute([$userId]);
    }

    $pdo->commit();
    jsonResponse(true, '¡Figurita pegada con éxito!', ['album_completed' => $completed]);

} catch (Exception $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    jsonResponse(false, $e->getMessage());
}
