<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';
requireLogin();

checkMaintenance($pdo);

$user = getCurrentUser($pdo);
if (!$user) {
    header("Location: index.php");
    exit;
}

// Persistencia de vista y corrección de ruta de retorno
$viewParam = (isset($_GET['view']) && $_GET['view'] === 'student') ? '?view=student' : '';
$userRole = $user['role'] ?? 'alumno';
if ($userRole === 'admin') {
    $backUrl = (isset($_GET['view']) && $_GET['view'] === 'student') ? "dashboard.php?view=student" : "admin/dashboard.php";
} elseif ($userRole === 'docente') {
    $backUrl = (isset($_GET['view']) && $_GET['view'] === 'student') ? "dashboard.php?view=student" : "docente/dashboard.php";
} else {
    $backUrl = "dashboard.php";
}

// Obtener Configuración del Álbum
$stmtAlbum = $pdo->prepare("SELECT * FROM albums WHERE id = 1");
$stmtAlbum->execute();
$albumConfig = $stmtAlbum->fetch();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="referrer" content="no-referrer">
    <title>Apertura de Sobres - Álbum 32</title>
    <link rel="icon" type="image/x-icon" href="assets/img/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { 
            font-family: 'Outfit', sans-serif; 
            background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); 
            color: white; min-height: 100vh; overflow: hidden;
            display: flex; flex-direction: column; align-items: center;
            margin: 0; padding: 0;
        }
        
        main { width: 100%; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }

        #flash { position: fixed; inset: 0; background: white; z-index: 5000; pointer-events: none; opacity: 0; }
        .flash-anim { animation: flash-out 0.6s ease-out forwards; }
        @keyframes flash-out { 0% { opacity: 1; } 100% { opacity: 0; } }

        /* MODAL DETALLE */
        .modal-blur { position: fixed; inset: 0; background: rgba(0,0,0,0.96); backdrop-filter: blur(25px); z-index: 9000; display: none; align-items: center; justify-content: center; }
        .modal-blur.active { display: flex; }
        
        /* UI SOBRE CON IMAGEN */
        .pack-center-container { width: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
        .booster-pack {
            width: 220px; height: 320px;
            background: url('<?php echo getDriveUrl($pdo, $albumConfig['pack_img']); ?>') no-repeat center center;
            background-size: contain;
            position: relative;
            filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6));
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        }

        /* GEMA DE CONTADOR PREMIUM */
        .pack-counter { 
            position: absolute; top: -15px; right: -15px; 
            background: radial-gradient(circle at 30% 30%, #fef3c7 0%, #fbbf24 50%, #d97706 100%);
            color: #020617; width: 55px; height: 55px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 950; font-size: 1.4rem; 
            border: 3px solid rgba(2, 6, 23, 0.8); z-index: 100; 
            box-shadow: 0 0 20px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(255,255,255,0.5);
            overflow: hidden;
        }
        .pack-counter::after {
            content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
            background: linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.8) 50%, transparent 55%);
            animation: coin-shine 3s infinite;
        }

        /* SUGERENCIA ULTRA-SUTIL TIPO SUSPIRO - CORREGIDA */
        .subtle-hint {
            position: absolute;
            bottom: -50px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            pointer-events: none;
            width: max-content;
            animation: breath 3s ease-in-out infinite;
            z-index: 20;
        }
        .hint-text {
            font-size: 0.65rem;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.3em;
            color: rgba(34, 211, 238, 0.8);
            text-shadow: 0 0 15px rgba(34, 211, 238, 0.4);
        }
        @keyframes breath {
            0%, 100% { opacity: 0.3; transform: translateX(-50%) scale(0.95); }
            50% { opacity: 0.9; transform: translateX(-50%) scale(1.05); }
        }
        @keyframes coin-shine { 0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); } 20%, 100% { transform: translateX(100%) translateY(100%) rotate(45deg); } }
        
        /* FOCOS DE CIRCO / STAGE LIGHTS */
        #stage-lights {
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .light-beam {
            position: absolute;
            width: 200vw;
            height: 200vw;
            background: conic-gradient(
                from 0deg,
                transparent 0deg,
                rgba(255, 255, 255, 0.1) 15deg,
                transparent 30deg,
                transparent 45deg,
                rgba(255, 255, 255, 0.1) 60deg,
                transparent 75deg
            );
        }
        .light-beam:nth-child(1) { animation: rotate-lights 20s linear infinite; }
        .light-beam:nth-child(2) { animation: rotate-lights 15s linear infinite reverse; opacity: 0.6; }
        .light-beam:nth-child(3) { animation: rotate-lights 25s linear infinite; opacity: 0.4; transform: scale(1.2); }
        .light-beam:nth-child(4) { animation: rotate-lights 18s linear infinite reverse; opacity: 0.3; transform: scale(0.8); }
        
        @keyframes rotate-lights {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .stage-glow {
            position: absolute;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%);
            animation: stage-pulse 4s ease-in-out infinite;
        }

        /* EFECTO PARTÍCULAS BOKEH */
        .bokeh-container { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
        .bokeh { position: absolute; background: rgba(255, 255, 255, 0.3); border-radius: 50%; filter: blur(3px); animation: float-bokeh var(--d) linear infinite; bottom: -100px; }
        @keyframes float-bokeh { 
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            20% { opacity: 0.3; }
            80% { opacity: 0.3; }
            100% { transform: translateY(-120vh) scale(1.5); opacity: 0; }
        }
        @keyframes stage-pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.6; }
        }

        .pack-shake { animation: intense-shake 0.5s infinite; }
        @keyframes intense-shake { 
            0%, 100% { transform: translate(0,0) rotate(0deg); } 
            10% { transform: translate(-4px, -2px) rotate(-3deg); }
            20% { transform: translate(3px, 1px) rotate(2deg); }
            30% { transform: translate(-3px, 2px) rotate(-1deg); }
            40% { transform: translate(4px, -1px) rotate(3deg); }
            50% { transform: translate(-2px, 1px) rotate(-2deg); }
            60% { transform: translate(2px, -2px) rotate(1deg); }
            70% { transform: translate(-3px, 1px) rotate(-3deg); }
            80% { transform: translate(3px, -1px) rotate(2deg); }
            90% { transform: translate(-2px, -1px) rotate(-1deg); }
        }

        /* CONTENEDOR DE CARTAS */
        #results-view { width: 100%; display: none; flex-direction: column; align-items: center; position: absolute; inset: 0; justify-content: center; }
        .cards-hand { position: relative; width: 100%; height: 400px; display: flex; align-items: center; justify-content: center; perspective: 2000px; }

        /* FIGURITA INDIVIDUAL */
        .card-item { 
            position: absolute; width: 200px; height: 280px;
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s;
            transform-style: preserve-3d; cursor: pointer;
        }
        .sticker-card-fixed { width: 100%; height: 100%; position: relative; }

        .sticker-body { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .sticker-front, .sticker-back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 12px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.5); width: 100%; height: 100%; }
        
        .sticker-back { 
            background: url('assets/img/dorso-proceres.png') no-repeat center center;
            background-size: cover;
            border: 1px solid rgba(255,255,255,0.1);
            transform: rotateY(0deg); 
        }

        .sticker-front { transform: rotateY(180deg); background: #0f172a; }
        .sticker-content { width: 100%; height: 100%; position: relative; overflow: hidden; background: #0f172a; }

        /* ESTADOS */
        .is-flipped .sticker-body { transform: rotateY(180deg); }
        
        /* VUELO ALEATORIO */
        .card-revealed-right { transform: translateX(650px) translateY(-250px) rotate(90deg) scale(0.2) !important; opacity: 0 !important; pointer-events: none !important; }
        .card-revealed-left { transform: translateX(-650px) translateY(-250px) rotate(-90deg) scale(0.2) !important; opacity: 0 !important; pointer-events: none !important; }

        /* MODO PILA */
        .cards-hand.is-deck .card-item { transform: translate(0,0) rotate(0deg); z-index: calc(100 - var(--idx)); }
        .cards-hand.is-deck .card-item[style*="--idx: 1"] { transform: translateY(-4px) rotate(1deg); }
        .cards-hand.is-deck .card-item[style*="--idx: 2"] { transform: translateY(-8px) rotate(-1deg); }
        .cards-hand.is-deck .card-item[style*="--idx: 3"] { transform: translateY(-12px) rotate(2deg); }
        .cards-hand.is-deck .card-item[style*="--idx: 4"] { transform: translateY(-16px) rotate(-2deg); }

        /* MODO ABANICO */
        .cards-hand:not(.is-deck) .card-item:nth-child(1) { --tx: -160px; --ty: 40px; --rot: -20deg; z-index: 10; }
        .cards-hand:not(.is-deck) .card-item:nth-child(2) { --tx: -80px;  --ty: 10px; --rot: -10deg; z-index: 20; }
        .cards-hand:not(.is-deck) .card-item:nth-child(3) { --tx: 0px;    --ty: 0px;  --rot: 0deg;   z-index: 30; }
        .cards-hand:not(.is-deck) .card-item:nth-child(4) { --tx: 80px;   --ty: 10px; --rot: 10deg;  z-index: 20; }
        .cards-hand:not(.is-deck) .card-item:nth-child(5) { --tx: 160px;  --ty: 40px; --rot: 20deg;  z-index: 10; }

        @media (max-width: 768px) {
            .card-item { width: 140px; height: 196px; }
            .cards-hand:not(.is-deck) .card-item:nth-child(1) { --tx: -100px; --ty: 30px; --rot: -15deg; }
            .cards-hand:not(.is-deck) .card-item:nth-child(2) { --tx: -50px;  --ty: 10px; --rot: -8deg; }
            .cards-hand:not(.is-deck) .card-item:nth-child(3) { --tx: 0px;    --ty: 0px;  --rot: 0deg; }
            .cards-hand:not(.is-deck) .card-item:nth-child(4) { --tx: 50px;   --ty: 10px; --rot: 8deg; }
            .cards-hand:not(.is-deck) .card-item:nth-child(5) { --tx: 100px;  --ty: 30px; --rot: 15deg; }
            
            .card-revealed-right { transform: translateX(200px) translateY(-150px) rotate(45deg) scale(0.2) !important; }
            .card-revealed-left { transform: translateX(-200px) translateY(-150px) rotate(-45deg) scale(0.2) !important; }
        }
        
        .cards-hand:not(.is-deck) .card-item { transform: translateX(var(--tx)) translateY(var(--ty)) rotate(var(--rot)); }

        /* BLINDAJE HOVER FANTASMA */
        @media (hover: hover) {
            .cards-hand:not(.is-deck):not(.no-hover) .card-item:hover { z-index: 500 !important; transform: translateX(var(--tx)) translateY(-80px) rotate(0deg) scale(1.15); }
        }
        
        .cards-hand.no-hover .card-item { pointer-events: none !important; }

        /* --- EFECTOS DE RAREZA --- */
        .frame-common { border: 5px solid #64748b; }
        .frame-uncommon { border: 6px solid #10b981; }
        .frame-rare { border: 7px solid #22d3ee; box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .frame-holo { border: 8px solid transparent; background: linear-gradient(#0f172a, #0f172a) padding-box, conic-gradient(from var(--angle), #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) border-box; animation: rotate-angle 4s linear infinite; }
        .frame-gold { 
            border: 8px solid transparent; 
            background: 
                linear-gradient(#0f172a, #0f172a) padding-box, 
                radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.8) 0%, transparent 50%) border-box,
                linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24) border-box; 
            background-size: 100% 100%, 200% 200%, 300% 300%;
            animation: holo-border 3s linear infinite; 
            box-shadow: inset 0 0 12px rgba(251, 191, 36, 0.8);
            position: relative;
        }
        
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotate-angle { to { --angle: 360deg; } }
        @keyframes holo-border { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        
        .gold-aura {
            position: absolute; inset: 0; background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
            z-index: 15; animation: aura-pulse 3s infinite alternate; pointer-events: none;
        }
        @keyframes aura-pulse { 0% { opacity: 0.2; transform: scale(0.95); } 100% { opacity: 0.5; transform: scale(1.05); } }

        .tag-common { background: #64748b !important; }
        .tag-uncommon { background: #10b981 !important; }
        .tag-rare { background: #06b6d4 !important; }
        .tag-holo { background: #a855f7 !important; }
        .tag-gold { background: #fbbf24 !important; color: #000 !important; }

        .rarity-tag { 
            display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 7px; font-weight: 900; 
            text-transform: uppercase; color: white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            letter-spacing: 0.1em; margin-bottom: 5px;
        }

        .sticker-info-area {
            position: absolute; bottom: 0; left: 0; right: 0; height: 25%;
            background: url('assets/img/marco_figus.png') no-repeat center bottom;
            background-size: 100% 100%;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 5px 10px; text-align: center; z-index: 35;
        }

        /* AJUSTE DE IMAGEN PARA NO DEJAR HUECOS - 75% de altura */
        .sticker-item-img { width: 100%; height: 75%; object-fit: cover; object-position: top; border-radius: 0 !important; display: block; }
        
        .overlay-holo { position: absolute; inset: 0; z-index: 20; mix-blend-mode: screen; background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 24px 24px; animation: sparkles 4s linear infinite; opacity: 0.6; }
        .overlay-rare { position: absolute; inset: 0; z-index: 20; mix-blend-mode: overlay; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%); background-size: 200% 100%; animation: sweep-special 2.5s infinite ease-in-out; }
        .overlay-gold { position: absolute; inset: 0; z-index: 20; mix-blend-mode: overlay; background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 215, 0, 0.4) 100%); }
        
        /* Gold Sweep Perfeccionado */
        .gold-sweep { 
            position: absolute;
            top: -100%; left: -100%; width: 300%; height: 300%;
            background: linear-gradient(110deg, 
                transparent 45%, 
                rgba(251, 191, 36, 0.3) 48%, 
                rgba(255, 255, 255, 0.8) 50%, 
                rgba(251, 191, 36, 0.3) 52%, 
                transparent 55%
            );
            animation: sweep-diagonal 3s infinite linear;
            z-index: 25; pointer-events: none; mix-blend-mode: color-dodge;
        }
        @keyframes sweep-diagonal { 
            0% { transform: translate(-20%, -20%); } 
            100% { transform: translate(20%, 20%); } 
        }

        .gold-filter { filter: sepia(1) saturate(5) hue-rotate(10deg) brightness(0.8) contrast(1.2); }
        @keyframes sparkles { 0% { background-position: 0 0; opacity: 0.3; } 50% { opacity: 0.8; } 100% { background-position: 48px 48px; opacity: 0.3; } }
        @keyframes sweep-special { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

        .badge-new { position: absolute; top: 10px; left: 10px; z-index: 40; background: #22d3ee; color: #020617; font-size: 8px; font-weight: 900; padding: 3px 8px; border-radius: 4px; transform: rotate(-8deg); }

        /* HEADER */
        .top-header { position: fixed; top: 0; left: 0; right: 0; height: 60px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; z-index: 2000; }
        .btn-nav-back { background: rgba(255,255,255,0.05); padding: 8px 15px; border-radius: 10px; font-weight: 800; font-size: 0.7rem; border: 1px solid rgba(255,255,255,0.1); color: white; text-transform: uppercase; }
        .floating { animation: float 4s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        
        #btn-finish { position: absolute; bottom: 50px; display: none; z-index: 100; text-align: center; width: 100%; }
        .btn-ready { background: #22d3ee; color: #020617; padding: 16px 40px; border-radius: 20px; font-weight: 900; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 10px 25px rgba(34,211,238,0.3); border: none; cursor: pointer; }

        /* NUEVO ESTILO BOTON SKIP */
        .btn-skip-glow {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(34, 211, 238, 0.3);
            color: #22d3ee;
            padding: 12px 35px;
            border-radius: 999px;
            font-weight: 900;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
            transition: all 0.3s ease;
            animation: skip-pulse 2s infinite;
            cursor: pointer;
            z-index: 200;
        }
        .btn-skip-glow:hover {
            background: rgba(34, 211, 238, 0.1);
            border-color: #22d3ee;
            transform: translateY(-2px);
        }
        @keyframes skip-pulse {
            0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.4); border-color: rgba(34, 211, 238, 0.3); }
            70% { box-shadow: 0 0 0 15px rgba(34, 211, 238, 0); border-color: rgba(34, 211, 238, 0.8); }
            100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); border-color: rgba(34, 211, 238, 0.3); }
        }
    </style>
</head>
<body>

    <div id="flash"></div>

    <!-- MODAL DETALLE -->
    <div id="modal-detail" class="modal-blur" onclick="closeDetail()">
        <div class="flex flex-col items-center max-w-sm w-full p-4" onclick="event.stopPropagation()">
            <div style="width:280px; height:390px; margin-bottom: 25px;">
                <div class="sticker-body is-flipped" style="width:100%; height:100%;">
                    <div class="sticker-front" id="modal-frame" style="width:100%; height:100%; position:relative; transform: rotateY(0deg);">
                        <div class="sticker-content" id="modal-sticker-content" style="width:100%; height:100%; position:relative; overflow:hidden; border-radius:0;">
                            <div id="modal-overlay"></div>
                            <img id="modal-img" src="" class="w-full h-full object-cover" style="border-radius:0 !important; height: 100% !important;">
                            <div id="modal-rarity-tag-inside" class="rarity-tag !static !translate-y-0 shadow-none px-4 py-1.5 text-[10px] hidden"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-white/5 p-6 rounded-3xl text-center border border-white/10 w-full relative">
                <p id="modal-number" class="text-cyan-400 font-bold text-xs mb-1"></p>
                <h3 id="modal-name" class="text-2xl font-black italic uppercase text-white mb-2"></h3>
                <div class="flex justify-center mb-4">
                    <div id="modal-rarity-tag-real" class="rarity-tag !static !translate-y-0 shadow-none px-4 py-1.5 text-[10px]"></div>
                </div>
                <p id="modal-desc" class="text-gray-400 text-sm leading-relaxed italic mt-4 mb-6"></p>
                <button onclick="closeDetail()" class="px-8 py-3 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-widest">Cerrar Detalle</button>
            </div>
        </div>
    </div>

    <header class="top-header">
        <a href="<?php echo $backUrl; ?>" class="btn-nav-back">⬅ VOLVER</a>
        <div class="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span class="text-[10px] font-black uppercase text-gray-400"><?php echo htmlspecialchars($user['username']); ?></span>
        </div>
    </header>

    <?php renderGlobalAssets($pdo); ?>

    <main>
        <!-- LUCES DE ESCENARIO -->
        <div id="stage-lights">
            <div class="light-beam"></div>
            <div class="light-beam"></div>
            <div class="light-beam"></div>
            <div class="light-beam"></div>
            <div class="stage-glow"></div>
            <div class="bokeh-container" id="bokeh-container"></div>
        </div>

        <div id="pack-selector" class="pack-center-container">
            <div class="pack-wrapper relative" id="pack-wrapper" onclick="handleOpen()">
                <?php if($user['packs_available'] > 0): ?>
                    <div id="main-pack" class="booster-pack floating cursor-pointer">
                        <div class="pack-counter"><?php echo $user['packs_available']; ?></div>
                    </div>
                    <!-- SUGERENCIA ULTRA-SUTIL TIPO SUSPIRO -->
                    <div class="subtle-hint">
                        <span class="hint-text">Toca para abrir</span>
                    </div>
                <?php else: ?>
                    <div class="booster-pack opacity-30 grayscale border-dashed border-2 text-center" style="background: rgba(255,255,255,0.05);">
                        <div class="text-6xl mb-4">📭</div>
                        <h2 class="text-xl font-black italic text-white uppercase">Sin Sobres</h2>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <div id="results-view">
            <div id="cards-hand" class="cards-hand is-deck"></div>
            
            <!-- SUGERENCIA PARA REVELAR CARTAS -->
            <div id="reveal-hint" class="subtle-hint" style="position: relative; bottom: 0; margin-top: 20px; display: none;">
                <span class="hint-text">Toca las cartas</span>
            </div>

            <div id="skip-wrapper" class="mt-12 h-16 flex items-center justify-center">
                <button id="btn-skip" onclick="skipAnimation()" class="btn-skip-glow" style="display: none;">SKIP</button>
            </div>
            <div id="btn-finish">
                <button onclick="location.reload()" class="btn-ready uppercase">Abrir otro sobre</button>
            </div>
        </div>
    </main>

    <script>
        let isProcessing = false;
        let revealedCount = 0;

        function skipAnimation() {
            const handEl = document.getElementById('cards-hand');
            const skipBtn = document.getElementById('btn-skip');
            if (skipBtn) skipBtn.parentElement.style.display = 'none';

            // Voltear todas las cartas
            document.querySelectorAll('.card-item').forEach(card => {
                card.classList.add('is-flipped');
            });

            revealedCount = 5;
            
            // Forzar el estado final
            handEl.classList.add('no-hover');
            
            setTimeout(() => {
                handEl.classList.remove('is-deck');
                document.querySelectorAll('[class*="card-revealed"]').forEach(c => {
                    c.classList.remove('card-revealed-right', 'card-revealed-left');
                });
                document.getElementById('btn-finish').style.display = 'block';
                
                const hasHigh = document.querySelectorAll('.frame-holo, .frame-gold').length > 0;
                if(hasHigh) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#22d3ee', '#fbbf24', '#ffffff'] });

                setTimeout(() => {
                    handEl.classList.remove('no-hover');
                    handEl.style.display = 'none';
                    handEl.offsetHeight; 
                    handEl.style.display = 'flex';
                }, 100); 
            }, 300);
        }

        async function handleOpen() {
            if (isProcessing) return;
            isProcessing = true;
            
            const wrapper = document.getElementById('pack-wrapper');
            const pack = document.getElementById('main-pack');
            if(!pack) return;

            pack.classList.remove('floating');
            wrapper.classList.add('pack-shake');

            try {
                const res = await fetch('api/open_pack.php', { method: 'POST' });
                const data = await res.json();

                if (!data.success) {
                    alert(data.message);
                    location.reload();
                    return;
                }

                setTimeout(() => {
                    document.getElementById('flash').classList.add('flash-anim');
                    document.getElementById('pack-selector').style.display = 'none';
                    renderHand(data.data.stickers);
                    
                    // Mostrar botón SKIP después de 5 segundos
                    setTimeout(() => {
                        const skipBtn = document.getElementById('btn-skip');
                        if (skipBtn && revealedCount < 5) {
                            skipBtn.style.display = 'block';
                            skipBtn.parentElement.style.display = 'flex';
                        }
                    }, 5000);

                    const hasHigh = data.data.stickers.some(s => s.rarity === 'holo' || s.rarity === 'gold');
                    if (hasHigh) {
                        confetti({ particleCount: 100, spread: 60, origin: { y: 0.5 }, colors: ['#22d3ee', '#fbbf24', '#ffffff'] });
                    }
                }, 800);

            } catch (e) { console.error(e); isProcessing = false; }
        }

        function renderHand(stickers) {
            const results = document.getElementById('results-view');
            const hand = document.getElementById('cards-hand');
            const skipBtn = document.getElementById('btn-skip');
            
            results.style.display = 'flex';
            // El botón SKIP se mantiene oculto al inicio de renderHand
            if (skipBtn) {
                skipBtn.style.display = 'none';
                skipBtn.parentElement.style.display = 'none';
            }
            
            hand.innerHTML = '';
            revealedCount = 0;

            stickers.forEach((s, index) => {
                const sData = JSON.stringify(s).replace(/'/g, "&apos;");
                const isGold = s.rarity === 'gold';
                const cardHtml = `
                    <div class="card-item" style="--idx: ${index}" id="card-${index}">
                        <div class="sticker-card-fixed">
                            <div class="sticker-body" id="body-${index}" onclick='handleCardClick(${index}, ${sData})'>
                                <div class="sticker-back"></div>
                                <div class="sticker-front frame-${s.rarity}">
                                    <div class="sticker-content">
                                        ${isGold ? '<div class="gold-aura"></div>' : ''}
                                        ${s.rarity === 'holo' ? '<div class="overlay-holo"></div>' : ''}
                                        ${s.rarity === 'rare' ? '<div class="overlay-rare"></div>' : ''}
                                        ${s.rarity === 'gold' ? '<div class="overlay-gold"></div><div class="gold-sweep"></div>' : ''}
                                        ${s.is_new ? '<div class="badge-new">¡NUEVA!</div>' : ''}
                                        <img src="${s.external_url}" class="sticker-item-img ${s.rarity === 'gold' ? 'gold-filter' : ''}">
                                        
                                        <div class="sticker-info-area">
                                            <div class="rarity-tag tag-${s.rarity}">${s.rarity}</div>
                                            <h4 class="text-[10px] font-black italic uppercase truncate text-white leading-tight">${s.name}</h4>
                                            <p class="text-[8px] text-cyan-400 font-black mt-0.5">FIGURITA Nº ${s.number}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                hand.insertAdjacentHTML('beforeend', cardHtml); 
            });
        }

        window.handleCardClick = (index, data) => {
            const handEl = document.getElementById('cards-hand');
            const cardEl = document.getElementById(`card-${index}`);
            const skipBtn = document.getElementById('btn-skip');
            
            // Ocultar sugerencia al interactuar
            const revealHint = document.getElementById('reveal-hint');
            if(revealHint) revealHint.style.display = 'none';

            if (!handEl.classList.contains('is-deck')) {
                openDetail(data);
                return;
            }

            if (!cardEl.classList.contains('is-flipped')) {
                cardEl.classList.add('is-flipped');
                return;
            }

            const side = Math.random() > 0.5 ? 'right' : 'left';
            cardEl.classList.add(`card-revealed-${side}`);
            revealedCount++;

            if (revealedCount === 5) {
                if (skipBtn) skipBtn.parentElement.style.display = 'none';
                handEl.classList.add('no-hover');
                setTimeout(() => {
                    handEl.classList.remove('is-deck');
                    document.querySelectorAll('[class*="card-revealed"]').forEach(c => {
                        c.classList.remove('card-revealed-right', 'card-revealed-left');
                    });
                    document.getElementById('btn-finish').style.display = 'block';
                    
                    const hasHigh = document.querySelectorAll('.frame-holo, .frame-gold').length > 0;
                    if(hasHigh) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#22d3ee', '#fbbf24', '#ffffff'] });

                    setTimeout(() => {
                        handEl.classList.remove('no-hover');
                        handEl.style.display = 'none';
                        handEl.offsetHeight; 
                        handEl.style.display = 'flex';
                    }, 1500);
                }, 600);
            }
        };

        function openDetail(card) {
            const modal = document.getElementById('modal-detail');
            const img = document.getElementById('modal-img');
            const container = document.getElementById('modal-sticker-content');
            
            img.src = card.external_url;
            document.getElementById('modal-name').textContent = card.name;
            document.getElementById('modal-number').textContent = `Figurita Nº ${card.number}`;
            document.getElementById('modal-desc').textContent = card.description || 'Una pieza histórica única de nuestra técnica.';
            document.getElementById('modal-frame').className = `sticker-front frame-${card.rarity}`;
            
            const tag = document.getElementById('modal-rarity-tag-real');
            tag.textContent = card.rarity;
            tag.className = `rarity-tag tag-${card.rarity} !static !translate-y-0 shadow-none px-4 py-1.5 text-[10px]`;
            
            const overlay = document.getElementById('modal-overlay');
            overlay.className = '';
            img.classList.remove('gold-filter');
            
            const oldSweep = container.querySelector('.gold-sweep');
            if(oldSweep) oldSweep.remove();
            
            const oldAura = container.querySelector('.gold-aura');
            if(oldAura) oldAura.remove();

            if (card.rarity === 'holo') overlay.className = 'overlay-holo';
            if (card.rarity === 'rare') overlay.className = 'overlay-rare';
            if (card.rarity === 'gold') {
                overlay.className = 'overlay-gold';
                img.classList.add('gold-filter');
                
                const aura = document.createElement('div');
                aura.className = "gold-aura";
                container.appendChild(aura);

                const sweep = document.createElement('div');
                sweep.className = "gold-sweep";
                container.appendChild(sweep);
            }
            
            modal.classList.add('active');
        }

        function closeDetail() { document.getElementById('modal-detail').classList.remove('active'); }

        // GENERAR BOKEH DINÁMICO
        const bokehContainer = document.getElementById('bokeh-container');
        for(let i=0; i<30; i++) {
            const b = document.createElement('div');
            b.className = 'bokeh';
            const size = Math.random() * 30 + 10;
            b.style.width = size + 'px';
            b.style.height = size + 'px';
            b.style.left = Math.random() * 100 + 'vw';
            const duration = Math.random() * 8 + 4;
            b.style.setProperty('--d', duration + 's');
            // Posición inicial aleatoria para que no empiecen todas juntas
            b.style.bottom = "-20vh"; 
            b.style.animationDelay = -(Math.random() * duration) + 's';
            bokehContainer.appendChild(b);
        }
    </script>
</body>
</html>
'px';
            b.style.left = Math.random() * 100 + 'vw';
            const duration = Math.random() * 8 + 4;
            b.style.setProperty('--d', duration + 's');
            // Posición inicial aleatoria para que no empiecen todas juntas
            b.style.bottom = "-20vh"; 
            b.style.animationDelay = -(Math.random() * duration) + 's';
            bokehContainer.appendChild(b);
        }
    </script>
</body>
</html>
