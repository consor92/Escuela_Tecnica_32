<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

if (!isLoggedIn()) jsonResponse(false, "No autorizado");
$user = getCurrentUser($pdo);
if (!$user) jsonResponse(false, "Acceso denegado");

$action = $_GET['action'] ?? '';

// --- ACCIÓN UNIVERSAL: CAMBIAR MI PROPIA CONTRASEÑA ---
if ($action === 'change_my_password') {
    $currentPass = $_POST['current_password'] ?? '';
    $newPass = $_POST['new_password'] ?? '';
    if (empty($currentPass) || empty($newPass)) jsonResponse(false, "Datos incompletos");

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $hashed = $stmt->fetchColumn();

    if (password_verify($currentPass, $hashed)) {
        $newHashed = password_hash($newPass, PASSWORD_DEFAULT);
        $stmtUpdate = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmtUpdate->execute([$newHashed, $user['id']]);
        jsonResponse(true, "Contraseña actualizada correctamente");
    } else {
        jsonResponse(false, "La contraseña actual es incorrecta");
    }
}

// --- ACCIÓN UNIVERSAL: OBTENER MIS SOBRES ACTUALES ---
if ($action === 'get_user_packs') {
    $stmt = $pdo->prepare("SELECT packs_available FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $packs = $stmt->fetchColumn();
    jsonResponse(true, "Balance de sobres", ['packs_available' => intval($packs)]);
}

// --- ACCIÓN PARA DOCENTES Y ADMINS: RESETEAR CLAVE DE ALUMNO ---
if ($action === 'reset_user_password') {
    // Solo admins o docentes pueden resetear
    if (!$user['is_admin'] && $user['role'] !== 'docente') jsonResponse(false, "No tienes permiso");

    $targetId = intval($_POST['user_id'] ?? 0);
    if ($targetId <= 0) jsonResponse(false, "Usuario no válido");

    // Seguridad: Los docentes solo pueden resetear alumnos. Los admins a cualquiera (excepto otros admins tal vez)
    $whereClause = $user['is_admin'] ? "id = ? AND is_admin = 0" : "id = ? AND role = 'alumno'";
    
    // Generar password de 8 números
    $newPass = str_pad(mt_rand(0, 99999999), 8, '0', STR_PAD_LEFT);
    $hashed = password_hash($newPass, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE $whereClause");
    $stmt->execute([$hashed, $targetId]);

    if ($stmt->rowCount() > 0) {
        jsonResponse(true, "Contraseña restablecida", ['new_password' => $newPass]);
    } else {
        jsonResponse(false, "No se pudo restablecer la contraseña");
    }
}

// --- TODAS LAS DEMÁS ACCIONES REQUIEREN SER ADMIN ---
if (!$user['is_admin']) jsonResponse(false, "Acceso denegado");

// 1. Obtener Lista de Alumnos con Filtros
if ($action === 'get_alumnos') {
    $order = $_GET['order'] ?? 'completed_at';
    $dir = $_GET['dir'] ?? 'ASC';
    $search = $_GET['search'] ?? '';
    
    $allowedOrder = ['completed_at', 'full_name', 'course', 'packs_available', 'stuck_count'];
    if (!in_array($order, $allowedOrder)) $order = 'completed_at';
    
    $dir = strtoupper($dir) === 'DESC' ? 'DESC' : 'ASC';
    
    $sql = "
        SELECT 
            u.id, u.full_name, u.username, u.course, u.packs_available, u.album_completed, u.completed_at, u.is_admin,
            (SELECT COUNT(*) FROM user_inventory ui WHERE ui.user_id = u.id AND ui.is_stuck = 1) as stuck_count
        FROM users u 
        WHERE 1=1";
    $params = [];
    
    if (!empty($search)) {
        $sql .= " AND (u.full_name LIKE ? OR u.course LIKE ? OR u.username LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    $sql .= " ORDER BY $order $dir";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    jsonResponse(true, "Listado alumnos", $stmt->fetchAll());
}

// 2. Obtener Historial de un Alumno
if ($action === 'get_audit') {
    $uid = intval($_GET['user_id'] ?? 0);
    $stmt = $pdo->prepare("SELECT * FROM audit_packs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100");
    $stmt->execute([$uid]);
    jsonResponse(true, "Historial sobres", $stmt->fetchAll());
}

// 3. Obtener Estaciones QR
if ($action === 'get_qr') {
    $stmt = $pdo->query("
        SELECT s.*, COUNT(sc.id) as total_scans 
        FROM qr_stations s 
        LEFT JOIN qr_scans sc ON s.id = sc.qr_station_id 
        GROUP BY s.id 
        ORDER BY s.created_at DESC
    ");
    jsonResponse(true, "Listado QR", $stmt->fetchAll());
}

// NUEVA: Obtener Escaneos Detallados de un QR
if ($action === 'get_qr_scans') {
    $qid = intval($_GET['qr_id'] ?? 0);
    $stmtQR = $pdo->prepare("SELECT display_name, type FROM qr_stations WHERE id = ?");
    $stmtQR->execute([$qid]);
    $qrInfo = $stmtQR->fetch();
    if (!$qrInfo) jsonResponse(false, "QR no encontrado");

    $qrType = $qrInfo['type'];
    $qrName = $qrInfo['display_name'];
    $timeWindow = ($qrType === 'pack') ? 10 : 600;
    $sourceType = ($qrType === 'pack') ? 'qr' : 'trivia';

    $sql = "
        SELECT 
            u.full_name, u.course, sc.scanned_at,
            (SELECT COUNT(*) FROM audit_packs ap 
             WHERE ap.user_id = sc.user_id 
             AND ap.source_type = ?
             AND (
                (? = 'qr' AND ap.source_id = ?) OR (? = 'trivia')
             )
             AND ap.created_at >= sc.scanned_at
             AND ap.created_at <= DATE_ADD(sc.scanned_at, INTERVAL ? SECOND)
            ) as won_pack
        FROM qr_scans sc 
        JOIN users u ON sc.user_id = u.id 
        WHERE sc.qr_station_id = ? 
        ORDER BY sc.scanned_at DESC 
        LIMIT 200
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$sourceType, $sourceType, $qrName, $sourceType, $timeWindow, $qid]);
    jsonResponse(true, "Escaneos QR", $stmt->fetchAll());
}

// 4. Obtener Códigos y sus usos
if ($action === 'get_promo') {
    $stmt = $pdo->query("
        SELECT c.*, (c.expires_at < NOW()) as expired, b.reference, u_prof.full_name as teacher_name
        FROM promo_codes c
        LEFT JOIN promo_batches b ON c.batch_id = b.id
        LEFT JOIN users u_prof ON b.teacher_id = u_prof.id
        ORDER BY c.created_at DESC LIMIT 100
    ");
    $codes = $stmt->fetchAll();

    foreach($codes as &$c) {
        $stmtUsos = $pdo->prepare("
            SELECT u.full_name, u.course, upc.used_at
            FROM user_promo_codes upc
            JOIN users u ON upc.user_id = u.id
            WHERE upc.code_id = ?
            ORDER BY upc.used_at DESC
        ");
        $stmtUsos->execute([$c['id']]);
        $c['uses'] = $stmtUsos->fetchAll();
    }
    jsonResponse(true, "Listado promo", $codes);
}

// 5. Configuración URL
if ($action === 'save_url') {
    $url = $_POST['url'] ?? '';
    $driveUrl = $_POST['drive_url'] ?? 'https://lh3.googleusercontent.com/u/0/d/';
    $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('qr_base_url', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
    $stmt->execute([$url]);
    $stmtDrive = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('drive_base_url', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
    $stmtDrive->execute([$driveUrl]);
    jsonResponse(true, "Configuración guardada");
}

// --- GESTIÓN DE SUGERENCIAS ---
if ($action === 'get_suggestions') {
    try {
        $stmt = $pdo->query("
            SELECT s.*, u.full_name, u.course 
            FROM suggestions s 
            JOIN users u ON s.user_id = u.id 
            ORDER BY s.created_at ASC
        ");
        jsonResponse(true, "Listado de sugerencias", $stmt->fetchAll());
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

if ($action === 'update_suggestion_status') {
    $id = intval($_POST['id'] ?? 0);
    $status = $_POST['status'] ?? 'read';
    $allowed = ['pending', 'read', 'implemented'];
    if (!in_array($status, $allowed)) jsonResponse(false, "Estado no válido");
    
    try {
        $stmt = $pdo->prepare("UPDATE suggestions SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);
        jsonResponse(true, "Estado de sugerencia actualizado");
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

if ($action === 'delete_suggestion') {
    $id = intval($_POST['id'] ?? 0);
    try {
        $pdo->prepare("DELETE FROM suggestions WHERE id = ?")->execute([$id]);
        jsonResponse(true, "Sugerencia eliminada");
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

if ($action === 'get_url') {
    $stmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'qr_base_url'");
    $url = $stmt->fetchColumn();
    $stmtDrive = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'drive_base_url'");
    $driveUrl = $stmtDrive->fetchColumn();
    $stmtQR = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'qr_cooldown'");
    $qrCooldown = $stmtQR->fetchColumn() ?: '6';
    $stmtTr = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'trivia_cooldown'");
    $trCooldown = $stmtTr->fetchColumn() ?: '6';
    jsonResponse(true, "Configuración", [
        'url' => $url,
        'drive_url' => $driveUrl,
        'qr_cooldown' => $qrCooldown,
        'trivia_cooldown' => $trCooldown
    ]);
}

if ($action === 'save_cooldowns') {
    $qr = intval($_POST['qr_cooldown'] ?? 6);
    $tr = intval($_POST['trivia_cooldown'] ?? 6);
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('qr_cooldown', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$qr]);
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('trivia_cooldown', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$tr]);
    jsonResponse(true, "Tiempos de espera actualizados");
}

// 8. HAPPY HOUR Y MANTENIMIENTO
if ($action === 'toggle_happy_hour') {
    $status = ($_POST['status'] ?? '0') === '1' ? '1' : '0';
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('happy_hour', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$status]);
    jsonResponse(true, "Happy Hour " . ($status === '1' ? 'Activado' : 'Desactivado'));
}

if ($action === 'toggle_maintenance') {
    $status = ($_POST['status'] ?? '0') === '1' ? '1' : '0';
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('maintenance_mode', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$status]);
    jsonResponse(true, "Álbum " . ($status === '1' ? 'Offline (Mantenimiento)' : 'Online'));
}

if ($action === 'save_school_hours') {
    $enabled = ($_POST['enabled'] ?? '0') === '1' ? '1' : '0';
    $opening = intval($_POST['opening'] ?? 8);
    $closing = intval($_POST['closing'] ?? 22);
    
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('school_hours_enabled', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$enabled]);
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('school_opening_hour', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$opening]);
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('school_closing_hour', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$closing]);
    
    jsonResponse(true, "Configuración de horario escolar actualizada");
}

if ($action === 'get_status') {
    $happy = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'happy_hour'")->fetchColumn() === '1';
    $maint = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'maintenance_mode'")->fetchColumn() === '1';
    
    $stmtH = $pdo->query("SELECT `key`, value FROM settings WHERE `key` IN ('school_hours_enabled', 'school_opening_hour', 'school_closing_hour')");
    $hSettings = $stmtH->fetchAll(PDO::FETCH_KEY_PAIR);
    
    jsonResponse(true, "Status", [
        'happy' => $happy, 
        'maintenance' => $maint,
        'school_hours' => [
            'enabled' => ($hSettings['school_hours_enabled'] ?? '0') === '1',
            'opening' => intval($hSettings['school_opening_hour'] ?? 8),
            'closing' => intval($hSettings['school_closing_hour'] ?? 22)
        ]
    ]);
}

if ($action === 'get_happy_hour') {
    jsonResponse(true, "Status", ['active' => $pdo->query("SELECT `value` FROM settings WHERE `key` = 'happy_hour'")->fetchColumn() === '1']);
}

// 9. RAREZAS...
if ($action === 'save_rarities') {
    $common = intval($_POST['common'] ?? 70);
    $uncommon = intval($_POST['uncommon'] ?? 18);
    $rare = intval($_POST['rare'] ?? 8);
    $holo = intval($_POST['holo'] ?? 3);
    $gold = intval($_POST['gold'] ?? 1);
    if (($common + $uncommon + $rare + $holo + $gold) !== 100) jsonResponse(false, "Las probabilidades deben sumar exactamente 100%");
    $rarities = json_encode(['common' => $common, 'uncommon' => $uncommon, 'rare' => $rare, 'holo' => $holo, 'gold' => $gold]);
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('rarity_rates', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$rarities]);
    jsonResponse(true, "Probabilidades actualizadas");
}

if ($action === 'get_rarities') {
    $val = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'rarity_rates'")->fetchColumn();
    $rates = $val ? json_decode($val, true) : ['common' => 70, 'uncommon' => 18, 'rare' => 8, 'holo' => 3, 'gold' => 1];
    $promoRates = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'promo_reward_rates'")->fetchColumn();
    $promo = $promoRates ? json_decode($promoRates, true) : ["1"=>20,"2"=>20,"3"=>20,"4"=>20,"5"=>20];
    $tradeBonus = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'trade_bonus_rate'")->fetchColumn() ?: '10';
    jsonResponse(true, "Rarezas y Recompensas", ['stickers' => $rates, 'promo' => $promo, 'trade_bonus' => $tradeBonus]);
}

if ($action === 'save_trade_bonus') {
    $rate = intval($_POST['rate'] ?? 10);
    if ($rate < 0 || $rate > 100) jsonResponse(false, "El porcentaje debe estar entre 0 y 100");
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('trade_bonus_rate', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$rate]);
    jsonResponse(true, "Probabilidad de bonus de canje actualizada");
}

if ($action === 'save_promo_rates') {
    $p1 = intval($_POST['p1'] ?? 20);
    $p2 = intval($_POST['p2'] ?? 20);
    $p3 = intval($_POST['p3'] ?? 20);
    $p4 = intval($_POST['p4'] ?? 20);
    $p5 = intval($_POST['p5'] ?? 20);
    if (($p1 + $p2 + $p3 + $p4 + $p5) !== 100) jsonResponse(false, "Las probabilidades de sobres deben sumar 100%");
    $rates = json_encode(["1"=>$p1, "2"=>$p2, "3"=>$p3, "4"=>$p4, "5"=>$p5]);
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('promo_reward_rates', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$rates]);
    jsonResponse(true, "Probabilidades de sobres actualizadas");
}

// 7. SIMULADOR (Sin afectar DB)
if ($action === 'test_open_pack') {
    $val = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'rarity_rates'")->fetchColumn();
    $rates = $val ? json_decode($val, true) : ['common'=>70, 'uncommon'=>18, 'rare'=>8, 'holo'=>3, 'gold'=>1];
    $stickersObtained = [];
    for ($i = 0; $i < 5; $i++) {
        $rand = rand(1, 100); $acc = 0; $rarity = 'common';
        if ($rand <= ($acc += $rates['common'])) $rarity = 'common';
        elseif ($rand <= ($acc += $rates['uncommon'])) $rarity = 'uncommon';
        elseif ($rand <= ($acc += $rates['rare'])) $rarity = 'rare';
        elseif ($rand <= ($acc += $rates['holo'])) $rarity = 'holo';
        else $rarity = 'gold';
        $stmtS = $pdo->prepare("SELECT id, number, name, rarity, external_url FROM stickers WHERE rarity = ? ORDER BY RAND() LIMIT 1");
        $stmtS->execute([$rarity]);
        $sticker = $stmtS->fetch();
        if (!$sticker) $sticker = $pdo->query("SELECT id, number, name, rarity, external_url FROM stickers ORDER BY RAND() LIMIT 1")->fetch();
        if ($sticker) $sticker['external_url'] = getDriveUrl($pdo, $sticker['external_url']);
        $stickersObtained[] = $sticker;
    }
    jsonResponse(true, "Simulación exitosa", ['stickers' => $stickersObtained]);
}

// 10. PODIO Y TURNOS
if ($action === 'get_podium') {
    $albums = $pdo->query("SELECT id, name FROM albums WHERE is_active = 1")->fetchAll();
    $podiumData = [];
    $restriction = $pdo->query("SELECT settings.value FROM settings WHERE settings.key = 'podium_turn_restriction'")->fetchColumn() === '1';
    foreach ($albums as $album) {
        $officialPodium = [];
        if ($restriction) {
            $shifts = ['mañana', 'tarde', 'vespertino'];
            $winners = [];
            foreach ($shifts as $s) {
                $stmtS = $pdo->prepare("SELECT id, full_name, course, shift, completed_at, created_at, TIMESTAMPDIFF(SECOND, created_at, completed_at) as duration_seconds FROM users WHERE album_completed = 1 AND is_admin = 0 AND shift = ? ORDER BY completed_at ASC LIMIT 1");
                $stmtS->execute([$s]);
                $w = $stmtS->fetch(); if ($w) $winners[] = $w;
            }
            usort($winners, function($a, $b) { return strtotime($a['completed_at']) - strtotime($b['completed_at']); });
            $officialPodium = $winners;
        } else {
            $stmtTop = $pdo->query("SELECT id, full_name, course, shift, completed_at, created_at, TIMESTAMPDIFF(SECOND, created_at, completed_at) as duration_seconds FROM users WHERE album_completed = 1 AND is_admin = 0 ORDER BY completed_at ASC LIMIT 3");
            $officialPodium = $stmtTop->fetchAll();
        }
        foreach ($officialPodium as &$p) {
            $h = floor($p['duration_seconds'] / 3600); $m = floor(($p['duration_seconds'] % 3600) / 60);
            $p['duration_formatted'] = "{$h}h {$m}m";
        }
        $podiumData[] = ['album_id' => $album['id'], 'album_name' => $album['name'], 'official_podium' => $officialPodium];
    }
    jsonResponse(true, "Datos del podio", ['podiums' => $podiumData, 'restriction' => $restriction]);
}

if ($action === 'toggle_podium_restriction') {
    $status = ($_POST['status'] ?? $_GET['status'] ?? '0') === '1' ? '1' : '0';
    $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('podium_turn_restriction', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)")->execute([$status]);
    jsonResponse(true, "Restricción de turno " . ($status === '1' ? 'Activada' : 'Desactivada'), ['status' => $status]);
}

if ($action === 'get_courses_shifts') {
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS course_shifts (course VARCHAR(50) PRIMARY KEY, shift ENUM('mañana', 'tarde', 'vespertino') DEFAULT 'vespertino') ENGINE=InnoDB");
        
        // Solo auto-insertar si no existen, pero NUNCA borrar
        $pdo->exec("
            INSERT IGNORE INTO course_shifts (course) 
            SELECT DISTINCT course FROM users WHERE role = 'alumno' AND course IS NOT NULL AND course != ''
            UNION 
            SELECT DISTINCT course FROM whitelist WHERE course IS NOT NULL AND course != ''
        ");
        
        jsonResponse(true, "Cursos y turnos", $pdo->query("SELECT * FROM course_shifts ORDER BY course ASC")->fetchAll());
    } catch (Exception $e) { jsonResponse(false, "Error al obtener cursos: " . $e->getMessage()); }
}

if ($action === 'delete_course_shift') {
    $course = $_POST['course'] ?? '';
    if (empty($course)) jsonResponse(false, "Curso no especificado");
    $pdo->prepare("DELETE FROM course_shifts WHERE course = ?")->execute([$course]);
    jsonResponse(true, "Curso $course eliminado de la gestión de turnos");
}

if ($action === 'save_course_shift') {
    $course = $_POST['course'] ?? ''; $shift = $_POST['shift'] ?? '';
    if (empty($course) || empty($shift)) jsonResponse(false, "Datos incompletos");
    $pdo->prepare("INSERT INTO course_shifts (course, shift) VALUES (?, ?) ON DUPLICATE KEY UPDATE shift = VALUES(shift)")->execute([$course, $shift]);
    $pdo->prepare("UPDATE users SET shift = ? WHERE course = ?")->execute([$shift, $course]);
    jsonResponse(true, "Turno actualizado para el curso $course");
}

if ($action === 'register_docente') {
    $fullName = trim($_POST['full_name'] ?? ''); $username = trim($_POST['username'] ?? ''); $dni = trim($_POST['dni'] ?? '');
    if (empty($fullName) || empty($username) || empty($dni)) jsonResponse(false, "Todos los campos son obligatorios");
    $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmtCheck->execute([$username]);
    if ($stmtCheck->fetch()) jsonResponse(false, "El nombre de usuario ya está registrado");
    $hashedPass = password_hash($dni, PASSWORD_DEFAULT);
    try {
        if ($pdo->prepare("INSERT INTO users (full_name, username, password, role, course, shift) VALUES (?, ?, ?, 'docente', 'Profesor', 'vespertino')")->execute([$fullName, $username, $hashedPass])) {
            $newTeacherId = $pdo->lastInsertId();
            
            // --- AUTO-GENERAR LOTE DE BIENVENIDA ---
            $welcomeEnabled = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'welcome_promo_enabled'")->fetchColumn() === '1';
            if ($welcomeEnabled) {
                $qty = intval($pdo->query("SELECT `value` FROM settings WHERE `key` = 'welcome_promo_quantity'")->fetchColumn() ?: 10);
                $expiresAt = date('Y-m-d H:i:s', strtotime('+72 hours'));
                
                $pdo->prepare("INSERT INTO promo_batches (teacher_id, admin_id, reference, quantity, expires_at) VALUES (?, ?, 'Bienvenida (Auto)', ?, ?)")
                    ->execute([$newTeacherId, $user['id'], $qty, $expiresAt]);
                $batchId = $pdo->lastInsertId();

                $stmtCode = $pdo->prepare("INSERT INTO promo_codes (batch_id, code, packs_reward, expires_at, max_uses) VALUES (?, ?, 1, ?, 1)");
                for ($i = 0; $i < $qty; $i++) {
                    $uniqueCode = strtoupper(substr(md5(uniqid($newTeacherId . mt_rand(), true)), 0, 8));
                    try { $stmtCode->execute([$batchId, "FIGU-" . $uniqueCode, $expiresAt]); } catch (Exception $e) { $i--; }
                }
            }

            jsonResponse(true, "Docente $fullName registrado con éxito. Clave inicial: $dni");
        } else jsonResponse(false, "Error en la base de datos al insertar");
    } catch (PDOException $e) { jsonResponse(false, "Excepción: " . $e->getMessage()); }
}

// --- GESTIÓN DE ÁLBUMES ---
if ($action === 'get_albums') {
    try {
        $stmt = $pdo->query("SELECT * FROM albums ORDER BY id ASC");
        $albums = $stmt->fetchAll();
        $fields = ['cover_img', 'back_cover_img', 'page_bg_p1', 'page_bg_p2', 'page_bg_p3', 'page_bg_p4', 'page_bg_p5', 'honor_page_1_bg', 'honor_page_2_bg', 'pack_img', 'sticker_back_img', 'sticker_frame_border_img'];
        foreach ($albums as &$a) {
            foreach($fields as $f) {
                if (!isset($a[$f])) continue;
                $a[$f . '_raw'] = $a[$f];
                // Solo aplicar getDriveUrl si no parece una ruta local (assets/) ni es una URL completa
                if (!empty($a[$f]) && strpos($a[$f], 'assets/') !== 0 && !filter_var($a[$f], FILTER_VALIDATE_URL)) {
                    $a[$f] = getDriveUrl($pdo, $a[$f]);
                }
            }
        }
        jsonResponse(true, "Listado de álbumes", $albums);
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

if ($action === 'get_album_stickers') {
    $album_id = intval($_GET['album_id'] ?? 0);
    if ($album_id <= 0) jsonResponse(false, "ID de álbum no válido");
    try {
        $stmt = $pdo->prepare("SELECT id, number, name, external_url FROM stickers WHERE album_id = ? ORDER BY number ASC");
        $stmt->execute([$album_id]);
        jsonResponse(true, "Figuritas del álbum", $stmt->fetchAll());
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

if ($action === 'save_bulk_sticker_urls') {
    $data = json_decode(file_get_contents('php://input'), true);
    $urls = $data['urls'] ?? [];
    if (empty($urls)) jsonResponse(false, "No hay datos para guardar");
    
    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare("UPDATE stickers SET external_url = ? WHERE id = ?");
        foreach ($urls as $id => $url) {
            $stmt->execute([$url, $id]);
        }
        $pdo->commit();
        jsonResponse(true, "URLs de figuritas actualizadas");
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(false, "Error: " . $e->getMessage());
    }
}

if ($action === 'save_album') {
    $id = intval($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $total = intval($_POST['total_stickers'] ?? 50);
    $cover = trim($_POST['cover_img'] ?? 'assets/img/tapa.png');
    $back = trim($_POST['back_cover_img'] ?? 'assets/img/lomo.png');
    $p1 = trim($_POST['page_bg_p1'] ?? '');
    $p2 = trim($_POST['page_bg_p2'] ?? '');
    $p3 = trim($_POST['page_bg_p3'] ?? '');
    $p4 = trim($_POST['page_bg_p4'] ?? '');
    $p5 = trim($_POST['page_bg_p5'] ?? '');
    $h1 = trim($_POST['honor_page_1_bg'] ?? '');
    $h2 = trim($_POST['honor_page_2_bg'] ?? '');
    $pack = trim($_POST['pack_img'] ?? '');
    $s_back = trim($_POST['sticker_back_img'] ?? 'assets/img/dorso-proceres.png');
    $s_frame = trim($_POST['sticker_frame_border_img'] ?? 'assets/img/marco_figus.png');
    $active = intval($_POST['is_active'] ?? 1);

    if (empty($name)) jsonResponse(false, "El nombre es obligatorio");

    try {
        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE albums SET name = ?, total_stickers = ?, cover_img = ?, back_cover_img = ?, page_bg_p1 = ?, page_bg_p2 = ?, page_bg_p3 = ?, page_bg_p4 = ?, page_bg_p5 = ?, honor_page_1_bg = ?, honor_page_2_bg = ?, pack_img = ?, sticker_back_img = ?, sticker_frame_border_img = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$name, $total, $cover, $back, $p1, $p2, $p3, $p4, $p5, $h1, $h2, $pack, $s_back, $s_frame, $active, $id]);
            jsonResponse(true, "Álbum actualizado");
        } else {
            $stmt = $pdo->prepare("INSERT INTO albums (name, total_stickers, cover_img, back_cover_img, page_bg_p1, page_bg_p2, page_bg_p3, page_bg_p4, page_bg_p5, honor_page_1_bg, honor_page_2_bg, pack_img, sticker_back_img, sticker_frame_border_img, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $total, $cover, $back, $p1, $p2, $p3, $p4, $p5, $h1, $h2, $pack, $s_back, $s_frame, $active]);
            jsonResponse(true, "Álbum creado con éxito");
        }
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

// --- GESTIÓN DE FIGURITAS ---
if ($action === 'get_stickers') {
    try {
        $stmt = $pdo->query("SELECT s.*, a.name as album_name FROM stickers s JOIN albums a ON s.album_id = a.id ORDER BY a.id ASC, s.number ASC");
        $stickers = $stmt->fetchAll();
        foreach ($stickers as &$s) {
            $s['external_url_raw'] = $s['external_url']; // Guardar original para el editor
            $s['external_url'] = getDriveUrl($pdo, $s['external_url']);
        }
        jsonResponse(true, "Listado de figuritas", $stickers);
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

if ($action === 'save_sticker') {
    $id = intval($_POST['id'] ?? 0);
    $album_id = intval($_POST['album_id'] ?? 1);
    $number = intval($_POST['number'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $rarity = $_POST['rarity'] ?? 'common';
    $external_url = trim($_POST['external_url'] ?? '');

    if ($number <= 0 || empty($name) || empty($external_url)) jsonResponse(false, "Número, nombre y URL son obligatorios");
    
    // Validar rareza para el ENUM de la DB
    $allowedRarities = ['common', 'uncommon', 'rare', 'holo', 'gold'];
    if (!in_array($rarity, $allowedRarities)) $rarity = 'common';

    try {
        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE stickers SET album_id = ?, number = ?, name = ?, description = ?, rarity = ?, external_url = ? WHERE id = ?");
            $stmt->execute([$album_id, $number, $name, $description, $rarity, $external_url, $id]);
            jsonResponse(true, "Figurita actualizada");
        } else {
            $stmt = $pdo->prepare("INSERT INTO stickers (album_id, number, name, description, rarity, external_url) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$album_id, $number, $name, $description, $rarity, $external_url]);
            jsonResponse(true, "Figurita agregada");
        }
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

if ($action === 'delete_sticker') {
    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) jsonResponse(false, "ID no válido");
    try {
        $pdo->prepare("DELETE FROM stickers WHERE id = ?")->execute([$id]);
        jsonResponse(true, "Figurita eliminada");
    } catch (Exception $e) { jsonResponse(false, "Error: " . $e->getMessage()); }
}

jsonResponse(false, "Acción no válida");
