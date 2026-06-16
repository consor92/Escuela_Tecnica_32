<?php
/**
 * Funciones Globales del Sistema
 * Manejo de sesiones, seguridad y utilidades.
 */

session_start();

// Configurar zona horaria para Argentina
date_default_timezone_set('America/Argentina/Buenos_Aires');

/**
 * Sanitizar entradas de texto
 */
function cleanInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

/**
 * Verificar si el usuario está logueado
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

/**
 * Redirigir si no está logueado o si la sesión caducó/fue suplantada
 */
function requireLogin() {
    global $pdo;

    if (!isset($_SESSION['user_id'])) {
        header("Location: index.php");
        exit();
    }

    // 1. VALIDACIÓN DE TIEMPO (15 MINUTOS DE INACTIVIDAD)
    $timeout = 15 * 60; // 15 minutos en segundos
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
        session_unset();
        session_destroy();
        header("Location: index.php?error=session_expired");
        exit();
    }
    $_SESSION['last_activity'] = time();

    // 2. VALIDACIÓN DE SESIÓN ÚNICA (LAST SESSION ID)
    // Solo validamos si tenemos el token en la sesión y no es una página de admin (opcional)
    if (isset($_SESSION['session_token'])) {
        try {
            $stmt = $pdo->prepare("SELECT last_session_id FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $lastDbSession = $stmt->fetchColumn();

            if ($lastDbSession && $lastDbSession !== $_SESSION['session_token']) {
                session_unset();
                session_destroy();
                header("Location: index.php?error=simultaneous_login");
                exit();
            }
        } catch (Exception $e) {
            // Si hay error de DB, permitimos continuar para no bloquear al usuario
        }
    }
}

/**
 * Obtener datos del usuario actual
 */
function getCurrentUser($pdo) {
    if (!isLoggedIn()) return null;
    
    $stmt = $pdo->prepare("SELECT id, username, full_name, course, packs_available, album_completed, is_admin, role FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch();
}

/**
 * Verificar Modo Mantenimiento y Horario Escolar
 */
function checkMaintenance($pdo) {
    $currentFile = basename($_SERVER['PHP_SELF']);
    
    // 1. EXCEPCIONES CRÍTICAS
    $allowedPages = ['maintenance.php', 'logout.php'];
    if (in_array($currentFile, $allowedPages)) {
        return;
    }

    // 2. EXCEPCIÓN POR URL O SESIÓN (Modo Admin Secreto)
    // El parámetro GET activa el bypass en la sesión.
    if (isset($_GET['admin_mode']) && $_GET['admin_mode'] == '1') {
        $_SESSION['admin_bypass'] = true;
    }

    // Si tiene el bypass activo en la sesión, permitir acceso siempre (para entrar al login)
    if (isset($_SESSION['admin_bypass']) && $_SESSION['admin_bypass'] === true) {
        return;
    }

    // 3. EXCEPCIÓN POR ROL (Admin ya logueado)
    if (isset($_SESSION['user_id'])) {
        try {
            $stmt = $pdo->prepare("SELECT is_admin, role FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $u = $stmt->fetch();
            if ($u && ($u['is_admin'] == 1 || $u['role'] === 'admin')) {
                return;
            }
        } catch (Exception $e) {}
    }

    // 4. LÓGICA DE BLOQUEO (Mantenimiento y Horario)
    $stmtM = $pdo->query("SELECT `key`, value FROM settings WHERE `key` IN ('maintenance_mode', 'school_hours_enabled', 'school_opening_hour', 'school_closing_hour')");
    $settings = $stmtM->fetchAll(PDO::FETCH_KEY_PAIR);

    $manualMaint = (isset($settings['maintenance_mode']) && $settings['maintenance_mode'] === '1');
    $hoursEnabled = (isset($settings['school_hours_enabled']) && $settings['school_hours_enabled'] === '1');
    $openingHour = (int)($settings['school_opening_hour'] ?? 8);
    $closingHour = (int)($settings['school_closing_hour'] ?? 22);

    $currentHour = (int)date('H');
    $isOutsideHours = ($hoursEnabled && ($currentHour < $openingHour || $currentHour >= $closingHour));

    if ($manualMaint || $isOutsideHours) {
        if ($currentFile !== 'maintenance.php') {
            header("Location: maintenance.php");
            exit();
        }
    }
}

/**
 * Renderizar Componentes Globales (Happy Hour, Notificaciones)
 */
function renderGlobalAssets($pdo) {
    $stmt = $pdo->query("SELECT value FROM settings WHERE `key` = 'happy_hour'");
    $isHappy = ($stmt->fetchColumn() === '1');
    ?>
    <!-- HAPPY HOUR GLOBAL -->
    <?php 
    $currentFile = basename($_SERVER['PHP_SELF']);
    $hideOnMobile = ($currentFile === 'album.php' || $currentFile === 'book.php');
    ?>
    <div id="happy-hour-overlay" class="fixed top-2 left-1/2 -translate-x-1/2 z-[3000] pointer-events-none <?php echo $hideOnMobile ? 'hidden md:block' : ''; ?> <?php echo $isHappy ? '' : '!hidden'; ?>">
        <div class="bg-gradient-to-r from-orange-600/40 via-yellow-500/40 to-orange-600/40 p-[1px] rounded-full shadow-[0_5px_15px_rgba(245,158,11,0.2)]">
            <div class="bg-slate-950/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-3 border border-white/5">
                <span class="text-sm md:text-xl animate-bounce">🔥</span>
                <div class="flex flex-col items-center">
                    <p class="text-[7px] font-black uppercase text-yellow-500/80 tracking-widest leading-none mb-0.5">Happy Hour</p>
                    <h3 class="text-[10px] md:text-sm font-black italic uppercase text-white/90 leading-none">¡Evento Activo!</h3>
                </div>
                <span class="text-sm md:text-xl animate-bounce">🔥</span>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <script>
        (function() {
            let happyInterval = null;
            function startHappyEffects() {
                if(happyInterval) return;
                let side = 'left';
                happyInterval = setInterval(() => {
                    const x = side === 'left' ? 0.1 : 0.9;
                    confetti({
                        particleCount: 30,
                        angle: side === 'left' ? 60 : 120,
                        spread: 55,
                        origin: { x: x, y: 0.7 },
                        colors: ['#f59e0b', '#fbbf24', '#ffffff', '#06b6d4'],
                        zIndex: 4000
                    });
                    side = side === 'left' ? 'right' : 'left';
                }, 2500);
            }
            
            const isHappy = <?php echo $isHappy ? 'true' : 'false'; ?>;
            if(isHappy) startHappyEffects();
            
            // Re-chequeo suave cada 60s para sincronizar sin lag
            setInterval(async () => {
                try {
                    const r = await fetch('api/admin_fetch.php?action=get_happy_hour');
                    const d = await r.json();
                    const el = document.getElementById('happy-hour-overlay');
                    if(d.data.active) {
                        el.classList.remove('hidden');
                        startHappyEffects();
                    } else {
                        el.classList.add('hidden');
                        if(happyInterval) { clearInterval(happyInterval); happyInterval = null; }
                    }
                } catch(e) {}
            }, 60000);
        })();
    </script>
    <?php
}

/**
 * Respuesta JSON estandarizada para la API
 */
function jsonResponse($success, $message, $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}

/**
 * Generar URL absoluta para imágenes en Google Drive
 * @param mixed $thumbSize Si es un número, pide una versión optimizada de ese ancho a Google
 */
function getDriveUrl($pdo, $id, $thumbSize = false) {
    static $baseUrl = null;
    
    if (!$id) return '';
    
    // Si ya es una URL completa, devolverla tal cual
    if (filter_var($id, FILTER_VALIDATE_URL)) return $id;

    if ($baseUrl === null) {
        try {
            $stmt = $pdo->prepare("SELECT value FROM settings WHERE `key` = 'drive_base_url'");
            $stmt->execute();
            $baseUrl = $stmt->fetchColumn();
            if (!$baseUrl) {
                // Fallback mínimo si la DB no tiene el dato, pero priorizamos la DB
                $baseUrl = "https://lh3.googleusercontent.com/u/0/d/"; 
            }
        } catch (Exception $e) {
            $baseUrl = "https://lh3.googleusercontent.com/u/0/d/";
        }
    }
    
    // Si se pide miniatura, intentamos derivar el endpoint de thumbnails de la base de la DB
    if ($thumbSize && strpos($baseUrl, 'googleusercontent.com') !== false) {
        $width = is_numeric($thumbSize) ? $thumbSize : 400;
        // Transformamos dinámicamente el endpoint /u/0/d/ a /d/ para habilitar parámetros de redimensionado
        $thumbBase = str_replace('/u/0/d/', '/d/', $baseUrl);
        return $thumbBase . $id . "=w" . $width;
    }
    
    return $baseUrl . $id;
}
