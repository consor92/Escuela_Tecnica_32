<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

// Seguridad: Solo admin
if (!isLoggedIn()) jsonResponse(false, "No autorizado");
$user = getCurrentUser($pdo);
if (!$user || !$user['is_admin']) jsonResponse(false, "Acceso denegado");

$action = $_GET['action'] ?? '';

if ($action === 'generate_batch') {
    $teacher_id = intval($_POST['teacher_id'] ?? 0);
    $reference = cleanInput($_POST['reference'] ?? 'Sin referencia');
    $quantity = intval($_POST['quantity'] ?? 1);
    
    if (($teacher_id <= 0 && $teacher_id !== -1) || $quantity <= 0) {
        jsonResponse(false, "Datos inválidos.");
    }

    try {
        $pdo->beginTransaction();

        $expiresAt = date('Y-m-d H:i:s', strtotime('+72 hours'));
        $targetIds = [];

        if ($teacher_id === -1) {
            // Generar para TODOS los docentes y admins
            $stmtAll = $pdo->query("SELECT id FROM users WHERE role IN ('admin', 'docente')");
            $targetIds = $stmtAll->fetchAll(PDO::FETCH_COLUMN);
            $reference .= " (Masivo)";
        } else {
            $targetIds = [$teacher_id];
        }

        foreach ($targetIds as $tid) {
            // 1. Crear el Lote
            $stmtBatch = $pdo->prepare("INSERT INTO promo_batches (teacher_id, admin_id, reference, quantity, expires_at) VALUES (?, ?, ?, ?, ?)");
            $stmtBatch->execute([$tid, $user['id'], $reference, $quantity, $expiresAt]);
            $batchId = $pdo->lastInsertId();

            // 2. Generar Códigos Únicos
            $stmtCode = $pdo->prepare("INSERT INTO promo_codes (batch_id, code, packs_reward, expires_at, max_uses) VALUES (?, ?, 1, ?, 1)");
            
            for ($i = 0; $i < $quantity; $i++) {
                $uniqueCode = strtoupper(substr(md5(uniqid($tid . mt_rand(), true)), 0, 8));
                try {
                    $stmtCode->execute([$batchId, "FIGU-" . $uniqueCode, $expiresAt]);
                } catch (Exception $e) {
                    $i--; // Reintentar si hay colisión
                }
            }
        }

        $pdo->commit();
        jsonResponse(true, "Lote(s) generado(s) exitosamente.");
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, "Error: " . $e->getMessage());
    }
}

if ($action === 'get_promo_settings') {
    $enabled = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'welcome_promo_enabled'")->fetchColumn() === '1';
    $qty = intval($pdo->query("SELECT `value` FROM settings WHERE `key` = 'welcome_promo_quantity'")->fetchColumn() ?: 10);
    jsonResponse(true, "Settings", ['enabled' => $enabled, 'quantity' => $qty]);
}

if ($action === 'save_promo_settings') {
    $enabled = ($_POST['enabled'] ?? '0') === '1' ? '1' : '0';
    $qty = intval($_POST['quantity'] ?? 10);
    
    $pdo->prepare("UPDATE settings SET `value` = ? WHERE `key` = 'welcome_promo_enabled'")->execute([$enabled]);
    $pdo->prepare("UPDATE settings SET `value` = ? WHERE `key` = 'welcome_promo_quantity'")->execute([$qty]);
    
    jsonResponse(true, "Configuración de bienvenida guardada");
}

if ($action === 'get_batches') {
    $stmt = $pdo->query("
        SELECT b.*, u.full_name as teacher_name,
               (SELECT COUNT(*) FROM promo_codes c WHERE c.batch_id = b.id AND c.is_used = 1) as used_count
        FROM promo_batches b
        JOIN users u ON b.teacher_id = u.id
        ORDER BY b.created_at DESC
    ");
    $batches = $stmt->fetchAll();

    foreach ($batches as &$b) {
        $stmtCodes = $pdo->prepare("
            SELECT c.*, u.full_name as used_by, upc.used_at
            FROM promo_codes c
            LEFT JOIN user_promo_codes upc ON c.id = upc.code_id
            LEFT JOIN users u ON upc.user_id = u.id
            WHERE c.batch_id = ?
        ");
        $stmtCodes->execute([$b['id']]);
        $b['codes'] = $stmtCodes->fetchAll();
    }

    jsonResponse(true, "Listado de lotes", $batches);
}

if ($action === 'get_teachers') {
    // Solo permitir roles que puedan entregar códigos (Sistema/Admin o Profesores)
    $stmt = $pdo->query("SELECT id, full_name, username, is_admin FROM users WHERE role IN ('admin', 'docente') ORDER BY is_admin DESC, full_name ASC");
    jsonResponse(true, "Profesores y Admin", $stmt->fetchAll());
}

jsonResponse(false, "Acción no válida");
?>