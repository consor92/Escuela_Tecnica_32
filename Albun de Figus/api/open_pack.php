<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

/**
 * API: Apertura de Sobres (Motor de Gachapon v2)
 * Probabilidades: 70% Common, 18% Uncommon, 8% Rare, 3% Holo, 1% Gold
 */

if (!isLoggedIn()) {
    jsonResponse(false, 'Sesión no iniciada');
}

$user = getCurrentUser($pdo);

// Verificar mantenimiento
$stmtM = $pdo->query("SELECT value FROM settings WHERE `key` = 'maintenance_mode'");
if ($stmtM->fetchColumn() === '1' && !$user['is_admin']) {
    jsonResponse(false, "El álbum se encuentra en mantenimiento. No se pueden abrir sobres.");
}

if ($user['packs_available'] <= 0) {
    jsonResponse(false, 'No tienes sobres disponibles');
}

try {
    $pdo->beginTransaction();

    // 1. Descontar el sobre
    $stmt = $pdo->prepare("UPDATE users SET packs_available = packs_available - 1 WHERE id = ?");
    $stmt->execute([$user['id']]);

    // 2. Obtener probabilidades de configuración
    $stmtRates = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'rarity_rates'");
    $ratesJson = $stmtRates->fetchColumn();
    $rates = $ratesJson ? json_decode($ratesJson, true) : [
        'common' => 70,
        'uncommon' => 18,
        'rare' => 8,
        'holo' => 3,
        'gold' => 1
    ];

    $stickersObtained = [];
    $hasHit = false;
    
    // 3. Generar EXACTAMENTE 5 figuritas
    for ($i = 0; $i < 5; $i++) {
        $rand = rand(1, 100);
        $acc = 0;
        $rarity = 'common';

        if ($rand <= ($acc += $rates['common'])) $rarity = 'common';
        elseif ($rand <= ($acc += $rates['uncommon'])) $rarity = 'uncommon';
        elseif ($rand <= ($acc += $rates['rare'])) { $rarity = 'rare'; $hasHit = true; }
        elseif ($rand <= ($acc += $rates['holo'])) { $rarity = 'holo'; $hasHit = true; }
        else { $rarity = 'gold'; $hasHit = true; }

        // Obtener una figurita aleatoria de esa rareza
        $stmt = $pdo->prepare("SELECT id, number, name, description, rarity, external_url FROM stickers WHERE rarity = ? ORDER BY RAND() LIMIT 1");
        $stmt->execute([$rarity]);
        $sticker = $stmt->fetch();

        // FALLBACK 1: Si no hay de esa rareza, buscar cualquiera
        if (!$sticker) {
            $stmt = $pdo->query("SELECT id, number, name, description, rarity, external_url FROM stickers ORDER BY RAND() LIMIT 1");
            $sticker = $stmt->fetch();
        }

        if ($sticker) {
            // Construir la URL completa
            $sticker['external_url'] = getDriveUrl($pdo, $sticker['external_url']);

            // Verificar si YA la tenía antes de esta apertura
            $stmtCheck = $pdo->prepare("SELECT 1 FROM user_inventory WHERE user_id = ? AND sticker_id = ?");
            $stmtCheck->execute([$user['id'], $sticker['id']]);
            $exists = $stmtCheck->fetch();

            $item = $sticker;
            $item['is_new'] = !$exists;

            $stickersObtained[] = $item;

            // 3. Registrar en inventario
            $stmtInsert = $pdo->prepare("INSERT INTO user_inventory (user_id, sticker_id, quantity, is_stuck) 
                                        VALUES (?, ?, 1, 0) 
                                        ON DUPLICATE KEY UPDATE quantity = quantity + 1");
            $stmtInsert->execute([$user['id'], $sticker['id']]);
        }
    }

    $pdo->commit();

    jsonResponse(true, 'Sobre abierto con éxito', [
        'stickers' => $stickersObtained,
        'has_hit' => $hasHit
    ]);

} catch (Exception $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    error_log($e->getMessage());
    jsonResponse(false, 'Error del servidor: ' . $e->getMessage());
}
?>
