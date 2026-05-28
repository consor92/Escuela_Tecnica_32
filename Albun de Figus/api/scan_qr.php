<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

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
        // 2. Validar Cooldown (6 horas)
        $stmtCheck = $pdo->prepare("
            SELECT scanned_at FROM qr_scans 
            WHERE user_id = ? AND qr_station_id = ? 
            ORDER BY scanned_at DESC LIMIT 1
        ");
        $stmtCheck->execute([$userId, $stationId]);
        $lastScan = $stmtCheck->fetchColumn();

        if ($lastScan) {
            $diff = time() - strtotime($lastScan);
            if ($diff < (6 * 3600)) {
                $rem = (6 * 3600) - $diff;
                $h = floor($rem / 3600);
                $m = floor(($rem % 3600) / 60);
                jsonResponse(false, "Ya reclamaste este premio. Vuelve en {$h}h {$m}m.");
            }
        }

        // 3. Otorgar premio + Auditoría + Scan
        $pdo->beginTransaction();
        try {
            // Registrar Escaneo
            $stmtScan = $pdo->prepare("INSERT INTO qr_scans (user_id, qr_station_id, scanned_at) VALUES (?, ?, NOW())");
            $stmtScan->execute([$userId, $stationId]);

            // Auditoría de Sobres
            $stmtAudit = $pdo->prepare("INSERT INTO audit_packs (user_id, source_type, source_id, amount) VALUES (?, 'qr', ?, 1)");
            $stmtAudit->execute([$userId, $station['display_name']]);

            // Sumar al usuario
            $stmtUser = $pdo->prepare("UPDATE users SET packs_available = packs_available + 1 WHERE id = ?");
            $stmtUser->execute([$userId]);

            $pdo->commit();
            jsonResponse(true, "¡QR Validado! Recibiste 1 SOBRE. 🚀");
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
