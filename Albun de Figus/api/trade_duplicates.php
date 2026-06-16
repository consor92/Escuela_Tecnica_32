<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

if (!isLoggedIn()) {
    jsonResponse(false, "No has iniciado sesión.");
}

$userId = $_SESSION['user_id'];
$action = $_POST['action'] ?? '';

// 1. CALCULAR PUNTOS Y RECUENTOS
if ($action === 'calculate') {
    // Obtener balance actual del usuario
    $stmtUser = $pdo->prepare("SELECT balance_points FROM users WHERE id = ?");
    $stmtUser->execute([$userId]);
    $wallet = (int)($stmtUser->fetchColumn() ?: 0);

    $stmt = $pdo->prepare("
        SELECT i.quantity, s.rarity, i.is_stuck
        FROM user_inventory i
        JOIN stickers s ON i.sticker_id = s.id
        WHERE i.user_id = ? AND i.quantity > 1
    ");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll();

    $pointsFromItems = 0;
    $counts = ['common'=>0,'uncommon'=>0,'rare'=>0,'holo'=>0,'gold'=>0];
    $rates = ['common'=>1, 'uncommon'=>2, 'rare'=>3, 'holo'=>4, 'gold'=>5];

    foreach ($items as $item) {
        $duplicates = $item['quantity'] - 1;
        $pointsFromItems += ($duplicates * $rates[$item['rarity']]);
        $counts[$item['rarity']] += $duplicates;
    }

    jsonResponse(true, "Cálculo", [
        'points' => $pointsFromItems + $wallet, 
        'wallet' => $wallet,
        'item_points' => $pointsFromItems,
        'counts' => $counts
    ]);
}

// 2. REALIZAR CANJE
if ($action === 'trade') {
    $amount = intval($_POST['amount'] ?? 1); // 1, 5, 10 sobres
    if (!in_array($amount, [1, 5, 10])) jsonResponse(false, "Cantidad no válida.");

    $cost = $amount * 10;
    
    $pdo->beginTransaction();

    try {
        // 1. Obtener balance actual (billetera)
        $stmtUser = $pdo->prepare("SELECT balance_points, packs_available FROM users WHERE id = ? FOR UPDATE");
        $stmtUser->execute([$userId]);
        $userData = $stmtUser->fetch();
        $wallet = (int)$userData['balance_points'];

        // 2. Calcular cuánto necesitamos de las figuritas
        $neededFromItems = $cost - $wallet;
        $newWallet = 0;

        if ($neededFromItems > 0) {
            // Recolectar repetidas priorizando menor rareza
            $stmt = $pdo->prepare("
                SELECT i.id, i.quantity, s.rarity
                FROM user_inventory i
                JOIN stickers s ON i.sticker_id = s.id
                WHERE i.user_id = ? AND i.quantity > 1
                ORDER BY FIELD(s.rarity, 'common', 'uncommon', 'rare', 'holo', 'gold') ASC
            ");
            $stmt->execute([$userId]);
            $inventory = $stmt->fetchAll();

            $rates = ['common'=>1, 'uncommon'=>2, 'rare'=>3, 'holo'=>4, 'gold'=>5];
            $gatheredPoints = 0;
            $toDeduct = [];

            foreach ($inventory as $item) {
                $dups = $item['quantity'] - 1;
                $val = $rates[$item['rarity']];

                for ($i = 0; $i < $dups; $i++) {
                    if ($gatheredPoints < $neededFromItems) {
                        $gatheredPoints += $val;
                        $toDeduct[$item['id']] = ($toDeduct[$item['id']] ?? 0) + 1;
                    }
                    if ($gatheredPoints >= $neededFromItems) break;
                }
                if ($gatheredPoints >= $neededFromItems) break;
            }

            if ($gatheredPoints < $neededFromItems) {
                throw new Exception("No tienes suficientes puntos para este canje.");
            }

            // Aplicar descuentos de figuritas
            foreach ($toDeduct as $invId => $qty) {
                $st = $pdo->prepare("UPDATE user_inventory SET quantity = quantity - ? WHERE id = ?");
                $st->execute([$qty, $invId]);
            }

            // El "vuelto": lo que sobró de las figuritas + la billetera que ya usamos
            // Si gathered es 12 y necesitábamos 10, sobran 2.
            $newWallet = $gatheredPoints - $neededFromItems;
        } else {
            // Si la billetera cubría todo el costo
            $newWallet = $wallet - $cost;
        }

        // Actualizar balance de puntos del usuario
        $stmtUpdateUser = $pdo->prepare("UPDATE users SET balance_points = ? WHERE id = ?");
        $stmtUpdateUser->execute([$newWallet, $userId]);

        // Calcular sobres extra (Dinámico desde DB)
        $stmtTradeBonus = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'trade_bonus_rate'");
        $bonusRate = intval($stmtTradeBonus->fetchColumn() ?: 10);

        $extra = 0;
        for ($i = 0; $i < $amount; $i++) {
            if (random_int(1, 100) <= $bonusRate) $extra++;
        }
        $totalGained = $amount + $extra;

        // Sumar sobres al usuario
        $stmtAddPacks = $pdo->prepare("UPDATE users SET packs_available = packs_available + ? WHERE id = ?");
        $stmtAddPacks->execute([$totalGained, $userId]);

        // AUDITORÍA
        $stmtAudit = $pdo->prepare("INSERT INTO audit_packs (user_id, source_type, source_id, amount) VALUES (?, 'trade', ?, ?)");
        $stmtAudit->execute([$userId, "Canje x$amount", $totalGained]);

        $pdo->commit();
        $msg = $extra > 0 ? "¡Canjeado! +$extra EXTRA de regalo." : "¡Canje exitoso!";
        jsonResponse(true, $msg, ['extra_amount' => $extra]);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, $e->getMessage());
    }
}
