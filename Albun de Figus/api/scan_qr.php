<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

// Si la petición NO es fetch (no trae format=json), redirigir a la página de proceso visual
if (($_GET['format'] ?? '') !== 'json') {
    $slug = cleanInput($_GET['slug'] ?? '');
    header("Location: ../scan_process.php?slug=" . $slug);
    exit();
}

if (!isLoggedIn()) {
    jsonResponse(false, "Debes iniciar sesión para escanear QRs.");
}

$userId = $_SESSION['user_id'];
$slug = cleanInput($_GET['slug'] ?? '');

if (empty($slug)) {
    jsonResponse(false, "Código QR no válido.");
}

try {
    // 1. Verificar que el QR existe por su SLUG
    $stmtStation = $pdo->prepare("SELECT id, type, display_name FROM qr_stations WHERE slug = ?");
    $stmtStation->execute([$slug]);
    $station = $stmtStation->fetch();

    if (!$station) {
        jsonResponse(false, "Este código QR no es válido o ha sido eliminado.");
    }

    $stationId = $station['id'];
    $type = $station['type'];

    if ($type === 'pack') {
        // 2. Validar Cooldown (Dinámico desde DB)
        $stmtCooldown = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'qr_cooldown'");
        $cooldownHours = (int)($stmtCooldown->fetchColumn() ?: 6);
        $cooldownSeconds = $cooldownHours * 3600;

        $stmtCheck = $pdo->prepare("
            SELECT TIMESTAMPDIFF(SECOND, scanned_at, NOW()) 
            FROM qr_scans 
            WHERE user_id = ? AND qr_station_id = ? 
            ORDER BY scanned_at DESC LIMIT 1
        ");
        $stmtCheck->execute([$userId, $stationId]);
        $diff = $stmtCheck->fetchColumn();

        if ($diff !== false && $diff < $cooldownSeconds) {
            $rem = $cooldownSeconds - $diff;
            $h = floor($rem / 3600);
            $m = floor(($rem % 3600) / 60);
            jsonResponse(false, "Ya reclamaste este premio. Vuelve en {$h}h {$m}m.");
        }

        // 3. Otorgar premio (VARIABLE 1-5) + Auditoría + Scan
        $pdo->beginTransaction();
        try {
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

            // Registrar Escaneo
            $stmtScan = $pdo->prepare("INSERT INTO qr_scans (user_id, qr_station_id, scanned_at) VALUES (?, ?, NOW())");
            $stmtScan->execute([$userId, $stationId]);

            // Auditoría de Sobres
            $stmtAudit = $pdo->prepare("INSERT INTO audit_packs (user_id, source_type, source_id, amount) VALUES (?, 'qr', ?, ?)");
            $stmtAudit->execute([$userId, $station['display_name'], $packsGained]);

            // Sumar al usuario
            $stmtUser = $pdo->prepare("UPDATE users SET packs_available = packs_available + ? WHERE id = ?");
            $stmtUser->execute([$packsGained, $userId]);

            $pdo->commit();
            
            $msg = ($packsGained > 1) ? "¡Increíble! Encontraste un botín de $packsGained SOBRES." : "¡QR Validado! Recibiste 1 SOBRE.";
            jsonResponse(true, $msg, ['amount' => $packsGained]);
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }

    } elseif ($type === 'trivia') {
        // Registrar visita por estadística
        $stmtScan = $pdo->prepare("INSERT INTO qr_scans (user_id, qr_station_id, scanned_at) VALUES (?, ?, NOW())");
        $stmtScan->execute([$userId, $stationId]);
        
        jsonResponse(true, "Redirigiendo a la trivia...", ['redirect' => 'trivias.php']);
    }

} catch (Exception $e) {
    jsonResponse(false, "Error al procesar QR: " . $e->getMessage());
}
