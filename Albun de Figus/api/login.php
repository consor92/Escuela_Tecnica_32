<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';

/**
 * Endpoint de Login
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Método no permitido');
}

$username = cleanInput($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    jsonResponse(false, 'Usuario y contraseña requeridos');
}

$stmt = $pdo->prepare("SELECT id, password, is_admin, role FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(false, 'Usuario no encontrado en la base de datos');
}

if (password_verify($password, $user['password'])) {
    // Session ID actual
    $newSessionId = session_id();
    if (!$newSessionId) {
        session_start();
        $newSessionId = session_id();
    }

    try {
        // Actualizar base de datos con el nuevo session_id
        $stmtUpdate = $pdo->prepare("UPDATE users SET last_session_id = ? WHERE id = ?");
        $stmtUpdate->execute([$newSessionId, $user['id']]);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['last_activity'] = time();
        $_SESSION['session_token'] = $newSessionId;
        
        // Si hay un QR pendiente, redirigir a procesarlo
        $redirectUrl = 'dashboard.php';
        if ($user['role'] === 'admin') {
            $redirectUrl = 'admin/dashboard.php';
        } elseif ($user['role'] === 'docente') {
            $redirectUrl = 'docente/dashboard.php';
        }

        if (isset($_SESSION['pending_qr'])) {
            $redirectUrl = 'scan_process.php';
        }

        jsonResponse(true, 'Inicio de sesión exitoso', [
            'is_admin' => ($user['role'] === 'admin'),
            'role' => $user['role'],
            'redirect' => $redirectUrl
        ]);
    } catch (PDOException $e) {
        error_log("Error en Login: " . $e->getMessage());
        jsonResponse(false, 'Error en el servidor al procesar la sesión. Verifica la base de datos.');
    }
} else {
    jsonResponse(false, 'Contraseña incorrecta');
}
?>
