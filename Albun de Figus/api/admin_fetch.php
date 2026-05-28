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
    $search = $_GET['search'] ?? '';
    
    $allowedOrder = ['completed_at', 'full_name', 'course', 'packs_available'];
    if (!in_array($order, $allowedOrder)) $order = 'completed_at';
    
    $sql = "SELECT id, full_name, username, course, packs_available, album_completed, completed_at FROM users WHERE is_admin = 0";
    $params = [];
    
    if (!empty($search)) {
        $sql .= " AND (full_name LIKE ? OR course LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }
    
    $sql .= " ORDER BY $order ASC";
    
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

jsonResponse(false, "Acción no válida");
