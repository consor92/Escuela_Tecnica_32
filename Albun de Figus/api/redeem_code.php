<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

if (!isLoggedIn()) {
    jsonResponse(false, "No has iniciado sesión.");
}

$userId = $_SESSION['user_id'];
$codeStr = strtoupper(cleanInput($_POST['code'] ?? ''));

if (empty($codeStr)) {
    jsonResponse(false, "Ingresá un código.");
}

try {
    $pdo->beginTransaction();

    // 1. Buscar el código y verificar si está activo, no expirado y tiene usos disponibles
    $stmtCode = $pdo->prepare("
        SELECT id, packs_reward, expires_at, max_uses, used_by_count 
        FROM promo_codes 
        WHERE code = ? AND expires_at > NOW()
    ");
    $stmtCode->execute([$codeStr]);
    $codeData = $stmtCode->fetch();

    if (!$codeData) {
        $pdo->rollBack();
        jsonResponse(false, "Código inválido o expirado.");
    }

    if ($codeData['used_by_count'] >= $codeData['max_uses']) {
        $pdo->rollBack();
        jsonResponse(false, "Este código ya alcanzó su límite de usos.");
    }

    $codeId = $codeData['id'];

    // 2. Verificar si el usuario ya usó este código específico
    $stmtCheck = $pdo->prepare("SELECT 1 FROM user_promo_codes WHERE user_id = ? AND code_id = ?");
    $stmtCheck->execute([$userId, $codeId]);
    if ($stmtCheck->fetch()) {
        $pdo->rollBack();
        jsonResponse(false, "Ya utilizaste este código anteriormente.");
    }

    // 3. Registrar el uso y otorgar premio con Auditoría
    $stmtUse = $pdo->prepare("INSERT INTO user_promo_codes (user_id, code_id) VALUES (?, ?)");
    $stmtUse->execute([$userId, $codeId]);

    $stmtUpdateCount = $pdo->prepare("UPDATE promo_codes SET used_by_count = used_by_count + 1 WHERE id = ?");
    $stmtUpdateCount->execute([$codeId]);

    $packsGained = $codeData['packs_reward'];
    
    // AUDITORÍA DE SOBRES
    $stmtAudit = $pdo->prepare("INSERT INTO audit_packs (user_id, source_type, source_id, amount) VALUES (?, 'promo', ?, ?)");
    $stmtAudit->execute([$userId, $codeStr, $packsGained]);

    $stmtUser = $pdo->prepare("UPDATE users SET packs_available = packs_available + ? WHERE id = ?");
    $stmtUser->execute([$packsGained, $userId]);

    $pdo->commit();
    jsonResponse(true, "¡Código canjeado!", ['amount' => $packsGained]);

} catch (Exception $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    jsonResponse(false, "Error al procesar el código: " . $e->getMessage());
}
?>