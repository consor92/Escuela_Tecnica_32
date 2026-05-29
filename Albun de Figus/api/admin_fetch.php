<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

if (!isLoggedIn()) jsonResponse(false, "No autorizado");
$user = getCurrentUser($pdo);
if (!$user || !$user['is_admin']) jsonResponse(false, "Acceso denegado");

$action = $_GET['action'] ?? '';

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
            u.id, u.full_name, u.username, u.course, u.packs_available, u.album_completed, u.completed_at,
            (SELECT COUNT(*) FROM user_inventory ui WHERE ui.user_id = u.id AND ui.is_stuck = 1) as stuck_count
        FROM users u 
        WHERE u.is_admin = 0";
    $params = [];
    
    if (!empty($search)) {
        $sql .= " AND (u.full_name LIKE ? OR u.course LIKE ?)";
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

// 4. Obtener Códigos y sus usos
if ($action === 'get_promo') {
    $stmt = $pdo->query("SELECT *, (expires_at < NOW()) as expired FROM promo_codes ORDER BY created_at DESC");
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
    $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('qr_base_url', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
    $stmt->execute([$url]);
    jsonResponse(true, "Configuración guardada");
}

if ($action === 'get_url') {
    $stmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'qr_base_url'");
    jsonResponse(true, "URL", ['url' => $stmt->fetchColumn()]);
}

// 6. RAREZAS
if ($action === 'save_rarities') {
    $common = intval($_POST['common'] ?? 70);
    $uncommon = intval($_POST['uncommon'] ?? 18);
    $rare = intval($_POST['rare'] ?? 8);
    $holo = intval($_POST['holo'] ?? 3);
    $gold = intval($_POST['gold'] ?? 1);

    // Validar que sumen 100
    if (($common + $uncommon + $rare + $holo + $gold) !== 100) {
        jsonResponse(false, "Las probabilidades deben sumar exactamente 100%");
    }

    $rarities = json_encode([
        'common' => $common,
        'uncommon' => $uncommon,
        'rare' => $rare,
        'holo' => $holo,
        'gold' => $gold
    ]);

    $stmt = $pdo->prepare("INSERT INTO settings (`key`, `value`) VALUES ('rarity_rates', ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)");
    $stmt->execute([$rarities]);
    jsonResponse(true, "Probabilidades actualizadas");
}

if ($action === 'get_rarities') {
    $stmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'rarity_rates'");
    $val = $stmt->fetchColumn();
    $rates = $val ? json_decode($val, true) : [
        'common' => 70,
        'uncommon' => 18,
        'rare' => 8,
        'holo' => 3,
        'gold' => 1
    ];
    jsonResponse(true, "Rarezas", $rates);
}

// 7. SIMULADOR (Sin afectar DB)
if ($action === 'test_open_pack') {
    $stmt = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'rarity_rates'");
    $val = $stmt->fetchColumn();
    $rates = $val ? json_decode($val, true) : ['common'=>70, 'uncommon'=>18, 'rare'=>8, 'holo'=>3, 'gold'=>1];

    $stickersObtained = [];
    for ($i = 0; $i < 5; $i++) {
        $rand = rand(1, 100);
        $acc = 0;
        $rarity = 'common';
        
        if ($rand <= ($acc += $rates['common'])) $rarity = 'common';
        elseif ($rand <= ($acc += $rates['uncommon'])) $rarity = 'uncommon';
        elseif ($rand <= ($acc += $rates['rare'])) $rarity = 'rare';
        elseif ($rand <= ($acc += $rates['holo'])) $rarity = 'holo';
        else $rarity = 'gold';

        $stmt = $pdo->prepare("SELECT id, number, name, rarity FROM stickers WHERE rarity = ? ORDER BY RAND() LIMIT 1");
        $stmt->execute([$rarity]);
        $sticker = $stmt->fetch();
        if (!$sticker) {
            $sticker = $pdo->query("SELECT id, number, name, rarity FROM stickers ORDER BY RAND() LIMIT 1")->fetch();
        }
        $stickersObtained[] = $sticker;
    }
    jsonResponse(true, "Simulación exitosa", ['stickers' => $stickersObtained]);
}

jsonResponse(false, "Acción no válida");
