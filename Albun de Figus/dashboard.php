<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';
requireLogin();

// Redirigir según rol si intenta entrar al dashboard de alumnos (a menos que explícitamente quiera ver como alumno)
$user = getCurrentUser($pdo);
$viewAsStudent = isset($_GET['view']) && $_GET['view'] === 'student';

if ($user['role'] === 'admin' && !$viewAsStudent) {
    header("Location: admin/dashboard.php");
    exit;
} elseif ($user['role'] === 'docente' && !$viewAsStudent) {
    header("Location: docente/dashboard.php");
    exit;
}

checkMaintenance($pdo);

// Consultar progreso real
$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM user_inventory WHERE user_id = ? AND is_stuck = 1");
$stmt->execute([$user['id']]);
$progreso = $stmt->fetch()['total'];
$porcentaje = ($progreso / 50) * 100;

// Consultar cooldown dinámico
$stmtCooldown = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'trivia_cooldown'");
$cooldownHours = (int)($stmtCooldown->fetchColumn() ?: 6);
$cooldownSeconds = $cooldownHours * 3600;

// Calcular cooldown de trivia de forma segura usando el tiempo de la DB
$stmtDiff = $pdo->prepare("SELECT TIMESTAMPDIFF(SECOND, last_trivia_at, NOW()) FROM users WHERE id = ?");
$stmtDiff->execute([$user['id']]);
$diff = $stmtDiff->fetchColumn();

$triviaRemaining = 0;
if ($diff !== null && $diff < $cooldownSeconds) {
    $triviaRemaining = $cooldownSeconds - $diff;
}
// 1. Obtener Configuración del Álbum Actual para pre-fetching
$stmtAlbum = $pdo->prepare("SELECT * FROM albums WHERE id = 1");
$stmtAlbum->execute();
$albumConfig = $stmtAlbum->fetch();

// Pre-calcular URLs para pre-fetching (Miniaturas de 800px para fondos)
$pref_cover = getDriveUrl($pdo, $albumConfig['cover_img'], 800);
$pref_honor1 = getDriveUrl($pdo, $albumConfig['honor_page_1_bg'], 800);
$pref_honor2 = getDriveUrl($pdo, $albumConfig['honor_page_2_bg'], 800);
$pref_bg1 = getDriveUrl($pdo, $albumConfig['page_bg_p1'], 800);
$pref_bg2 = getDriveUrl($pdo, $albumConfig['page_bg_p2'], 800);
$pref_bg3 = getDriveUrl($pdo, $albumConfig['page_bg_p3'], 800);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Dashboard - Álbum 32</title>
    
    <!-- PRE-FETCHING ESTRATÉGICO -->
    <link rel="prefetch" href="<?php echo $pref_cover; ?>">
    <link rel="prefetch" href="<?php echo $pref_honor1; ?>">
    <link rel="prefetch" href="<?php echo $pref_honor2; ?>">
    <link rel="prefetch" href="<?php echo $pref_bg1; ?>">
    <link rel="prefetch" href="<?php echo $pref_bg2; ?>">
    <link rel="prefetch" href="<?php echo $pref_bg3; ?>">
    <link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin>
    <link rel="preconnect" href="https://drive.google.com" crossorigin>

    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --accent-cyan: #22d3ee;
            --accent-purple: #8b5cf6;
            --accent-gold: #fbbf24;
            --accent-blue: #3b82f6;
            --panel-bg: rgba(15, 23, 42, 0.4);
            
            /* Neon Directions */
            --neon-n: var(--accent-gold);
            --neon-s: var(--accent-blue);
            --neon-e: var(--accent-cyan);
            --neon-w: var(--accent-purple);
        }
        body { 
            font-family: 'Outfit', sans-serif; 
            background: #010413; 
            color: white; 
            min-height: 100vh; 
            overflow-x: hidden; 
            display: flex; 
            flex-direction: column;
            position: relative;
        }

        /* EFECTOS DE FONDO DINÁMICOS */
        .bg-layer { position: fixed; inset: 0; pointer-events: none; z-index: -1; }
        .bg-gradient-aura {
            background: 
                radial-gradient(circle at 10% 10%, rgba(34, 211, 238, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 90% 90%, rgba(139, 92, 246, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.8) 0%, transparent 100%);
        }
        .bg-grid {
            background-image: 
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 50px 50px;
        }
        .stars-container { position: absolute; inset: 0; }
        .star { position: absolute; background: white; border-radius: 50%; opacity: 0.3; animation: twinkle var(--d) infinite; }
        @keyframes twinkle { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.5; } }
        
        /* CONTENEDOR SINCROTRÓN - EXPANDIDO PARA EVITAR COMPRESIÓN */
        .synchrotron-stage {
            position: relative;
            width: 440px;
            height: 440px;
            margin: 2rem auto;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @media (max-width: 480px) {
            .synchrotron-stage { width: 320px; height: 320px; margin: 1rem auto; }
        }

        /* NÚCLEO DE PROGRESO CUADRADO CIBERNÉTICO */
        .progress-nexus {
            position: absolute;
            width: 150px;
            height: 150px;
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(2, 6, 23, 0.7);
            backdrop-filter: blur(10px);
            /* Esquinas biseladas tecnológicas */
            clip-path: polygon(15% 0, 85% 0, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0 85%, 0 15%);
            border: 1px solid rgba(255,255,255,0.05);
            pointer-events: none;
            box-shadow: 0 0 40px rgba(0,0,0,0.8);
        }

        @media (max-width: 480px) {
            .progress-nexus { width: 100px; height: 100px; }
        }

        .progress-square-svg {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 0 10px var(--accent-cyan));
        }
        .sq-bg { fill: none; stroke: rgba(255,255,255,0.03); stroke-width: 4; }
        .sq-fill {
            fill: none; stroke: url(#grad-cyan); stroke-width: 6;
            stroke-linecap: square;
            stroke-dasharray: 600; /* 150 * 4 */
            stroke-dashoffset: calc(600 - (600 * <?php echo $porcentaje; ?>) / 100);
            transition: stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 480px) {
            .sq-fill { stroke-dasharray: 400; stroke-dashoffset: calc(400 - (400 * <?php echo $porcentaje; ?>) / 100); }
        }

        .progress-text-center { 
            position: absolute; 
            display: flex; 
            flex-direction: column; 
            align-items: center; 
            justify-content: center;
            z-index: 101;
        }
        .progress-val { 
            font-size: 3rem; font-weight: 950; line-height: 1;
            background: linear-gradient(to bottom, #fff 20%, var(--accent-cyan));
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.3));
        }

        @media (max-width: 480px) {
            .progress-val { font-size: 1.8rem; }
        }

        .progress-lbl { 
            font-size: 0.55rem; font-weight: 900; text-transform: uppercase; 
            letter-spacing: 0.25em; color: #475569; margin-top: 4px;
        }

        /* CÉLULAS DE NAVEGACIÓN - RESTAURACIÓN DE FORMA "BUENÍSIMA" */
        .nav-cell {
            position: absolute;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 10;
        }

        /* CAPA DE FORMA (FONDO) - AQUÍ SE DEFINE LA GEOMETRÍA CÓNCAVA */
        .cell-shape {
            position: absolute;
            inset: 0;
            background: var(--panel-bg);
            backdrop-filter: blur(25px);
            border: 2.5px solid rgba(255,255,255,0.15);
            transition: all 0.4s ease;
            z-index: 5;
        }

        /* GEOMETRÍA ORIGINAL CÓNCAVA RESTAURADA */
        .nav-cell.north, .nav-cell.south { width: 220px; height: 120px; left: 50%; transform: translateX(-50%); }
        .nav-cell.east, .nav-cell.west   { width: 120px; height: 220px; top: 50%; transform: translateY(-50%); }

        @media (max-width: 480px) {
            .nav-cell.north, .nav-cell.south { width: 160px; height: 90px; }
            .nav-cell.east, .nav-cell.west   { width: 90px; height: 160px; }
        }
        .nav-cell.north { top: 0; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4)); }
        .north .cell-shape { 
            clip-path: polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%); 
            border-radius: 1.5rem 1.5rem 100% 100% / 1rem 1.5rem 4rem 4rem;
            border-color: var(--neon-n);
        }

        .nav-cell.south { bottom: 0; filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.4)); }
        .south .cell-shape { 
            clip-path: polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%); 
            border-radius: 100% 100% 1.5rem 1.5rem / 4rem 4rem 1.5rem 1.5rem;
            border-color: var(--neon-s);
        }

        .nav-cell.east { right: 0; filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.4)); }
        .east .cell-shape { 
            clip-path: polygon(0% 15%, 100% 0%, 100% 100%, 0% 85%); 
            border-radius: 100% 1.5rem 1.5rem 100% / 4rem 1.5rem 1.5rem 4rem;
            border-color: var(--neon-e);
        }

        .nav-cell.west { left: 0; filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.4)); }
        .west .cell-shape { 
            clip-path: polygon(0% 0%, 100% 15%, 100% 85%, 0% 100%); 
            border-radius: 1.5rem 100% 100% 1.5rem / 1.5rem 4rem 4rem 1.5rem;
            border-color: var(--neon-w);
        }

        /* Hover: Explosión de Energía y Expansión */
        .nav-cell:hover { z-index: 50; }
        .nav-cell.north:hover { filter: drop-shadow(0 0 30px var(--neon-n)); transform: translateX(-50%) translateY(-10px) scale(1.05); }
        .nav-cell.south:hover { filter: drop-shadow(0 0 30px var(--neon-s)); transform: translateX(-50%) translateY(10px) scale(1.05); }
        .nav-cell.east:hover  { filter: drop-shadow(0 0 30px var(--neon-e)); transform: translateY(-50%) translateX(10px) scale(1.05); }
        .nav-cell.west:hover  { filter: drop-shadow(0 0 30px var(--neon-w)); transform: translateY(-50%) translateX(-10px) scale(1.05); }

        .cell-content {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            width: 100%;
            height: 100%;
            transition: all 0.4s ease;
            z-index: 20;
        }

        /* SVG Icons Styling - Premium Look */
        .svg-icon {
            width: 2.2rem;
            height: 2.2rem;
            margin-bottom: 0.4rem;
            filter: drop-shadow(0 0 10px currentColor);
            transition: all 0.3s ease;
        }
        .nav-cell:hover .svg-icon { transform: scale(1.15); filter: drop-shadow(0 0 15px currentColor); }

        .cell-label { font-size: 0.6rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.25em; color: #64748b; }
        .nav-cell:hover .cell-label { color: #fff; }

        /* Ajustes de centrado por la forma cóncava */
        .nav-cell.north .cell-content { transform: translateY(-5px); }
        .nav-cell.south .cell-content { transform: translateY(5px); }
        .nav-cell.east .cell-content  { transform: translateX(5px); }
        .nav-cell.west .cell-content  { transform: translateX(-5px); }

        /* GEMA DE SOBRES PREMIUM (DORADA CON GLOW) */
        .pack-gem {
            background: radial-gradient(circle at 30% 30%, #fef3c7 0%, #fbbf24 50%, #d97706 100%);
            color: #000;
            font-size: 0.65rem;
            font-weight: 950;
            padding: 3px 12px;
            border-radius: 20px;
            margin-top: 6px;
            box-shadow: 
                0 0 15px rgba(251, 191, 36, 0.5),
                inset 0 0 4px rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }
        .pack-gem::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.9) 50%, transparent 55%);
            animation: coin-shine 3s infinite;
        }
        @keyframes coin-shine {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            20%, 100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }

        /* DECORACIONES DE ANILLO */
        .ring-deco {
            position: absolute;
            border-radius: 50%;
            border: 1px solid rgba(255,255,255,0.02);
            pointer-events: none;
        }
        .ring-inner { width: 260px; height: 260px; border-style: dashed; animation: rotate-cw 60s linear infinite; }
        @keyframes rotate-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        #modal-reward { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 500; display: none; align-items: center; justify-content: center; padding: 2rem; backdrop-filter: blur(20px); }
        .reward-card { background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(2, 6, 23, 0.9) 100%); border: 2px solid #fbbf24; border-radius: 3rem; padding: 3rem 2rem; text-align: center; max-width: 300px; width: 100%; box-shadow: 0 0 50px rgba(251, 191, 36, 0.2); animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .animate-pack-special { animation: pack-bounce-shake 4s infinite cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes pack-bounce-shake {
            0%, 100% { transform: translateY(0) scale(1); }
            40% { transform: translateY(-35%) scale(1.05); }
            43% { transform: translateY(-35%) rotate(-5deg); }
            46% { transform: translateY(-35%) rotate(5deg); }
            49% { transform: translateY(-35%) rotate(-5deg); }
            52% { transform: translateY(-35%) rotate(0) scale(1.05); }
            70% { transform: translateY(0) scale(1); }
        }

        /* BURBUJA DE SOBRES PREMIUM (MONEDA) */
        .pack-badge {
            background: radial-gradient(circle at 30% 30%, rgba(254, 243, 199, 0.9) 0%, rgba(251, 191, 36, 0.9) 50%, rgba(217, 119, 6, 0.9) 100%);
            border: 2px solid #020617;
            box-shadow: 
                0 4px 10px rgba(0,0,0,0.5),
                inset 0 0 0 2px rgba(255,255,255,0.2);
            position: relative;
            overflow: hidden;
        }
        .pack-badge::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.8) 50%, transparent 55%);
            animation: coin-shine 3s infinite;
        }
        /* DROPDOWN MENU */
        #user-menu {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            width: 200px;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 1.5rem;
            padding: 1rem;
            margin-top: 0.5rem;
            z-index: 1000;
            box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            animation: slideIn 0.3s ease-out;
        }
        #user-menu.active { display: block; }
        @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .menu-item {
            display: flex;
            items-center: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: 800;
            text-transform: uppercase;
            transition: all 0.2s;
            color: #94a3b8;
        }
        .menu-item:active { background: rgba(255,255,255,0.05); color: white; }
        .menu-item.logout { color: #f87171; }
        .menu-item.admin { color: #22d3ee; }

        /* ESTILOS CANJE AVANZADO */
        .rarity-dot { width: 6px; height: 6px; border-radius: 50%; margin: 4px auto 0; }
        .rarity-stat-item { display: flex; flex-direction: column; align-items: center; }
        .btn-close-modal { 
            transition: all 0.2s ease; 
            cursor: pointer; 
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 1.25rem;
            border-radius: 1.5rem;
            display: block;
            width: 100%;
            color: #64748b !important;
        }
        .btn-close-modal:hover, .btn-close-modal:active { 
            background: rgba(34, 211, 238, 0.15);
            border-color: rgba(34, 211, 238, 0.4);
            color: #22d3ee !important; 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(34, 211, 238, 0.15);
        }
        .btn-close-modal:active { transform: translateY(0) scale(0.98); }

        .pack-results-hand { 
            position: relative; display: flex; justify-content: center; align-items: center; 
            width: 100%; height: 320px; margin-top: 1rem; perspective: 1000px;
        }
        .pack-item { 
            position: absolute; width: 180px; height: 260px; 
            background: url('assets/img/sobre.png') no-repeat center center;
            background-size: contain;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            filter: drop-shadow(0 15px 30px rgba(0,0,0,0.5));
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            transform-origin: bottom center;
        }
        .pack-item.free { filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6)) drop-shadow(0 10px 20px rgba(0,0,0,0.4)); }
        .badge-free { position: absolute; top: -10px; right: -10px; background: #fbbf24; color: black; font-size: 8px; font-weight: 900; px-2 py-1 rounded-lg transform rotate-12; padding: 2px 6px; z-index: 20; }
        /* ANIMACIÓN DE SACUDIDA */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
    </style>
</head>
<body class="pb-10">

    <div id="toast-container"></div>

    <header class="p-8 pt-12 relative">
        <div class="flex items-center justify-between mb-8">
            <div class="flex flex-col">
                <h1 class="text-3xl font-black uppercase italic tracking-tighter"><?php echo $user['full_name']; ?></h1>
                <p class="text-[10px] text-cyan-400 font-black uppercase tracking-widest opacity-70"><?php echo $user['course']; ?> • E.T. Nº 32</p>
            </div>
            
            <div class="relative">
                <button onclick="toggleUserMenu()" class="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-xl shadow-xl active:scale-90 transition-all">
                    ☰
                </button>
                
                <div id="user-menu">
                    <button onclick="openModal('profile'); toggleUserMenu()" class="menu-item w-full">
                        <span>👤</span> Mi Perfil
                    </button>

                    <button onclick="openModal('suggestion'); toggleUserMenu()" class="menu-item w-full">
                        <span>💡</span> Sugerencias
                    </button>

                    <?php if(isset($user['is_admin']) && $user['is_admin']): ?>
                    <a href="admin/dashboard.php" class="menu-item admin">
                        <span>🛡️</span> Panel Maestro
                    </a>
                    <?php endif; ?>
                    
                    <div class="h-px bg-white/10 my-2"></div>
                    
                    <a href="api/logout.php" class="menu-item logout">
                        <span>🚪</span> Cerrar Sesión
                    </a>
                </div>
            </div>
        </div>

        <div class="flex justify-center">
            <!-- Espacio vacío, el progreso ahora está en el menú central -->
        </div>
    </header>

    <?php renderGlobalAssets($pdo); ?>

    <main class="flex-1 flex items-center justify-center p-4 min-h-[500px]">
        <div class="synchrotron-stage">
            <!-- Anillos Decorativos -->
            <div class="ring-deco ring-inner"></div>
            
            <!-- NÚCLEO DE PROGRESO CUADRADO CIBERNÉTICO -->
            <div class="progress-nexus">
                <svg class="progress-square-svg" viewBox="0 0 150 150">
                    <defs>
                        <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--accent-cyan);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:var(--accent-purple);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <!-- Fondo del marco -->
                    <rect class="sq-bg" x="10" y="10" width="130" height="130" rx="15" />
                    <!-- Relleno del progreso (Perímetro = 130 * 4 = 520) -->
                    <rect class="sq-fill" x="10" y="10" width="130" height="130" rx="15" 
                        style="stroke-dasharray: 520; stroke-dashoffset: <?php echo 520 - (520 * $porcentaje / 100); ?>;" />
                </svg>
                <div class="progress-text-center">
                    <span class="progress-val"><?php echo round($porcentaje); ?>%</span>
                    <span class="progress-lbl">Misión</span>
                </div>
            </div>

            <!-- CÉLULA NORTE: SOBRES -->
            <a href="abrir_sobres.php<?php echo $viewAsStudent ? '?view=student' : ''; ?>" class="nav-cell north">
                <div class="cell-shape"></div>
                <div class="cell-content">
                    <span class="cell-icon <?php echo ($user['packs_available'] > 0) ? 'animate-pack-special' : 'opacity-60'; ?>">
                        <img src="<?php echo getDriveUrl($pdo, $albumConfig['pack_img']); ?>" class="w-16 h-auto" alt="sobre">
                    </span>
                    <span class="cell-label">Abrir</span>
                    <?php if($user['packs_available'] > 0): ?>
                        <div class="pack-gem"><?php echo $user['packs_available']; ?></div>
                    <?php endif; ?>
                </div>
            </a>

            <!-- CÉLULA SUR: ÁLBUM -->
            <a href="album.php<?php echo $viewAsStudent ? '?view=student' : ''; ?>" class="nav-cell south">
                <div class="cell-shape"></div>
                <div class="cell-content">
                    <svg class="svg-icon-illustrative" viewBox="0 0 64 64" fill="none">
                        <defs>
                            <linearGradient id="grad-album-cover" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#3b82f6"/>
                                <stop offset="100%" stop-color="#1e3a8a"/>
                            </linearGradient>
                            <linearGradient id="grad-album-spine" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#2563eb"/>
                                <stop offset="100%" stop-color="#1d4ed8"/>
                            </linearGradient>
                        </defs>
                        <!-- Lomo del Libro (3D effect) -->
                        <path d="M12 14c0-2.2 1.8-4 4-4h4v44h-4c-2.2 0-4-1.8-4-4V14z" fill="url(#grad-album-spine)"/>
                        <!-- Cubierta Principal -->
                        <path d="M20 10h28c2.2 0 4 1.8 4 4v40c0 2.2-1.8 4-4 4H20V10z" fill="url(#grad-album-cover)"/>
                        <!-- Páginas visibles (detalle inferior) -->
                        <path d="M20 54h28c2.2 0 4-1.8 4-4H20v4z" fill="#cbd5e1" opacity="0.5"/>
                        <!-- Emblema de la Portada -->
                        <circle cx="36" cy="32" r="10" fill="rgba(255,255,255,0.1)" stroke="#fbbf24" stroke-width="1.5"/>
                        <path d="M36 26l2 4 6 1-4 4 1 6-5-3-5 3 1-6-4-4 6-1 2-4z" fill="#fbbf24"/>
                        <!-- Brillo de la Cubierta -->
                        <path d="M22 12h24c1 0 2 0.8 2 2s-1 2-2 2H22c-1 0-2-0.8-2-2s1-2 2-2z" fill="white" opacity="0.1"/>
                    </svg>
                    <span class="cell-label">Álbum</span>
                </div>
            </a>

            <!-- CÉLULA ESTE: CANJE -->
            <div onclick="openTradeModal()" class="nav-cell east cursor-pointer">
                <div class="cell-shape"></div>
                <div class="cell-content">
                    <svg class="svg-icon-illustrative" viewBox="0 0 64 64" fill="none" style="color: var(--accent-cyan)">
                        <rect x="10" y="20" width="28" height="36" rx="3" fill="url(#grad-card-1)" transform="rotate(-12 10 20)"/>
                        <rect x="26" y="12" width="28" height="36" rx="3" fill="url(#grad-card-2)" transform="rotate(8 26 12)"/>
                        <path d="M22 34h20l-4-4m4 4l-4 4" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        <defs>
                            <linearGradient id="grad-card-1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#0891b2"/><stop offset="100%" stop-color="#155e75"/>
                            </linearGradient>
                            <linearGradient id="grad-card-2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#0891b2"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <span class="cell-label">Canje</span>
                    <div id="badge-pts" class="text-[8px] font-black text-cyan-400 hidden mt-1">0 PTS</div>
                </div>
            </div>

            <!-- CÉLULA OESTE: CÓDIGO -->
            <div onclick="openPromoModal()" class="nav-cell west cursor-pointer">
                <div class="cell-shape"></div>
                <div class="cell-content">
                    <svg class="svg-icon-illustrative" viewBox="0 0 64 64" fill="none" style="color: var(--accent-purple)">
                        <circle cx="20" cy="32" r="10" stroke="url(#grad-key-head)" stroke-width="5"/>
                        <rect x="30" y="29" width="22" height="6" rx="1" fill="url(#grad-key-body)"/>
                        <path d="M42 35v4m6-4v4" stroke="white" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="20" cy="32" r="3" fill="white" opacity="0.6"/>
                        <defs>
                            <linearGradient id="grad-key-head" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#7e22ce"/>
                            </linearGradient>
                            <linearGradient id="grad-key-body" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#9333ea"/>
                            </linearGradient>
                        </defs>
                    </svg>
                    <span class="cell-label">Código</span>
                </div>
            </div>
        </div>
    </main>

    <!-- MODAL PERFIL / CAMBIAR CLAVE (ALUMNO) -->
    <div id="modal-profile" class="fixed inset-0 bg-black/85 backdrop-blur-xl z-[200] hidden flex items-center justify-center p-6">
        <div class="glass-card w-full max-w-sm rounded-[3rem] p-10 border-cyan-500/20 border-2">
            <h2 class="text-2xl font-black italic uppercase text-cyan-400 text-center mb-8">Mi Perfil</h2>
            
            <div class="space-y-6">
                <div class="bg-white/5 p-6 rounded-3xl border border-white/10 text-center mb-8">
                    <p class="text-xs font-black text-white uppercase mb-1"><?php echo $user['full_name']; ?></p>
                    <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest"><?php echo $user['course']; ?> (@<?php echo $user['username']; ?>)</p>
                </div>

                <form id="form-change-pass-alumno" class="space-y-4">
                    <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Cambiar Contraseña</h3>
                    <input type="password" id="pass-alumno-current" placeholder="Clave Actual" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-sm font-black text-white outline-none focus:border-cyan-500">
                    <input type="password" id="pass-alumno-new" placeholder="Nueva Clave" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-sm font-black text-white outline-none focus:border-cyan-500">
                    <button type="submit" class="w-full bg-neon-gradient py-4 rounded-[1.5rem] font-black uppercase text-xs shadow-xl">Actualizar Clave</button>
                </form>
            </div>

            <button onclick="closeModal('profile')" class="btn-close-modal w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest text-center">Cancelar</button>
        </div>
    </div>

    <!-- MODAL SUGERENCIAS -->
    <div id="modal-suggestion" class="fixed inset-0 bg-black/85 backdrop-blur-xl z-[200] hidden flex items-center justify-center p-6">
        <div class="glass-card w-full max-w-sm rounded-[3rem] p-10 border-amber-500/20 border-2">
            <h2 class="text-2xl font-black italic uppercase text-amber-400 text-center mb-6">Sugerencias 💡</h2>
            
            <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest text-center mb-6 leading-relaxed">
                ¿Tienes alguna idea para mejorar el álbum? <br> ¿Encontraste un error? ¡Cuéntanos!
            </p>

            <form id="form-suggestion" class="space-y-4">
                <select id="suggestion-category" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-amber-500 appearance-none cursor-pointer">
                    <option value="idea" class="bg-slate-900">💡 Una Idea</option>
                    <option value="bug" class="bg-slate-900">🐛 Reportar Bug</option>
                    <option value="mejora" class="bg-slate-900">📈 Mejora Técnica</option>
                    <option value="otro" class="bg-slate-900">❓ Otro</option>
                </select>
                <textarea id="suggestion-text" placeholder="Describe tu sugerencia aquí..." required maxlength="255"
                    class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-amber-500 min-h-[120px] resize-none"></textarea>
                <div class="flex justify-end pr-2">
                    <span id="suggestion-counter" class="text-[8px] font-black text-gray-500 uppercase">0 / 255</span>
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-amber-500 to-orange-600 py-4 rounded-[1.5rem] font-black uppercase text-xs shadow-xl text-black">Enviar</button>
            </form>

            <button onclick="closeModal('suggestion')" class="btn-close-modal w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest text-center">Cerrar</button>
        </div>
    </div>

    <!-- MODAL RECOMPENSA -->
    <div id="modal-reward">
        <div class="reward-card">
            <div class="text-6xl mb-4">🎁</div>
            <h2 class="text-2xl font-black text-white italic uppercase mb-1" id="reward-title">¡FELICIDADES!</h2>
            <p class="text-gray-500 font-bold uppercase text-[9px] tracking-widest mb-6" id="reward-msg">Has recibido</p>
            <div class="text-6xl font-black text-yellow-400 mb-8" id="reward-amount">+0</div>
            <button onclick="location.reload()" class="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs">RECLAMAR</button>
        </div>
    </div>

    <div id="trade-modal" class="fixed inset-0 bg-black/85 backdrop-blur-xl z-[100] hidden flex items-center justify-center p-6">
        <!-- Vista Inicial: Cálculo y Selección -->
        <div id="trade-initial-view" class="glass-card w-full max-w-sm md:max-w-xl lg:max-w-2xl rounded-[3rem] p-8 md:p-12 border-cyan-500/20 border-2">
            <h2 class="text-2xl font-black italic uppercase text-cyan-400 text-center mb-6">Canje de Repes</h2>
            
            <div class="bg-cyan-500/5 rounded-3xl p-6 text-center mb-6 border border-cyan-500/10">
                <p class="text-[10px] font-black text-cyan-400 uppercase mb-1 tracking-widest">Puntos Totales</p>
                <div id="duplicate-points" class="text-5xl font-black text-white mb-4">...</div>

                <!-- Desglose de Rarezas (Horizontal) -->
                <div class="flex justify-center gap-6 border-t border-cyan-500/10 pt-4" id="rarity-breakdown">
                    <!-- Se llena vía JS -->
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6">
                <button onclick="processTrade(1)" class="bg-white/5 py-4 md:py-8 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all border border-white/5">
                    <span class="text-[10px] md:text-xs font-black text-white">X1</span>
                    <span class="text-[8px] md:text-[10px] font-bold text-cyan-400">10 PTS</span>
                </button>
                <button onclick="processTrade(5)" class="bg-white/5 py-4 md:py-8 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all border border-white/5">
                    <span class="text-[10px] md:text-xs font-black text-white">X5</span>
                    <span class="text-[8px] md:text-[10px] font-bold text-cyan-400">50 PTS</span>
                </button>
                <button onclick="processTrade(10)" class="bg-white/5 py-4 md:py-8 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all border border-cyan-500/30">
                    <span class="text-[10px] md:text-xs font-black text-white">X10</span>
                    <span class="text-[8px] md:text-[10px] font-bold text-cyan-400">100 PTS</span>
                </button>
            </div>

            <button onclick="document.getElementById('trade-modal').classList.add('hidden')" class="btn-close-modal w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest text-center">Cerrar</button>

        </div>

        <!-- Vista de Resultados: Mano de Sobres -->
        <div id="trade-results-view" class="hidden glass-card w-full max-w-sm md:max-w-xl lg:max-w-2xl rounded-[3rem] p-8 md:p-12 border-cyan-500/20 border-2 text-center">
            <h2 class="text-2xl font-black italic uppercase text-cyan-400 mb-2">¡BOTÍN DE CANJE!</h2>
            <p id="trade-result-msg" class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4"></p>
            
            <div id="packs-hand" class="pack-results-hand"></div>

            <div class="flex justify-center mt-4">
                <button onclick="location.reload()" class="bg-white/10 text-white px-12 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl border border-white/10 active:scale-95 transition-all">Confirmar</button>
            </div>
        </div>
    </div>

    <div id="promo-modal" class="fixed inset-0 bg-black/85 backdrop-blur-xl z-[100] hidden flex items-center justify-center p-6">
        <div class="glass-card w-full max-w-sm rounded-[3rem] p-10 border-purple-500/20 border-2">
            <h2 class="text-2xl font-black italic uppercase text-purple-400 text-center mb-8">Código Profe</h2>
            <input type="text" id="promo-input" placeholder="PALABRA CLAVE" class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-center text-2xl font-black text-white outline-none uppercase mb-8 focus:border-purple-500">
            <button onclick="redeemCode()" id="redeem-btn" class="w-full bg-neon-gradient py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl">CANJEAR</button>
            <button onclick="document.getElementById('promo-modal').classList.add('hidden')" class="btn-close-modal w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest text-center">Cancelar</button>
        </div>
    </div>

    <script>
        function toggleUserMenu() {
            document.getElementById('user-menu').classList.toggle('active');
        }

        // Cerrar menú al hacer click afuera
        window.addEventListener('click', (e) => {
            const menu = document.getElementById('user-menu');
            const btn = menu.previousElementSibling;
            if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.remove('active');
            }
        });

        function openModal(id) { document.getElementById('modal-' + id).style.display = 'flex'; }
        function closeModal(id) { document.getElementById('modal-' + id).style.display = 'none'; }

        document.getElementById('form-change-pass-alumno').onsubmit = async (e) => {
            e.preventDefault();
            const current = document.getElementById('pass-alumno-current').value;
            const newP = document.getElementById('pass-alumno-new').value;
            
            const fd = new FormData();
            fd.append('current_password', current);
            fd.append('new_password', newP);

            try {
                const res = await fetch('api/admin_fetch.php?action=change_my_password', { method: 'POST', body: fd });
                const data = await res.json();
                if(data.success) {
                    showToast(data.message);
                    closeModal('profile');
                    document.getElementById('form-change-pass-alumno').reset();
                } else {
                    showToast(data.message, true);
                }
            } catch(e) { showToast("Error de conexión", true); }
        }

        function showToast(msg, isError = false) {
            const toast = document.createElement('div');
            toast.className = `custom-toast ${isError ? 'bg-red-500 text-white' : 'bg-white text-black'}`;
            toast.textContent = msg;
            document.getElementById('toast-container').appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        function showReward(amount, msg, title = "¡BOTÍN LOGRADO!") {
            document.getElementById('reward-amount').innerText = `+${amount}`;
            document.getElementById('reward-msg').innerText = msg;
            document.getElementById('reward-title').innerText = title;
            document.getElementById('modal-reward').style.display = 'flex';
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#ffffff', '#22d3ee'] });
        }

        async function redeemCode() {
            const input = document.getElementById('promo-input');
            const code = input.value.trim();
            if(!code) return;
            try {
                const res = await fetch('api/redeem_code.php', { method: 'POST', body: new URLSearchParams({code}) });
                const data = await res.json();
                if(data.success) {
                    document.getElementById('promo-modal').classList.add('hidden');
                    showReward(data.data.amount, "¡Código Profe validado!", "¡CUPÓN EXITOSO!");
                } else {
                    showToast(data.message, true);
                    input.classList.add('animate-shake');
                    setTimeout(() => input.classList.remove('animate-shake'), 500);
                }
            } catch(e) { showToast("Error de red", true); }
        }

        async function processTrade(amount) {
            try {
                const res = await fetch('api/trade_duplicates.php', { method: 'POST', body: new URLSearchParams({action:'trade', amount}) });
                const data = await res.json();
                
                if(data.success) {
                    renderTradeResults(amount, data.data.extra_amount || 0);
                    
                    // Confeti proporcional: Más cantidad = más confeti
                    const total = amount + (data.data.extra_amount || 0);
                    const particleCount = total * 20; 
                    const spread = 50 + (total * 5);
                    
                    confetti({ 
                        particleCount: Math.min(particleCount, 250), 
                        spread: Math.min(spread, 100), 
                        origin: { y: 0.6 }, 
                        colors: ['#10b981', '#fbbf24', '#ffffff', '#22d3ee'] 
                    });
                } else showToast(data.message, true);
            } catch(e) { showToast("Error de red", true); }
        }

        function renderTradeResults(base, extra) {
            document.getElementById('trade-initial-view').classList.add('hidden');
            const view = document.getElementById('trade-results-view');
            const hand = document.getElementById('packs-hand');
            const msg = document.getElementById('trade-result-msg');
            
            view.classList.remove('hidden');
            hand.innerHTML = '';
            msg.innerText = `Has obtenido ${base} sobres ${extra > 0 ? `+ ${extra} DE REGALO` : ''}`;

            const total = base + extra;
            for(let i = 0; i < total; i++) {
                const isFree = i >= base;
                const pack = document.createElement('div');
                pack.className = `pack-item ${isFree ? 'free' : ''}`;
                
                // Cálculo de abanico dinámico
                const angleRange = Math.min(total * 10, 60); // Máximo 60 grados de apertura
                const step = total > 1 ? angleRange / (total - 1) : 0;
                const rot = total > 1 ? -(angleRange/2) + (i * step) : 0;
                
                // Distribución horizontal
                const xRange = Math.min(total * 30, 180);
                const xStep = total > 1 ? xRange / (total - 1) : 0;
                const tx = total > 1 ? -(xRange/2) + (i * xStep) : 0;
                
                const ty = Math.abs(rot) * 0.5;

                pack.style.transform = `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`;
                pack.style.zIndex = 10 + i;

                pack.innerHTML = `
                    ${isFree ? '<div class="badge-free">GRATIS</div>' : ''}
                    <div class="mt-8 bg-white/10 px-3 py-1 rounded-full text-[6px] font-black uppercase tracking-widest border border-white/10">Botín</div>
                `;
                hand.appendChild(pack);
            }
        }

        function openTradeModal() { document.getElementById('trade-modal').classList.remove('hidden'); loadPoints(); }
        function openPromoModal() { document.getElementById('promo-modal').classList.remove('hidden'); document.getElementById('promo-input').focus(); }

        async function loadPoints() {
            const res = await fetch('api/trade_duplicates.php', { method: 'POST', body: new URLSearchParams({action:'calculate'}) });
            const data = await res.json();
            if(data.success) {
                const pts = data.data.points;
                const counts = data.data.counts;
                const rates = {common:1, uncommon:2, rare:3, holo:4, gold:5};
                const labels = {common:'Común', uncommon:'Poco Común', rare:'Rara', holo:'Holográfica', gold:'Dorada'};

                document.getElementById('duplicate-points').innerText = pts;
                
                // Renderizar desglose de rarezas (Horizontal con puntos)
                const breakdown = document.getElementById('rarity-breakdown');
                breakdown.innerHTML = '';
                Object.keys(counts).forEach(key => {
                    if(counts[key] > 0) {
                        breakdown.innerHTML += `
                            <div class="rarity-stat-item">
                                <span class="text-[7px] font-black text-gray-400 uppercase leading-none mb-1">${rates[key]} PTS</span>
                                <span class="text-[10px] font-black text-white leading-none">${counts[key]}</span>
                                <div class="rarity-dot" style="background: var(--rarity-${key})"></div>
                            </div>
                        `;
                    }
                });

                if(pts > 0) {
                    document.getElementById('badge-pts').classList.remove('hidden');
                    document.getElementById('badge-pts').innerText = `${pts} PTS`;
                } else {
                    document.getElementById('badge-pts').classList.add('hidden');
                }
            }
        }
        loadPoints();

        function startTimer(duration, displayId) {
            let timer = duration, hours, minutes, seconds;
            const display = document.getElementById(displayId);
            display.classList.remove('hidden');
            const interval = setInterval(() => {
                hours = parseInt(timer / 3600, 10);
                minutes = parseInt((timer % 3600) / 60, 10);
                seconds = parseInt(timer % 60, 10);
                display.textContent = `${hours < 10 ? "0"+hours : hours}:${minutes < 10 ? "0"+minutes : minutes}:${seconds < 10 ? "0"+seconds : seconds}`;
                if (--timer < 0) { clearInterval(interval); display.classList.add('hidden'); }
            }, 1000);
        }

        <?php if($triviaRemaining > 0): ?>
            startTimer(<?php echo $triviaRemaining; ?>, 'trivia-timer');
        <?php endif; ?>

        // Manejo de Sugerencias
        const suggText = document.getElementById('suggestion-text');
        const suggCounter = document.getElementById('suggestion-counter');
        
        suggText.addEventListener('input', () => {
            suggCounter.innerText = `${suggText.value.length} / 255`;
            suggCounter.className = suggText.value.length >= 250 ? 'text-[8px] font-black text-red-500 uppercase' : 'text-[8px] font-black text-gray-500 uppercase';
        });

        document.getElementById('form-suggestion').onsubmit = async (e) => {
            e.preventDefault();
            const text = suggText.value.trim();
            const category = document.getElementById('suggestion-category').value;
            if(!text) return;

            const btn = e.target.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "ENVIANDO...";
            btn.disabled = true;

            try {
                const res = await fetch('api/send_suggestion.php', { 
                    method: 'POST', 
                    body: new URLSearchParams({ suggestion: text, category: category }) 
                });
                const data = await res.json();
                
                showToast(data.message, !data.success);
                
                if(data.success) {
                    suggText.value = '';
                    suggCounter.innerText = '0 / 255';
                    closeModal('suggestion');
                }
            } catch(e) { 
                showToast("Error de conexión", true); 
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>
