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
// 0. Obtener Configuración del Álbum Actual (Álbum ID 1 por defecto)
$stmtAlbum = $pdo->prepare("SELECT * FROM albums WHERE id = 1");
$stmtAlbum->execute();
$albumConfig = $stmtAlbum->fetch();

// 1. Obtener todas las figuritas base vinculadas al álbum
$stmtAll = $pdo->prepare("SELECT * FROM stickers WHERE album_id = ? ORDER BY number ASC");
$stmtAll->execute([$albumConfig['id']]);
$allStickers = $stmtAll->fetchAll();

// 2. Inventario Completo del Usuario
$stmtInv = $pdo->prepare("
    SELECT s.*, i.is_stuck, i.quantity 
    FROM stickers s
    LEFT JOIN user_inventory i ON s.id = i.sticker_id AND i.user_id = ?
");
$stmtInv->execute([$_SESSION['user_id']]);
$userInv = $stmtInv->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_UNIQUE);

// Figuritas sueltas para inventario.php
$looseStickers = [];
foreach ($userInv as $id => $data) {
    if (isset($data['quantity']) && $data['quantity'] > 0 && $data['is_stuck'] == 0) {
        $data['id'] = $id;
        $looseStickers[] = $data;
    }
}

/**
 * DEFINICIÓN DE MOSAICOS
 */
$mosaics = [
    ['range' => [2, 5], 'type' => '2x2'],
    ['range' => [12, 13], 'type' => '1x2'],
    ['range' => [25, 26], 'type' => '1x2'],
    ['range' => [44, 47], 'type' => '2x2']
];

/**
 * LÓGICA DE AGRUPACIÓN DE PÁGINAS
 */
$stk1 = null; $stk50 = null; $regularPool = [];
foreach ($allStickers as $s) {
    if ($s['number'] == 1) $stk1 = $s;
    else if ($s['number'] == 50) $stk50 = $s;
    else if ($s['number'] < 50) $regularPool[] = $s;
}

$pages = [];
$pages[] = ['type' => 'cover', 'title' => 'ÁLBUM OFICIAL', 'subtitle' => 'TÉCNICA 32 - 2026'];
if ($stk1) $pages[] = ['type' => 'honor', 'stickers' => [$stk1], 'title' => 'SALÓN DE HONOR'];
$tempPool = $regularPool;
while (!empty($tempPool)) {
    $slice = array_splice($tempPool, 0, 4);
    if (!empty($slice)) $pages[] = ['type' => 'regular', 'stickers' => $slice, 'title' => 'COLECCIÓN TÉCNICA'];
}
if ($stk50) $pages[] = ['type' => 'honor', 'stickers' => [$stk50], 'title' => 'LEYENDA FINAL'];
$pages[] = ['type' => 'back-cover', 'title' => 'FIN'];

// Optimización LCP: Pre-calcular URL de portada para precarga
$coverUrlForLCP = getDriveUrl($pdo, $albumConfig['cover_img'], 800);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="referrer" content="no-referrer">
    <title>Álbum Premium 32</title>
    <link rel="icon" type="image/x-icon" href="assets/img/favicon.ico">
    <link rel="preload" as="image" href="<?php echo $coverUrlForLCP; ?>" fetchpriority="high">
    <link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin>
    <link rel="preconnect" href="https://drive.google.com" crossorigin>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&family=Bebas+Neue&display=swap" rel="stylesheet">
    <style>
        :root { 
            --gold: #fbbf24; --paper: #fdf6e3; --bg: #0f172a; --leather: #452c1e; 
            --rarity-common: #94a3b8; --rarity-uncommon: #10b981; --rarity-rare: #3b82f6; --rarity-holo: #a855f7;
        }
        body { background: var(--bg); color: white; font-family: 'Outfit', sans-serif; height: 100vh; height: 100dvh; overflow: hidden; display: flex; flex-direction: column; margin: 0; user-select: none; -webkit-user-select: none; }
        header { flex-shrink: 0; z-index: 2000; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.05); }

        /* SCROLLBAR ESTÉTICO PARA INVENTARIO */
        .loose-container::-webkit-scrollbar { height: 8px; display: block; }
        .loose-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 10px; margin: 0 10px; }
        .loose-container::-webkit-scrollbar-thumb { background: linear-gradient(to right, #22d3ee, #a855f7); border-radius: 10px; border: 2px solid rgba(11, 17, 32, 0.5); }
        .loose-container { 
            overflow-x: auto !important; 
            scrollbar-width: auto !important; 
            scrollbar-color: #22d3ee rgba(255,255,255,0.05);
            -webkit-overflow-scrolling: touch;
            padding-bottom: 20px !important; 
        }

        .album-container { flex: 1; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; width: 100%; padding: 40px 20px; opacity: 0; transition: opacity 0.5s ease; min-height: 400px; }
        .album-container.loaded { opacity: 1; }
        #album-book { background: transparent; max-width: 90%; max-height: 90%; display: flex; align-items: center; justify-content: center; aspect-ratio: 3 / 4; }

        .st-page-flip { max-width: 100%; max-height: 100%; }

        @media (max-width: 768px) {
            header { display: none !important; }
            body { height: 100dvh !important; }
            .back-btn-floating { 
                display: flex !important; 
                position: fixed; top: 15px; left: 15px; z-index: 3000;
                width: 42px; height: 42px; background: rgba(15, 23, 42, 0.8); 
                backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px; align-items: center; justify-content: center;
                color: white; text-decoration: none; font-size: 1.2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            }
            .album-container { padding: 5px; flex: 1; height: auto !important; min-height: 350px; }
            .inventory-tray { height: 200px !important; flex-shrink: 0; padding: 10px !important; background: rgba(11, 17, 32, 0.8) !important; }
            .loose-container { padding: 10px 5px 25px 5px !important; }
            .page-content-wrapper { padding: 10% 5% 15% 5% !important; }
            .page-title { font-size: 0.9rem !important; margin-bottom: 0px !important; }
            .sticker-grid { gap: 6px !important; }
            
            /* GUÍA DE ARRASTRE MEJORADA */
            .drag-hint {
                display: flex !important;
                position: absolute; bottom: 20px; right: 20px;
                background: rgba(34, 211, 238, 0.2);
                backdrop-filter: blur(5px);
                border: 1px solid rgba(34, 211, 238, 0.3);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 8px; font-weight: 900; text-transform: uppercase;
                color: #22d3ee; opacity: 0.8; letter-spacing: 1.5px;
                z-index: 100;
                align-items: center; gap: 5px;
                animation: hint-bounce 2s infinite;
                pointer-events: none;
            }
            @keyframes hint-bounce { 
                0%, 100% { transform: translateX(0); opacity: 0.5; } 
                50% { transform: translateX(-10px); opacity: 1; } 
            }
            .drag-hint::after { content: ' ➔'; font-size: 10px; }
        }

        .drag-hint { 
            display: flex;
            position: absolute; bottom: 25px; right: 25px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 9px; font-weight: 900; text-transform: uppercase;
            color: white; opacity: 0.6; letter-spacing: 2px;
            z-index: 100;
            align-items: center; gap: 8px;
            animation: hint-bounce 3s infinite;
            pointer-events: none;
        }
        .drag-hint::after { content: ' ➔'; }

        .page { background-color: var(--paper); background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png"); box-shadow: inset 0 0 50px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); position: relative; overflow: hidden; display: flex; flex-direction: column; aspect-ratio: 3 / 4; width: 100%; }
        .page::after { content: ''; position: absolute; top: 0; width: 60px; height: 100%; z-index: 20; pointer-events: none; }
        .page:nth-child(even)::after { right: 0; background: linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 20%, transparent 100%); }
        .page:nth-child(odd)::after { left: 0; background: linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 20%, transparent 100%); }
        .page-content-wrapper { flex: 1; display: flex; flex-direction: column; padding: 10% 8%; align-items: center; justify-content: space-between; }
        .sticker-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(10px, 3vw, 20px); width: 100%; max-width: 380px; margin: auto; }
        
        /* Ajuste de mosaico híbrido (Páginas con mosaicos unidos arriba, individuales abajo) */
        .sticker-grid.mosaic-page { column-gap: 0 !important; }
        
        /* Slots de Mosaico (Unión perfecta) */
        .mosaic-page .slot:has(.mosaic-left) { border-right: none !important; border-top-right-radius: 0; border-bottom-right-radius: 0; }
        .mosaic-page .slot:has(.mosaic-right) { border-left: none !important; border-top-left-radius: 0; border-bottom-left-radius: 0; }
        
        /* Fallback para navegadores que no soportan :has (basado en números conocidos) */
        .slot[data-number="2"], .slot[data-number="34"], .slot[data-number="38"] { border-right: none !important; border-top-right-radius: 0; border-bottom-right-radius: 0; }
        .slot[data-number="3"], .slot[data-number="35"], .slot[data-number="39"] { border-left: none !important; border-top-left-radius: 0; border-bottom-left-radius: 0; }

        /* Quitar bordes internos de las figuritas del mosaico */
        .sticker-body.mosaic-left { border-right: none !important; border-top-right-radius: 0; border-bottom-right-radius: 0; box-shadow: -2px 4px 8px rgba(0,0,0,0.2); }
        .sticker-body.mosaic-right { border-left: none !important; border-top-left-radius: 0; border-bottom-left-radius: 0; box-shadow: 2px 4px 8px rgba(0,0,0,0.2); }
        
        /* Restaurar el espacio visual para las figuritas de abajo (No mosaico) en grillas sin gap */
        .mosaic-page .slot:not(:has(.mosaic-left)):not(:has(.mosaic-right)) { width: calc(100% - 10px); }
        .mosaic-page .slot:nth-child(odd):not(:has(.mosaic-left)):not(:has(.mosaic-right)) { justify-self: end; margin-right: 5px; }
        .mosaic-page .slot:nth-child(even):not(:has(.mosaic-left)):not(:has(.mosaic-right)) { justify-self: start; margin-left: 5px; }
        
        .slot { background: rgba(0,0,0,0.04); border: 2px dashed rgba(0,0,0,0.1); border-radius: 8px; position: relative; width: 100%; aspect-ratio: 3/4; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
        .slot span { font-size: clamp(1.4rem, 7vw, 2rem); font-weight: 900; color: #ffffff; opacity: 0.6; font-family: 'Bebas Neue'; text-shadow: 0 2px 4px rgba(0,0,0,0.5); letter-spacing: 1px; }
        
        /* BORDES DE RAREZA EN SLOTS */
        .slot-rarity-common { border-color: #64748b; }
        .slot-rarity-uncommon { border-color: #10b981; border-style: solid; }
        .slot-rarity-rare { border-color: #22d3ee; border-style: solid; box-shadow: inset 0 0 10px rgba(34, 211, 238, 0.1); }
        .slot-rarity-holo, .slot-rarity-gold { border: none !important; background: transparent !important; }
        .slot-rarity-holo::before { content: ''; position: absolute; inset: 0; padding: 4px; border-radius: 8px; background: conic-gradient(from var(--angle), #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) border-box; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: rotate-angle 4s linear infinite; pointer-events: none; }
        .slot-rarity-gold::before { content: ''; position: absolute; inset: 0; padding: 4px; border-radius: 8px; background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.8) 0%, transparent 50%) border-box, linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24) border-box; background-size: 200% 200%, 300% 300%; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; animation: holo-border 3s linear infinite; pointer-events: none; }

        .page-cover { background-color: rgba(69, 44, 30, 0.9); color: var(--gold); border: 8px double #5d3a26; }
        .custom-cover-img { background-position: center !important; background-size: cover !important; background-repeat: no-repeat !important; border:none !important; }
        .page-number { font-size: 9px; font-weight: 900; color: #1e293b; opacity: 0.3; letter-spacing: 2px; text-transform: uppercase; }

        /* ESTILOS DE FIGURITAS */
        .sticker-body { width: 100%; height: 100%; background: white; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); position: relative; overflow: hidden; transform: rotateZ(var(--rotation, 0deg)); cursor: pointer; }
        
        .sticker-content { width: 100%; height: 100%; background: rgba(15, 23, 42, 0.9); position: relative; overflow: hidden; pointer-events: none; }

        /* ESQUINEROS DINÁMICOS POR RAREZA */
        .sticker-content::after {
            content: '';
            position: absolute;
            inset: 0;
            background: 
                linear-gradient(135deg, var(--corner-color, #1e293b) 14%, transparent 14.5%) 0 0 / 22px 22px no-repeat,
                linear-gradient(-135deg, var(--corner-color, #1e293b) 14%, transparent 14.5%) 100% 0 / 22px 22px no-repeat,
                linear-gradient(45deg, var(--corner-color, #1e293b) 14%, transparent 14.5%) 0 100% / 22px 22px no-repeat,
                linear-gradient(-45deg, var(--corner-color, #1e293b) 14%, transparent 14.5%) 100% 100% / 22px 22px no-repeat;
            z-index: 45;
            pointer-events: none;
        }

        /* Definición de colores para esquineros según marco */
        .frame-common { --corner-color: #64748b; border: 3px solid #64748b; }
        .frame-uncommon { --corner-color: #10b981; border: 4px solid #10b981; }
        .frame-rare { --corner-color: #22d3ee; border: 5px solid #22d3ee; box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .frame-holo { --corner-color: #a855f7; border: 8px solid transparent; background: linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)) padding-box, conic-gradient(from var(--angle), #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) border-box; animation: rotate-angle 4s linear infinite; }
        .frame-gold { --corner-color: #fbbf24; border: 8px solid transparent; background: linear-gradient(rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.9)) padding-box, radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.8) 0%, transparent 50%) border-box, linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24) border-box; background-size: 100% 100%, 200% 200%, 300% 300%; animation: holo-border 3s linear infinite; box-shadow: inset 0 0 12px rgba(251, 191, 36, 0.8); position: relative; }
        
        .sticker-stuck { width: 100%; height: 100%; object-fit: cover; }
        .gold-filter { filter: sepia(1) saturate(5) hue-rotate(10deg) brightness(0.8) contrast(1.2); }
        
        .gold-aura { position: absolute; inset: 0; background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%); z-index: 15; animation: aura-pulse 3s infinite alternate; pointer-events: none; }
        @keyframes aura-pulse { 0% { opacity: 0.2; transform: scale(0.95); } 100% { opacity: 0.5; transform: scale(1.05); } }
        .overlay-holo { position: absolute; inset: 0; z-index: 20; mix-blend-mode: screen; background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 24px 24px; animation: sparkles 4s linear infinite; opacity: 0.6; pointer-events: none; }
        @keyframes sparkles { 0% { background-position: 0 0; opacity: 0.3; } 50% { opacity: 0.8; } 100% { background-position: 48px 48px; opacity: 0.3; } }
        .overlay-gold { position: absolute; inset: 0; z-index: 20; mix-blend-mode: overlay; background: linear-gradient(135deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 215, 0, 0.4) 100%); pointer-events: none; }
        .gold-sweep { position: absolute; top: -100%; left: -100%; width: 300%; height: 300%; background: linear-gradient(110deg, transparent 45%, rgba(251, 191, 36, 0.3) 48%, rgba(255, 255, 255, 0.8) 50%, rgba(251, 191, 36, 0.3) 52%, transparent 55%); animation: sweep-diagonal 3s infinite linear; z-index: 25; pointer-events: none; mix-blend-mode: color-dodge; }
        @keyframes sweep-diagonal { 0% { transform: translate(-20%, -20%); } 100% { transform: translate(20%, 20%); } }
        .overlay-rare { position: absolute; inset: 0; z-index: 20; mix-blend-mode: overlay; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%); background-size: 200% 100%; animation: sweep-special 2.5s infinite ease-in-out; pointer-events: none; }
        @keyframes sweep-special { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        .animate-stick { animation: stick-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; z-index: 100; }
        @keyframes stick-pop { 0% { transform: scale(2) rotate(15deg); opacity: 0; filter: brightness(2); } 100% { transform: scale(1) rotate(var(--rotation, 0deg)); opacity: 1; filter: brightness(1); } }
        .long-press-feedback { animation: pulse-select 0.3s ease-out forwards; }
        @keyframes pulse-select { 0% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.1); filter: brightness(1.3); } 100% { transform: scale(1.05); filter: brightness(1.1); } }

        .inventory-tray { height: 180px; background: rgba(11, 17, 32, 0.85); backdrop-filter: blur(10px); border-top: 3px solid var(--gold); padding: 12px; z-index: 1000; flex-shrink: 0; box-shadow: 0 -10px 30px rgba(0,0,0,0.5); }
        .loose-container { display: flex; gap: 12px; overflow-x: auto; padding: 10px 5px; align-items: center; }
        .loose-card { flex: 0 0 80px; aspect-ratio: 3/4; position: relative; transition: transform 0.2s; cursor: grab; touch-action: pan-x; }
        .loose-tag { position: absolute; top: -6px; left: -6px; background: #22d3ee; color: #000; font-size: 9px; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 50; border: 2px solid #0f172a; }

        .modal-blur { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(20px); z-index: 5000; display: none; align-items: center; justify-content: center; }
        .modal-blur.active { display: flex; }
        #modal-sticker-body { border-radius: 0 !important; }
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotate-angle { to { --angle: 360deg; } }
        @keyframes holo-border { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
    </style>
</head>
<body>
    <a href="<?php echo $backUrl; ?>" class="back-btn-floating hidden">⬅</a>
    <div id="toast" style="position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:6000; display:none; padding:12px 24px; border-radius:30px; background:white; color:black; font-weight:900; font-size:12px; box-shadow:0 8px 20px rgba(0,0,0,0.3);"></div>

    <div id="modal-detail" class="modal-blur" onclick="closeDetail()">
        <div class="flex flex-col items-center max-w-[95%] w-[350px] p-4" onclick="event.stopPropagation()">
            <div id="modal-sticker-container" class="w-full aspect-[3/4] mb-6">
                <div id="modal-sticker-body" class="sticker-body">
                    <div class="sticker-content">
                        <div id="modal-aura-container"></div>
                        <div id="modal-overlay-container"></div>
                        <div id="modal-sweep-container"></div>
                        <img id="modal-img" src="" class="w-full h-full object-cover">
                    </div>
                </div>
            </div>
            <div class="bg-slate-900/90 backdrop-blur-md p-6 rounded-[2.5rem] text-center border border-white/10 w-full shadow-2xl">
                <p id="modal-number" class="text-cyan-400 font-black text-[10px] uppercase tracking-widest mb-1"></p>
                <h3 id="modal-name" class="text-2xl font-black italic uppercase text-white mb-3"></h3>
                <div class="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4"></div>
                <p id="modal-description" class="text-gray-400 text-xs italic leading-relaxed mb-6 px-2"></p>
                <button onclick="closeDetail()" class="w-full py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Cerrar</button>
            </div>
        </div>
    </div>

    <header class="p-4 flex items-center justify-between">
        <a href="<?php echo $backUrl; ?>" class="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-xl hover:bg-white/10 transition-all">⬅</a>
        <h1 class="text-sm font-black italic uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Álbum Premium Técnica 32</h1>
        <div class="w-10"></div>
    </header>

    <?php include 'book.php'; ?>
    <?php include 'inventario.php'; ?>

    <?php renderGlobalAssets($pdo); ?>

    <div id="floating-sticker" style="position: fixed; pointer-events: none; z-index: 9999; display: none;"></div>

    <script>
        let pageFlip, isModalActive = false, longPressTimer, isSticking = false, activeSlot = null;
        let dragInfo = { active: false, el: null, lastX: 0, lastY: 0, velocityX: 0, data: {}, startX: 0, startY: 0, isScrolling: false, pending: false };

        // INICIO ULTRA RÁPIDO: No esperar a window.onload
        document.addEventListener('DOMContentLoaded', function() {
            const albumEl = document.getElementById('album-book');
            const containerEl = document.querySelector('.album-container');
            const isMobile = window.innerWidth <= 768;

            // Inicializar el libro
            pageFlip = new St.PageFlip(albumEl, { 
                width: 450, height: 600, size: "stretch", 
                minWidth: isMobile ? 280 : 320, maxWidth: 1000, 
                minHeight: isMobile ? 350 : 420, maxHeight: 1300, 
                showCover: true, usePortrait: isMobile, drawShadow: true, 
                flippingTime: 800, mobileScrollSupport: false, clickEventForward: false 
            });

            // Cargar contenido inmediatamente
            pageFlip.loadFromHTML(document.querySelectorAll('.page'));
            
            // Mostrar el contenedor con un fade suave
            containerEl.classList.add('loaded');
            
            if(isMobile) setTimeout(() => pageFlip.updateFromHtml(document.querySelectorAll('.page')), 300);
            
            // Inicializar efectos secundarios
            document.querySelectorAll('.sticker-body').forEach(initReflectionsOnly);
            
            const looseList = document.getElementById('loose-list');
            if (looseList) {
                looseList.addEventListener('wheel', (e) => { 
                    if (e.deltaY !== 0) { e.preventDefault(); looseList.scrollLeft += e.deltaY; } 
                }, { passive: false });
            }
        });

        window.addEventListener('pointermove', handleCustomMove);
        window.addEventListener('pointerup', handleCustomEnd);
        window.addEventListener('touchend', handleCustomEnd, { passive: false }); 
        window.addEventListener('touchcancel', handleCustomEnd, { passive: false });
        window.addEventListener('touchmove', (e) => { if (dragInfo.active || dragInfo.pending) { handleCustomMove(e.touches[0]); if (dragInfo.active && e.cancelable) e.preventDefault(); } }, { passive: false });

        function initReflectionsOnly(el) {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100, y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--mouse-x', `${x}%`); el.style.setProperty('--mouse-y', `${y}%`);
            });
            el.addEventListener('mouseleave', () => { el.style.setProperty('--mouse-x', '50%'); el.style.setProperty('--mouse-y', '50%'); });
        }

        function startCustomDrag(e, card) {
            if (isModalActive || isSticking) return;
            const x = e.clientX || (e.touches ? e.touches[0].clientX : 0), y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            dragInfo = { 
                ...dragInfo, 
                startX: x, startY: y, lastX: x, lastY: y, 
                isScrolling: false, el: card, 
                data: { 
                    id: card.dataset.id, 
                    num: card.dataset.number, 
                    rarity: card.dataset.rarity, 
                    name: card.dataset.name,
                    description: card.dataset.description,
                    img: card.querySelector('img').src 
                }, 
                pending: true 
            };
            clearTimeout(longPressTimer);
            if (e.pointerType === 'touch' || e.type.startsWith('touch')) {
                longPressTimer = setTimeout(() => { if (dragInfo.pending && !dragInfo.isScrolling) { if (navigator.vibrate) navigator.vibrate(60); activateDrag(x, y); } }, 350);
            } else activateDrag(x, y);
        }

        function activateDrag(x, y) {
            dragInfo.active = true; dragInfo.pending = false; dragInfo.el.classList.add('long-press-feedback');
            const floating = document.getElementById('floating-sticker');
            floating.innerHTML = `<div class="sticker-body frame-${dragInfo.data.rarity}" style="width:100px; height:133px; box-shadow: 0 30px 70px rgba(0,0,0,0.7);"><div class="sticker-content"><img src="${dragInfo.data.img}" class="sticker-stuck"></div></div>`;
            floating.style.display = 'block'; updateFloatingPos(x, y);
            dragInfo.el.style.opacity = "0.2"; dragInfo.el.style.transform = "scale(0.8)";
        }

        function handleCustomMove(e) {
            const x = e.clientX, y = e.clientY;
            if (dragInfo.pending) {
                const dx = Math.abs(x - dragInfo.startX), dy = Math.abs(y - dragInfo.startY);
                if (dx > 10 || dy > 10) { clearTimeout(longPressTimer); if (dx > dy) { dragInfo.isScrolling = true; dragInfo.pending = false; } else if (dy > 15) activateDrag(x, y); }
                return;
            }
            if (!dragInfo.active) return;
            dragInfo.velocityX = x - dragInfo.lastX; dragInfo.lastX = x; dragInfo.lastY = y;
            updateFloatingPos(x, y);
            const slots = document.querySelectorAll('.slot'); let foundSlot = null;
            for (const slot of slots) {
                const r = slot.getBoundingClientRect();
                if (x >= r.left-30 && x <= r.right+30 && y >= r.top-30 && y <= r.bottom+30) { foundSlot = slot; break; }
            }
            if (foundSlot && String(foundSlot.dataset.number) === String(dragInfo.data.num)) {
                if (activeSlot !== foundSlot) { if (activeSlot) resetSlotStyles(activeSlot); activeSlot = foundSlot; highlightSlot(activeSlot); }
            } else if (activeSlot) { resetSlotStyles(activeSlot); activeSlot = null; }
        }

        function highlightSlot(s) { s.style.backgroundColor = "rgba(34, 211, 238, 0.4)"; s.style.borderColor = "#22d3ee"; s.style.boxShadow = "0 0 25px rgba(34, 211, 238, 0.7)"; s.style.transform = "scale(1.08)"; }
        function resetSlotStyles(s) { s.style.backgroundColor = ""; s.style.borderColor = ""; s.style.boxShadow = ""; s.style.transform = ""; }

        async function handleCustomEnd() {
            clearTimeout(longPressTimer); if (isSticking || (!dragInfo.active && !dragInfo.pending)) return;
            const wasActive = dragInfo.active, targetSlot = activeSlot, figuData = { ...dragInfo.data }, originalEl = dragInfo.el;
            const floating = document.getElementById('floating-sticker');
            if (floating) floating.style.display = 'none';
            if (activeSlot) resetSlotStyles(activeSlot);
            if (originalEl) { 
                originalEl.classList.remove('long-press-feedback');
                if (!targetSlot || String(targetSlot.dataset.number) !== String(figuData.num)) { originalEl.style.opacity = "1"; originalEl.style.transform = "scale(1)"; }
            }
            dragInfo.active = false; dragInfo.pending = false; activeSlot = null;
            if (wasActive && targetSlot && String(targetSlot.dataset.number) === String(figuData.num)) {
                isSticking = true; await performStickWithData(targetSlot, figuData, originalEl); isSticking = false;
            } else if (wasActive && targetSlot) showToast("❌ LUGAR INCORRECTO");
        }

        async function performStickWithData(slot, figuData, originalEl) {
            const fd = new FormData(); fd.append('sticker_id', figuData.id);
            try {
                const res = await fetch('api/stick_sticker.php', { 
                    method: 'POST', 
                    body: fd, 
                    headers: { 'X-Requested-With': 'XMLHttpRequest' } 
                });

                const text = await res.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error("Error parseando JSON. Respuesta del servidor:", text);
                    throw new Error("Respuesta no válida del servidor");
                }

                if (data.success) {
                    const rot = (Math.random() * 6) - 3;
                    const { rarity, num, img, name, description } = figuData;
                    const isGold = rarity === 'gold';
                    const hasOverlay = (rarity === 'holo' || rarity === 'gold' || rarity === 'rare');
                    
                    // Creamos el objeto de datos para el click igual al que viene de la DB
                    const stData = JSON.stringify({ name, number: num, rarity, description });
                    
                    slot.innerHTML = `<div class="sticker-body frame-${rarity} animate-stick" data-rotation="${rot}" style="--rotation: ${rot}deg; transform: rotateZ(${rot}deg)" onclick='handleCardClick(event, ${stData}, "${img}")'>
                        <div class="sticker-content">
                            ${isGold ? '<div class="gold-aura"></div>' : ''}
                            ${hasOverlay ? `<div class="overlay-${rarity}"></div>` : ''}
                            ${isGold ? '<div class="gold-sweep"></div>' : ''}
                            <img src="${img}" class="sticker-stuck ${isGold ? 'gold-filter' : ''}">
                        </div>
                    </div>`;
                    initParallax(slot.querySelector('.sticker-body')); 
                    if (originalEl) originalEl.remove(); 
                    showToast("✨ ¡PEGADA!");
                    if(data.data && data.data.album_completed) setTimeout(() => location.reload(), 1500);
                } else { 
                    showToast("❌ " + data.message); 
                    if (originalEl) { originalEl.style.opacity = "1"; originalEl.style.transform = "scale(1)"; }
                }
            } catch (err) { 
                console.error("Error de red/servidor:", err);
                showToast("❌ ERROR: " + err.message); 
                if (originalEl) { originalEl.style.opacity = "1"; originalEl.style.transform = "scale(1)"; }
            }
        }

        function initParallax(el) {
            const baseRot = parseFloat(el.dataset.rotation || 0);
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
                el.style.transform = `rotateY(${dx / 8}deg) rotateX(${-dy / 8}deg) rotateZ(${baseRot}deg)`;
                el.style.setProperty('--mouse-x', `${((e.clientX - r.left) / r.width) * 100}%`);
                el.style.setProperty('--mouse-y', `${((e.clientY - r.top) / r.height) * 100}%`);
            });
            el.addEventListener('mouseleave', () => { el.style.transform = `rotateY(0deg) rotateX(0deg) rotateZ(${baseRot}deg)`; el.style.setProperty('--mouse-x', '50%'); el.style.setProperty('--mouse-y', '50%'); });
        }

        function handleCardClick(e, d, u) { e.stopPropagation(); openDetail(d, u); }
        function showToast(m) { const t = document.getElementById('toast'); t.textContent = m; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 3000); }
        function updateFloatingPos(x, y) {
            const f = document.getElementById('floating-sticker');
            const tilt = Math.max(Math.min(dragInfo.velocityX * 1.8, 30), -30);
            f.style.left = `${x - 50}px`; f.style.top = `${y - 65}px`;
            f.style.transform = `rotate(${tilt + (Math.sin(Date.now() / 200) * 2)}deg) scale(1.2) translateY(-10px)`;
            f.style.filter = `drop-shadow(${dragInfo.velocityX * -0.5}px 25px 40px rgba(0,0,0,0.5))`;
        }
        function openDetail(c, u) { 
            isModalActive = true; 
            const body = document.getElementById('modal-sticker-body');
            const aura = document.getElementById('modal-aura-container');
            const overlay = document.getElementById('modal-overlay-container');
            const sweep = document.getElementById('modal-sweep-container');
            const img = document.getElementById('modal-img');
            
            // Limpiar estados previos
            body.className = 'sticker-body';
            aura.innerHTML = '';
            overlay.innerHTML = '';
            sweep.innerHTML = '';
            img.classList.remove('gold-filter');

            // Aplicar Rareza y Efectos
            const rarity = c.rarity || 'common';
            body.classList.add('frame-' + rarity);
            
            if(rarity === 'gold') {
                aura.innerHTML = '<div class="gold-aura"></div>';
                sweep.innerHTML = '<div class="gold-sweep"></div>';
                img.classList.add('gold-filter');
            }
            if(rarity === 'holo' || rarity === 'gold' || rarity === 'rare') {
                overlay.innerHTML = `<div class="overlay-${rarity}"></div>`;
            }

            document.getElementById('modal-img').src = u; 
            document.getElementById('modal-name').textContent = c.name || 'Figurita'; 
            document.getElementById('modal-number').textContent = `Nº ${c.number}`; 
            document.getElementById('modal-description').textContent = c.description || 'Esta figurita forma parte de la colección oficial del Álbum 32.';
            document.getElementById('modal-detail').classList.add('active'); 
            
            // Re-inicializar efectos de mouse para el modal para que brille al mover el mouse
            initReflectionsOnly(body);
        }
        function closeDetail() { document.getElementById('modal-detail').classList.remove('active'); setTimeout(() => { isModalActive = false; }, 200); }
    </script>
</body>
</html>
