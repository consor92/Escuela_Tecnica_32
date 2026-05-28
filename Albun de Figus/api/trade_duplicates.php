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
    $stmt = $pdo->prepare("
        SELECT i.quantity, s.rarity, i.is_stuck
        FROM user_inventory i
        JOIN stickers s ON i.sticker_id = s.id
        WHERE i.user_id = ? AND i.quantity > 1
    ");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll();

    $points = 0;
    $counts = ['common'=>0,'uncommon'=>0,'rare'=>0,'holo'=>0,'gold'=>0];
    
    $rates = ['common'=>1, 'uncommon'=>2, 'rare'=>3, 'holo'=>4, 'gold'=>5];

    foreach ($items as $item) {
        $duplicates = $item['quantity'] - 1;
        $points += ($duplicates * $rates[$item['rarity']]);
        $counts[$item['rarity']] += $duplicates;
    }

    jsonResponse(true, "Cálculo", ['points' => $points, 'counts' => $counts]);
}

// 2. REALIZAR CANJE
if ($action === 'trade') {
    $amount = intval($_POST['amount'] ?? 1); // 1, 5, 10 sobres
    if (!in_array($amount, [1, 5, 10])) jsonResponse(false, "Cantidad no válida.");

    $cost = $amount * 10;
    
    $pdo->beginTransaction();

    try {
        // Recolectar repetidas (quantity - 1) priorizando menor rareza
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
        $currentPoints = 0;
        $toDeduct = [];

        foreach ($inventory as $item) {
            $dups = $item['quantity'] - 1;
            for ($i = 0; $i < $dups; $i++) {
                if ($currentPoints < $cost) {
                    $currentPoints += $rates[$item['rarity']];
                    $toDeduct[$item['id']] = ($toDeduct[$item['id']] ?? 0) + 1;
                }
            }
            if ($currentPoints >= $cost) break;
        }

        if ($currentPoints < $cost) {
            throw new Exception("No tienes suficientes puntos de repetidas ($currentPoints/$cost).");
        }

        // Aplicar descuentos
        foreach ($toDeduct as $invId => $qty) {
            $st = $pdo->prepare("UPDATE user_inventory SET quantity = quantity - ? WHERE id = ?");
            $st->execute([$qty, $invId]);
        }

        // Calcular sobres extra (10% por sobre)
        $extra = 0;
        for ($i = 0; $i < $amount; $i++) {
            if (random_int(1, 10) === 1) $extra++;
        }
        $totalGained = $amount + $extra;

        // Sumar sobres
        $stmtUser = $pdo->prepare("UPDATE users SET packs_available = packs_available + ? WHERE id = ?");
        $stmtUser->execute([$totalGained, $userId]);

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
