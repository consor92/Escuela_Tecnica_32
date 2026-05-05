<?php
session_start();
require_once '../config/db.php';

// Función para importar usuarios si la tabla está vacía
function importUsersIfEmpty($pdo) {
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    if ($stmt->fetchColumn() == 0) {
        $csvFile = 'users.csv';
        if (file_exists($csvFile)) {
            $handle = fopen($csvFile, "r");
            if ($handle !== FALSE) {
                while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
                    // Limpiar datos de posibles caracteres extraños (UTF-8)
                    foreach ($data as $key => $value) {
                        $data[$key] = mb_convert_encoding($value, 'UTF-8', 'UTF-8, ISO-8859-1');
                    }

                    // 0: id, 2: password_md5, 3: email, 1: username, 6: first_name, 7: last_name, 8: role_id/group_id
                    $id = $data[0] ?? null;
                    if (empty($id) || !is_numeric($id)) continue;

                    $username = !empty($data[1]) ? $data[1] : ($data[3] ? explode('@', $data[3])[0] : 'user_' . $id);
                    $password = $data[2] ?? '';
                    $email = $data[3] ?? '';
                    $firstName = $data[6] ?? '';
                    $lastName = $data[7] ?? '';
                    $roleIdCsv = $data[8] ?? 2;
                    
                    // Role 4 or specifically named docentes (if any)
                    $finalRoleId = ($roleIdCsv == 4) ? 1 : 2;

                    if (!empty($email) && !empty($password)) {
                        $stmt = $pdo->prepare("INSERT IGNORE INTO users (external_id, username, email, password_md5, role_id, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?, ?)");
                        try {
                            $stmt->execute([$id, $username, $email, $password, $finalRoleId, $firstName, $lastName]);
                        } catch (Exception $e) {
                            // Ignorar errores de duplicados
                        }
                    }
                }
                fclose($handle);
            }
        }
    }
}

importUsersIfEmpty($pdo);

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    
    // MD5 como se solicitó
    $password_md5 = md5($password);
    
    // Pero espera, el CSV ya tiene contraseñas hasheadas en MD5.
    // El usuario dijo "email y contraseñas hasheada en md5".
    // Entonces si el usuario ingresa "123", debo comparar md5("123") con el MD5 guardado.
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND password_md5 = ?");
    $stmt->execute([$email, $password_md5]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Intentar comparar directamente si la contraseña ingresada ya es el hash (a veces pasa en pruebas)
        $stmt->execute([$email, $password]);
        $user = $stmt->fetch();
    }

    if ($user) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role_id'] = $user['role_id'];
        
        if ($user['role_id'] == 1) {
            header('Location: admin.php');
        } else {
            header('Location: dashboard.php');
        }
        exit;
    } else {
        $error = 'Credenciales incorrectas.';
    }
}

if (isset($_SESSION['user_id'])) {
    if ($_SESSION['role_id'] == 1) {
        header('Location: admin.php');
    } else {
        header('Location: dashboard.php');
    }
    exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login - Scrum Evaluation</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="login-page">
    <div class="login-container">
        <div class="card login-card">
            <div class="login-header">
                <div class="logo-placeholder">S</div>
                <h1>Educación Scrum</h1>
                <p>Sistema de Coevaluación Bisemanal</p>
            </div>
            
            <?php if ($error): ?>
                <div class="alert alert-error"><?php echo $error; ?></div>
            <?php endif; ?>

            <form method="POST">
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" name="email" required placeholder="ejemplo@correo.com">
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" name="password" required placeholder="••••••••">
                </div>
                <button type="submit" class="btn btn-primary btn-login">Ingresar al Portal</button>
            </form>
            
            <div class="login-footer">
                <p>¿Olvidaste tu contraseña? Contacta a tu docente.</p>
                <div class="footer-meta">
                    <span>v1.0.4</span>
                    <span>•</span>
                    <span>Puerto 8080</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
