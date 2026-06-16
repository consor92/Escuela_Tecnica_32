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

    // 1. Buscar el código y verificar si está activo, no expirado y no ha sido usado (si es de uso único)
    $stmtCode = $pdo->prepare("
        SELECT id, packs_reward, expires_at, max_uses, used_by_count, is_used 
        FROM promo_codes 
        WHERE code = ? AND expires_at > NOW()
    ");
    $stmtCode->execute([$codeStr]);
    $codeData = $stmtCode->fetch();

    if (!$codeData) {
        $pdo->rollBack();
        jsonResponse(false, "Código inválido o expirado.");
    }

    // Si el código es de uso único (max_uses = 1) y ya está marcado como usado
    if ($codeData['is_used'] == 1 || ($codeData['max_uses'] == 1 && $codeData['used_by_count'] >= 1)) {
        $pdo->rollBack();
        jsonResponse(false, "Este código ya fue utilizado.");
    }

    // Para códigos grupales con múltiples cupos
    if ($codeData['max_uses'] > 1 && $codeData['used_by_count'] >= $codeData['max_uses']) {
        $pdo->rollBack();
        jsonResponse(false, "Este código ya alcanzó su límite de usos.");
    }

    $codeId = $codeData['id'];

    // 2. Verificar si el usuario ya usó este código específico (para códigos grupales)
    $stmtCheck = $pdo->prepare("SELECT 1 FROM user_promo_codes WHERE user_id = ? AND code_id = ?");
    $stmtCheck->execute([$userId, $codeId]);
    if ($stmtCheck->fetch()) {
        $pdo->rollBack();
        jsonResponse(false, "Ya utilizaste este código anteriormente.");
    }

    // 3. Registrar el uso y otorgar premio con Auditoría
    $stmtUse = $pdo->prepare("INSERT INTO user_promo_codes (user_id, code_id) VALUES (?, ?)");
    $stmtUse->execute([$userId, $codeId]);

    // Marcar como usado e incrementar contador
    $stmtUpdateCount = $pdo->prepare("UPDATE promo_codes SET used_by_count = used_by_count + 1, is_used = 1 WHERE id = ?");
    $stmtUpdateCount->execute([$codeId]);

    // --- CÁLCULO DE RECOMPENSA VARIABLE (1 a 5 sobres) ---
    $stmtRates = $pdo->prepare("SELECT `value` FROM settings WHERE `key` = 'promo_reward_rates'");
    $stmtRates->execute();
    $ratesJson = $stmtRates->fetchColumn();
    $rates = $ratesJson ? json_decode($ratesJson, true) : ["1"=>20,"2"=>20,"3"=>20,"4"=>20,"5"=>20];

    $rand = mt_rand(1, 100);
    $acc = 0;
    $packsGained = 1; // Default
    
    foreach ($rates as $amount => $percentage) {
        $acc += $percentage;
        if ($rand <= $acc) {
            $packsGained = intval($amount);
            break;
        }
    }
    
    // AUDITORÍA DE SOBRES
    $stmtAudit = $pdo->prepare("INSERT INTO audit_packs (user_id, source_type, source_id, amount) VALUES (?, 'promo', ?, ?)");
    $stmtAudit->execute([$userId, $codeStr, $packsGained]);

    $stmtUser = $pdo->prepare("UPDATE users SET packs_available = packs_available + ? WHERE id = ?");
    $stmtUser->execute([$packsGained, $userId]);

    $pdo->commit();
    jsonResponse(true, "¡Código canjeado! Ganaste $packsGained " . ($packsGained == 1 ? "sobre" : "sobres") . ".", ['amount' => $packsGained]);

} catch (Exception $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    jsonResponse(false, "Error al procesar el código: " . $e->getMessage());
}
?>