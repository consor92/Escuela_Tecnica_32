<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';
requireLogin();

$user = getCurrentUser($pdo);

// 1. Obtener todas las figuritas base
$stmtAll = $pdo->query("SELECT * FROM stickers ORDER BY number ASC");
$allStickers = $stmtAll->fetchAll();

// 2. Inventario Completo
$stmtInv = $pdo->prepare("
    SELECT s.*, i.is_stuck, i.quantity 
    FROM stickers s
    LEFT JOIN user_inventory i ON s.id = i.sticker_id AND i.user_id = ?
");
$stmtInv->execute([$_SESSION['user_id']]);
$userInv = $stmtInv->fetchAll(PDO::FETCH_GROUP | PDO::FETCH_UNIQUE);

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
    ['range' => [2, 5], 'type' => '2x2', 'names' => ['PARTE 1', 'PARTE 2', 'PARTE 3', 'PARTE 4']],
    ['range' => [12, 13], 'type' => '1x2', 'names' => ['PARTE 1', 'PARTE 2']],
    ['range' => [25, 26], 'type' => '1x2', 'names' => ['PARTE 1', 'PARTE 2']],
    ['range' => [44, 47], 'type' => '2x2', 'names' => ['PARTE 1', 'PARTE 2', 'PARTE 3', 'PARTE 4']]
];

/**
 * LÓGICA DE PÁGINAS
 */
$stk1 = null;
$stk50 = null;
$others = [];
foreach ($allStickers as $s) {
    if ($s['number'] == 1) $stk1 = $s;
    else if ($s['number'] == 50) $stk50 = $s;
    else if ($s['number'] < 50) $others[] = $s;
}

$pages = [];
// Portada
$pages[] = ['type' => 'cover', 'title' => 'ÁLBUM OFICIAL', 'subtitle' => 'TÉCNICA 32 - 2026'];
// Especial 1
if ($stk1) $pages[] = ['type' => 'honor', 'stickers' => [$stk1], 'title' => 'SALÓN DE HONOR'];

// Regulares
$remaining = $others;
while (!empty($remaining)) {
    $currentPageStickers = [];
    $limit = 4;
    
    // Balanceo de slots: La hoja 6 toma 6 para que de la 7 a la 12 tengan exactamente 4.
    $pIdx = count($pages);
    if ($pIdx == 6) {
        $limit = 6;
    } elseif (count($remaining) <= 6 && count($remaining) > 4 && $pIdx != 12) {
        // Evitamos que la hoja 12 absorba figuritas extra para cumplir el pedido de 4 por hoja.
        $limit = 6;
    }

    $count = 0;
    while ($count < $limit && !empty($remaining)) {
        $next = $remaining[0];
        $mosaic = null;
        foreach ($mosaics as $m) {
            if ($next['number'] >= $m['range'][0] && $next['number'] <= $m['range'][1]) {
                $mosaic = $m; break;
            }
        }
        if ($mosaic) {
            $mSize = ($mosaic['range'][1] - $mosaic['range'][0]) + 1;
            if ($count + $mSize <= $limit) {
                $slice = array_splice($remaining, 0, $mSize);
                foreach ($slice as $s) { $currentPageStickers[] = $s; $count++; }
            } else break;
        } else {
            $currentPageStickers[] = array_shift($remaining);
            $count++;
        }
    }
    if (!empty($currentPageStickers)) $pages[] = ['type' => 'regular', 'stickers' => $currentPageStickers, 'title' => 'COLECCIÓN TÉCNICA'];
}

// Especial 50 (Igual estética que la 1)
if ($stk50) $pages[] = ['type' => 'honor', 'stickers' => [$stk50], 'title' => 'LEYENDA FINAL'];

// Contraportada
$pages[] = ['type' => 'back-cover', 'title' => 'FIN'];

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Álbum Premium 32</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;900&family=Bebas+Neue&display=swap" rel="stylesheet">
    <style>
        :root { 
            --gold: #fbbf24; --paper: #fdf6e3; --bg: #0f172a; --leather: #452c1e; 
            --rarity-common: #94a3b8; --rarity-uncommon: #10b981; --rarity-rare: #3b82f6; --rarity-holo: #a855f7;
        }
        
        body { background: var(--bg); color: white; font-family: 'Outfit', sans-serif; height: 100vh; overflow: hidden; display: flex; flex-direction: column; margin: 0; }
        
        .album-container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px 0; overflow: hidden; position: relative; }
        
        /* Contenedor del libro sólido */
        #album-book { background: transparent; opacity: 1; }
        #album-book:not(.ready) { visibility: hidden; }

        /* FIX: Estilos de página optimizados para visibilidad durante el flip */
        .page { 
            width: 500px; height: 700px; 
            background-color: var(--paper); 
            background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
            box-shadow: inset 0 0 50px rgba(0,0,0,0.05), 5px 0 15px rgba(0,0,0,0.1); 
            border: 1px solid rgba(0,0,0,0.1); 
            position: relative;
            overflow: hidden;
        }

        /* SOMBRA DEL LOMO (SPINE) */
        .page::after {
            content: ''; position: absolute; top: 0; width: 40px; height: 100%; z-index: 10;
            pointer-events: none;
        }
        .page:nth-child(odd)::after { /* Páginas derechas */
            left: 0; background: linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 100%);
        }
        .page:nth-child(even)::after { /* Páginas izquierdas */
            right: 0; background: linear-gradient(to left, rgba(0,0,0,0.15) 0%, transparent 100%);
        }
        
        /* Wrapper con espacio para numeración */
        .page-content-wrapper { 
            position: absolute; 
            top: 40px; left: 40px; right: 40px; bottom: 80px; 
            display: flex; flex-direction: column; justify-content: space-around; align-items: center; 
        }

        .page-cover { 
            background: linear-gradient(135deg, var(--leather) 0%, #2d1b0e 100%) !important; 
            background-image: url("https://www.transparenttextures.com/patterns/leather.png") !important;
            color: var(--gold) !important; border: 10px double #5d3a26 !important;
        }

        .sticker-grid { display: grid; width: 100%; flex: 1; align-content: center; justify-items: center; gap: 20px; }
        .grid-2x2 { grid-template-columns: repeat(2, 180px); justify-content: center; }
        .grid-3x2 { grid-template-columns: repeat(2, 180px); justify-content: center; }
        
        .slot { 
            background: rgba(0,0,0,0.05); 
            border: 2px dashed rgba(0,0,0,0.15); 
            box-shadow: inset 2px 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px; position: relative; width: 100%; aspect-ratio: 3/4; 
            display: flex; align-items: center; justify-content: center; 
            max-width: 180px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .slot.drag-over { background: rgba(34, 211, 238, 0.1); border-color: #22d3ee; transform: scale(1.02); }
        .slot span { font-size: 2rem; font-weight: 900; color: #1e293b; opacity: 0.15; font-family: 'Bebas Neue'; pointer-events: none; }

        /* ANIMACIÓN DE PEGADO CON ROTACIÓN VARIABLE */
        @keyframes stick-pop {
            0% { transform: scale(2) rotate(10deg); opacity: 0; filter: brightness(3) blur(5px); }
            70% { transform: scale(0.95) rotate(calc(var(--rotation, 0deg) - 2deg)); opacity: 1; filter: brightness(1.2) blur(0); }
            100% { transform: scale(1) rotate(var(--rotation, 0deg)); filter: brightness(1); }
        }
        .animate-stick { animation: stick-pop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; z-index: 100; }

        /* PARALLAX 3D + ROTACIÓN BASE */
        .sticker-body { 
            width: 100%; height: 100%; background: white; border-radius: 8px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.3); position: relative; 
            overflow: hidden; cursor: pointer;
            transition: transform 0.1s ease-out, box-shadow 0.2s;
            transform-style: preserve-3d;
            perspective: 1000px;
            transform: rotateZ(var(--rotation, 0deg));
        }
        .sticker-body:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 100; }
        .sticker-content { width: 100%; height: 100%; background: #0f172a; position: relative; overflow: hidden; pointer-events: none; transform: translateZ(20px); }
        
        .sticker-stuck { width: 100%; height: 100%; object-fit: cover; }

        .slot-rarity-common { border-color: rgba(148, 163, 184, 0.3); }
        .slot-rarity-uncommon { border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05); }
        .slot-rarity-rare { border-color: rgba(59, 130, 246, 0.4); background: rgba(59, 130, 246, 0.05); }
        .slot-rarity-holo { border-color: rgba(168, 85, 247, 0.5); background: rgba(168, 85, 247, 0.05); }
        .slot-rarity-gold { border-color: rgba(251, 191, 36, 0.6); background: rgba(251, 191, 36, 0.08); }

        .mosaic-container { display: grid; gap: 4px; grid-column: span 2; width: 100%; max-width: 380px; aspect-ratio: 3/4; border: 2px solid rgba(0,0,0,0.05); border-radius: 6px; overflow: visible; }
        .mosaic-2x2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
        .mosaic-1x2 { grid-template-columns: 1fr 1fr; aspect-ratio: 3/2; }
        .mosaic-container .slot { border-width: 1px; border-radius: 0; max-width: none; height: 100%; }

        .frame-common { border: 4px solid #64748b; }
        .frame-uncommon { border: 5px solid #10b981; }
        .frame-rare { border: 6px solid #22d3ee; box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .frame-holo { border: 8px solid transparent; background: linear-gradient(#0f172a, #0f172a) padding-box, conic-gradient(from var(--angle), #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) border-box; animation: rotate-angle 4s linear infinite; }
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotate-angle { to { --angle: 360deg; } }
        
        .frame-gold { 
            border: 8px solid transparent; 
            background: linear-gradient(#0f172a, #0f172a) padding-box, linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24) border-box; 
            background-size: 300% 300%; animation: holo-border 3s linear infinite; 
            box-shadow: 0 0 25px rgba(245, 158, 11, 0.5);
        }
        @keyframes holo-border { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

        /* EFECTOS SINCRO TOTAL SOBRES */
        .overlay-holo { 
            position: absolute; inset: 0; z-index: 20; mix-blend-mode: screen; 
            background-image: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.8) 0%, transparent 60%); 
            background-size: 100% 100%; opacity: 0.6; pointer-events: none;
        }
        .overlay-rare { position: absolute; inset: 0; z-index: 20; mix-blend-mode: overlay; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%); background-size: 200% 100%; animation: sweep-special 2.5s infinite ease-in-out; }
        .overlay-gold { 
            position: absolute; inset: 0; z-index: 20; mix-blend-mode: color-dodge; 
            background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 215, 0, 0.6) 0%, transparent 70%); 
            opacity: 0.7; pointer-events: none;
        }
        .gold-sweep { position: absolute; inset: -50%; z-index: 25; mix-blend-mode: color-dodge; background: linear-gradient(110deg, transparent 40%, #fff 50%, transparent 60%); animation: sweep 2s infinite linear; }
        .gold-filter { filter: sepia(1) saturate(5) hue-rotate(10deg) brightness(0.8) contrast(1.2); }

        @keyframes sparkles { 0% { background-position: 0 0; opacity: 0.3; } 50% { opacity: 0.8; } 100% { background-position: 48px 48px; opacity: 0.3; } }
        @keyframes sweep-special { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        @keyframes sweep { 0% { transform: translate(-10%, -10%); } 100% { transform: translate(10%, 10%); } }

        .slot-gold-active::after { 
            content: ''; position: absolute; inset: -15px; border-radius: 15px; background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%); z-index: -1; animation: gold-aura 3s infinite alternate; 
        }
        @keyframes gold-aura { 0% { opacity: 0.2; transform: scale(0.9); } 100% { opacity: 0.6; transform: scale(1.1); } }

        /* NUMERACIÓN POSICIONADA ABAJO */
        .page-number { position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; font-size: 11px; font-weight: 900; color: #1e293b; opacity: 0.5; font-family: 'Outfit', sans-serif; text-transform: uppercase; tracking-widest; pointer-events: none; z-index: 200; }

        /* INVENTARIO */
        .inventory-tray { height: 210px; background: #0f172a; border-top: 4px solid var(--gold); padding: 12px; display: flex; flex-direction: column; flex-shrink: 0; z-index: 1000; }
        .loose-container { flex: 1; display: flex; gap: 15px; overflow-x: auto; padding: 10px; align-items: center; scrollbar-width: none; }
        .loose-container::-webkit-scrollbar { display: none; }
        
        /* CORNER PEEL EFFECT EXAGERADO */
        .loose-card { 
            flex: 0 0 100px; aspect-ratio: 1/1; cursor: grab; position: relative; 
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            perspective: 600px;
        }
        .loose-card:hover { 
            transform: translateY(-25px) rotateX(20deg) scale(1.05); 
            z-index: 100;
        }
        .loose-card::before {
            content: ''; position: absolute; bottom: 0; right: 0; width: 0; height: 0;
            background: linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.5) 50%, rgba(0,0,0,0.2) 100%);
            z-index: 60; transition: all 0.3s ease-out; pointer-events: none; 
            border-radius: 0 0 8px 0;
            box-shadow: -2px -2px 5px rgba(0,0,0,0.3);
        }
        .loose-card:hover::before { 
            width: 45px; height: 45px; 
        }

        .loose-tag { position: absolute; top: -8px; left: -8px; background: #22d3ee; color: #020617; font-size: 10px; font-weight: 900; width: 22px; height: 22px; border-radius: 50%; display: flex; items-center; justify-content: center; border: 2px solid #020617; z-index: 50; }

        /* MODAL */
        .modal-blur { position: fixed; inset: 0; background: rgba(0,0,0,0.96); backdrop-filter: blur(25px); z-index: 5000; display: none; align-items: center; justify-content: center; cursor: zoom-out; }
        .modal-blur.active { display: flex; }
    </style>
</head>
<body>

    <div id="toast" style="position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:6000; display:none; padding:12px 24px; border-radius:12px; background:white; color:black; font-weight:900; box-shadow: 0 10px 20px rgba(0,0,0,0.3);"></div>

    <div id="modal-detail" class="modal-blur" onclick="closeDetail()">
        <div class="flex flex-col items-center max-w-sm w-full p-4" onclick="event.stopPropagation()">
            <div id="modal-sticker-container" style="width:280px; height:390px; margin-bottom: 25px;">
                <div id="modal-sticker-body" class="sticker-body">
                    <div class="sticker-content">
                        <div id="modal-overlay"></div>
                        <img id="modal-img" src="" class="w-full h-full object-cover">
                    </div>
                </div>
            </div>
            <div class="bg-white/5 p-6 rounded-3xl text-center border border-white/10 w-full">
                <p id="modal-number" class="text-cyan-400 font-bold text-xs mb-1"></p>
                <h3 id="modal-name" class="text-2xl font-black italic uppercase text-white mb-1"></h3>
                <div id="modal-rarity-tag" class="rarity-tag" style="display:inline-block; padding:4px 12px; border-radius:6px; font-size:10px; font-weight:900; text-transform:uppercase;"></div>
                <p id="modal-desc" class="text-gray-400 text-sm leading-relaxed italic mt-4 mb-4"></p>
                <button onclick="closeDetail()" class="px-8 py-2 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-widest">Cerrar</button>
            </div>
        </div>
    </div>

    <header class="p-3 flex items-center justify-between">
        <a href="dashboard.php" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase">⬅ VOLVER</a>
        <h1 class="text-xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Álbum Premium Técnica 32</h1>
        <div class="w-20"></div> <!-- Espaciador para centrar el título -->
    </header>

    <div class="album-container">
        <div id="album-book">
            <?php foreach ($pages as $pIdx => $pData): ?>
                <?php if ($pData['type'] === 'cover'): ?>
                    <div class="page page-cover" data-density="hard">
                        <div class="page-content-wrapper">
                            <h2 class="text-5xl font-black italic text-yellow-400 mb-2" style="font-family:'Bebas Neue'"><?php echo $pData['title']; ?></h2>
                            <p class="text-white/30 text-[10px] uppercase font-bold tracking-widest"><?php echo $pData['subtitle']; ?></p>
                        </div>
                    </div>
                <?php elseif ($pData['type'] === 'back-cover'): ?>
                    <div class="page page-cover" data-density="hard">
                        <div class="page-content-wrapper">
                            <h2 class="text-2xl font-black italic text-yellow-400/20" style="font-family:'Bebas Neue'">TÉCNICA 32</h2>
                            <p class="text-white/10 text-[8px] uppercase font-bold tracking-widest mt-10">2026</p>
                        </div>
                    </div>
                <?php else: 
                    $isHonor = $pData['type'] === 'honor';
                    $stks = $pData['stickers'] ?? [];
                    $gridClass = count($stks) > 4 ? 'grid-3x2' : 'grid-2x2';
                ?>
                    <div class="page <?php echo ($isHonor) ? 'page-cover' : ''; ?>" data-density="hard">
                        <div class="page-content-wrapper">
                            <h3 class="text-4xl font-black italic <?php echo ($isHonor) ? 'text-yellow-400' : 'text-slate-800'; ?> mb-6" style="font-family:'Bebas Neue'"><?php echo $pData['title']; ?></h3>
                            
                            <?php if ($isHonor): 
                                $st = $stks[0] ?? null;
                                if($st):
                                    $stuck = isset($userInv[$st['id']]) && $userInv[$st['id']]['is_stuck'] == 1;
                                    $imgUrl = "https://picsum.photos/seed/STK-".$st['id']."/300/400";
                                    $stData = htmlspecialchars(json_encode($st));
                                    $rarity = $st['rarity']; $isGold = $rarity === 'gold';
                                    // Rotación determinista para realismo
                                    $rot = (($st['id'] * 123) % 7) - 3; // Entre -3 y 3 grados
                                ?>
                                <div class="slot <?php echo $isGold ? 'slot-gold-active' : ''; ?> slot-rarity-<?php echo $rarity; ?> !max-w-[300px] !w-full" data-number="<?php echo $st['number']; ?>" ondragover="allowDrop(event)" ondrop="handleDrop(event)">
                                    <?php if($stuck): ?>
                                        <div class="sticker-body frame-<?php echo $rarity; ?>" data-rotation="<?php echo $rot; ?>" style="--rotation: <?php echo $rot; ?>deg; transform: rotateZ(<?php echo $rot; ?>deg)" onclick='handleCardClick(event, <?php echo $stData; ?>, "<?php echo $imgUrl; ?>")'>
                                            <div class="sticker-content">
                                                <div class="overlay-<?php echo $rarity; ?>"></div>
                                                <?php if($isGold): ?><div class="gold-sweep"></div><?php endif; ?>
                                                <img src="<?php echo $imgUrl; ?>" class="sticker-stuck <?php echo $isGold ? 'gold-filter' : ''; ?>">
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <span><?php echo $st['number']; ?></span>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>
                            
                            <?php else: ?>
                                <div class="sticker-grid <?php echo $gridClass; ?>">
                                    <?php 
                                    $i = 0;
                                    while ($i < count($stks)): 
                                        $st = $stks[$i];
                                        $mosaic = null;
                                        foreach($mosaics as $m) { if($st['number'] == $m['range'][0]) { $mosaic = $m; break; } }
                                        if($mosaic):
                                            $mSize = ($mosaic['range'][1] - $mosaic['range'][0]) + 1;
                                            ?>
                                            <div class="mosaic-container mosaic-<?php echo $mosaic['type']; ?>">
                                                <?php for($j=0; $j<$mSize; $j++): 
                                                    $mst = $stks[$i+$j];
                                                    $stuck = isset($userInv[$mst['id']]) && $userInv[$mst['id']]['is_stuck'] == 1;
                                                    $imgUrl = "https://picsum.photos/seed/STK-".$mst['id']."/300/300";
                                                    $mstData = htmlspecialchars(json_encode($mst));
                                                    $rarity = $mst['rarity']; $isGold = $rarity === 'gold';
                                                    $mrot = (($mst['id'] * 123) % 7) - 3;
                                                ?>
                                                    <div class="slot <?php echo $isGold ? 'slot-gold-active' : ''; ?> slot-rarity-<?php echo $rarity; ?>" data-number="<?php echo $mst['number']; ?>" ondragover="allowDrop(event)" ondrop="handleDrop(event)">
                                                        <?php if($stuck): ?>
                                                            <div class="sticker-body frame-<?php echo $rarity; ?>" data-rotation="<?php echo $mrot; ?>" style="--rotation: <?php echo $mrot; ?>deg; transform: rotateZ(<?php echo $mrot; ?>deg)" onclick='handleCardClick(event, <?php echo $mstData; ?>, "<?php echo $imgUrl; ?>")'>
                                                                <div class="sticker-content">
                                                                    <div class="overlay-<?php echo $rarity; ?>"></div>
                                                                    <?php if($isGold): ?><div class="gold-sweep"></div><?php endif; ?>
                                                                    <img src="<?php echo $imgUrl; ?>" class="sticker-stuck <?php echo $isGold ? 'gold-filter' : ''; ?>">
                                                                </div>
                                                            </div>
                                                        <?php else: ?>
                                                            <span><?php echo $mst['number']; ?></span>
                                                        <?php endif; ?>
                                                    </div>
                                                <?php endfor; ?>
                                            </div>
                                            <?php $i += $mSize;
                                        else:
                                            $stuck = isset($userInv[$st['id']]) && $userInv[$st['id']]['is_stuck'] == 1;
                                            $imgUrl = "https://picsum.photos/seed/STK-".$st['id']."/300/300";
                                            $stData = htmlspecialchars(json_encode($st));
                                            $rarity = $st['rarity']; $isGold = $rarity === 'gold';
                                            $srot = (($st['id'] * 123) % 7) - 3;
                                            ?>
                                            <div class="slot <?php echo $isGold ? 'slot-gold-active' : ''; ?> slot-rarity-<?php echo $rarity; ?>" data-number="<?php echo $st['number']; ?>" ondragover="allowDrop(event)" ondrop="handleDrop(event)">
                                                <?php if($stuck): ?>
                                                    <div class="sticker-body frame-<?php echo $rarity; ?>" data-rotation="<?php echo $srot; ?>" style="--rotation: <?php echo $srot; ?>deg; transform: rotateZ(<?php echo $srot; ?>deg)" onclick='handleCardClick(event, <?php echo $stData; ?>, "<?php echo $imgUrl; ?>")'>
                                                        <div class="sticker-content">
                                                            <div class="overlay-<?php echo $rarity; ?>"></div>
                                                            <?php if($isGold): ?><div class="gold-sweep"></div><?php endif; ?>
                                                            <img src="<?php echo $imgUrl; ?>" class="sticker-stuck <?php echo $isGold ? 'gold-filter' : ''; ?>">
                                                        </div>
                                                    </div>
                                                <?php else: ?>
                                                    <span><?php echo $st['number']; ?></span>
                                                <?php endif; ?>
                                            </div>
                                            <?php $i++;
                                        endif;
                                    endwhile; ?>
                                </div>
                            <?php endif; ?>
                        </div>
                        <div class="page-number">PÁGINA <?php echo $pIdx; ?></div>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
    </div>

    <section class="inventory-tray">
        <div class="flex justify-between items-center mb-1 px-2">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-cyan-400">Figuritas Disponibles</h3>
            <span class="text-[9px] text-gray-500 font-bold"><?php echo count($looseStickers); ?> DISPONIBLES</span>
        </div>
        <div class="loose-container" id="loose-list">
            <?php foreach ($looseStickers as $loose): 
                $imgUrl = "https://picsum.photos/seed/STK-".$loose['id']."/300/400";
                $rarity = $loose['rarity']; $isGold = $rarity === 'gold';
            ?>
                <div class="loose-card" onpointerdown="startCustomDrag(event, this)" data-id="<?php echo $loose['id']; ?>" data-number="<?php echo $loose['number']; ?>" data-rarity="<?php echo $loose['rarity']; ?>" id="item-<?php echo $loose['id']; ?>">
                    <div class="loose-tag"><?php echo $loose['number']; ?></div>
                    <div class="sticker-body frame-<?php echo $rarity; ?>" style="padding:0; width:100%; height:100%;">
                        <div class="sticker-content">
                            <div class="overlay-<?php echo $rarity; ?>"></div>
                            <?php if($isGold): ?><div class="gold-sweep"></div><?php endif; ?>
                            <img src="<?php echo $imgUrl; ?>" style="width:100%; height:100%; object-fit:cover;" class="<?php echo $isGold ? 'gold-filter' : ''; ?>">
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </section>

    <!-- FIGURITA FLOTANTE PARA EL DRAG -->
    <div id="floating-sticker" style="position: fixed; pointer-events: none; z-index: 9999; display: none; transition: transform 0.1s ease-out;"></div>

    <script>
        let pageFlip;
        let isModalActive = false;

        // ESTADO DEL DRAG PERSONALIZADO
        let dragInfo = {
            active: false,
            el: null,
            startX: 0, startY: 0,
            lastX: 0, velocityX: 0,
            data: {}
        };

        window.onload = function() {
            const albumEl = document.getElementById('album-book');
            pageFlip = new St.PageFlip(albumEl, {
                width: 500, height: 700, size: "fixed", 
                showCover: true, flippingTime: 1000, startPage: 0,
                drawShadow: true, maxShadowOpacity: 0.5,
                usePortrait: false, 
                mobileScrollSupport: false,
                clickEventForward: false,
                swipeDistance: 50
            });
            pageFlip.loadFromHTML(document.querySelectorAll('.page'));
            albumEl.classList.add('ready');

            document.addEventListener('mousedown', (e) => { 
                if(isModalActive) {
                    const modal = document.getElementById('modal-detail');
                    if(modal.contains(e.target)) e.stopPropagation();
                }
            }, true);
            
            // Listeners globales para el drag
            window.addEventListener('pointermove', handleCustomMove);
            window.addEventListener('pointerup', handleCustomEnd);
        };

        function startCustomDrag(e, card) {
            if (isModalActive) return;
            e.preventDefault();
            
            dragInfo.active = true;
            dragInfo.el = card;
            dragInfo.data = {
                id: card.dataset.id,
                num: card.dataset.number,
                rarity: card.dataset.rarity,
                img: card.querySelector('img').src
            };
            
            // Preparar el flotante
            const floating = document.getElementById('floating-sticker');
            const isGold = dragInfo.data.rarity === 'gold';
            
            floating.innerHTML = `
                <div class="sticker-body frame-${dragInfo.data.rarity}" style="width:120px; height:160px; box-shadow: 0 30px 60px rgba(0,0,0,0.5);">
                    <div class="sticker-content">
                        <div class="overlay-${dragInfo.data.rarity}"></div>
                        ${isGold ? '<div class="gold-sweep"></div>' : ''}
                        <img src="${dragInfo.data.img}" style="width:100%; height:100%; object-fit:cover;" class="${isGold ? 'gold-filter' : ''}">
                    </div>
                </div>
            `;
            
            floating.style.display = 'block';
            updateFloatingPos(e.clientX, e.clientY);
            
            card.style.opacity = "0.3";
            card.style.transform = "scale(0.8)";
        }

        function handleCustomMove(e) {
            if (!dragInfo.active) return;
            
            // Calcular velocidad para el tilt
            dragInfo.velocityX = e.clientX - dragInfo.lastX;
            dragInfo.lastX = e.clientX;
            
            updateFloatingPos(e.clientX, e.clientY);
            
            // Feedback de drop en los slots
            const target = document.elementFromPoint(e.clientX, e.clientY);
            const slot = target ? target.closest('.slot') : null;
            
            document.querySelectorAll('.slot.drag-over').forEach(s => s.classList.remove('drag-over'));
            if (slot && slot.dataset.number === dragInfo.data.num) {
                slot.classList.add('drag-over');
            }
        }

        function updateFloatingPos(x, y) {
            const floating = document.getElementById('floating-sticker');
            // Tilt dinámico basado en velocidad
            const tilt = Math.max(Math.min(dragInfo.velocityX * 0.8, 15), -15);
            floating.style.left = `${x - 60}px`;
            floating.style.top = `${y - 80}px`;
            floating.style.transform = `rotate(${tilt}deg) scale(1.1)`;
        }

        async function handleCustomEnd(e) {
            if (!dragInfo.active) return;
            
            const floating = document.getElementById('floating-sticker');
            const card = dragInfo.el;
            
            const target = document.elementFromPoint(e.clientX, e.clientY);
            const slot = target ? target.closest('.slot') : null;
            
            if (slot && slot.dataset.number === dragInfo.data.num) {
                // Proceder con el pegado
                await performStick(slot);
            } else {
                // Cancelar
                if (slot) showToast("❌ LUGAR INCORRECTO");
                card.style.opacity = "1";
                card.style.transform = "scale(1)";
            }
            
            dragInfo.active = false;
            floating.style.display = 'none';
            document.querySelectorAll('.slot.drag-over').forEach(s => s.classList.remove('drag-over'));
        }

        async function performStick(slot) {
            const fd = new FormData(); 
            fd.append('sticker_id', dragInfo.data.id);
            
            try {
                const res = await fetch('api/stick_sticker.php', { method: 'POST', body: fd });
                const data = await res.json();
                
                if (data.success) {
                    const rarity = dragInfo.data.rarity;
                    const isGold = rarity === 'gold';
                    const num = dragInfo.data.num;
                    const imgSrc = dragInfo.data.img;
                    
                    // Generar rotación aleatoria para el nuevo pegado
                    const rot = (Math.random() * 6) - 3;
                    
                    slot.innerHTML = `
                        <div class="sticker-body frame-${rarity} animate-stick" data-rotation="${rot}" style="--rotation: ${rot}deg; transform: rotateZ(${rot}deg)" onclick='handleCardClick(event, {name:"Figurita", number:${num}, rarity:"${rarity}"}, "${imgSrc}")'>
                            <div class="sticker-content">
                                <div class="overlay-${rarity}"></div>
                                ${isGold ? '<div class="gold-sweep"></div>' : ''}
                                <img src="${imgSrc}" class="sticker-stuck ${isGold ? 'gold-filter' : ''}">
                            </div>
                        </div>`;
                    
                    initParallax(slot.querySelector('.sticker-body'));
                    dragInfo.el.remove(); 
                    showToast("✨ ¡PEGADA!");
                    if(data.data.album_completed) setTimeout(() => location.reload(), 1500);
                } else { 
                    showToast("❌ " + data.message); 
                    dragInfo.el.style.opacity = "1";
                    dragInfo.el.style.transform = "scale(1)";
                }
            } catch (err) { 
                showToast("❌ ERROR DE RED"); 
                dragInfo.el.style.opacity = "1";
                dragInfo.el.style.transform = "scale(1)";
            }
        }

        function handleCardClick(e, data, url) {
            e.stopPropagation();
            openDetail(data, url);
        }

        const tray = document.getElementById('loose-list');
        tray.addEventListener('wheel', (e) => { if (e.deltaY !== 0) { e.preventDefault(); tray.scrollLeft += e.deltaY; } });

        function showToast(msg) {
            const t = document.getElementById('toast');
            t.textContent = msg; t.style.display = 'block';
            setTimeout(() => t.style.display = 'none', 3000);
        }

        function openDetail(card, imgUrl) {
            isModalActive = true;
            const modal = document.getElementById('modal-detail');
            const overlay = document.getElementById('modal-overlay');
            const stickerContent = document.querySelector('#modal-sticker-body .sticker-content');
            const img = document.getElementById('modal-img');
            const tag = document.getElementById('modal-rarity-tag');
            
            const oldSweep = stickerContent.querySelector('.gold-sweep');
            if(oldSweep) oldSweep.remove();

            img.src = imgUrl;
            document.getElementById('modal-name').textContent = card.name;
            document.getElementById('modal-number').textContent = `Nº ${card.number}`;
            document.getElementById('modal-desc').textContent = card.description || 'Una pieza histórica única.';
            
            tag.textContent = card.rarity;
            tag.className = `rarity-tag tag-${card.rarity}`;
            
            document.getElementById('modal-sticker-body').className = `sticker-body frame-${card.rarity}`;
            overlay.className = `overlay-${card.rarity}`;
            
            if(card.rarity === 'gold') {
                img.classList.add('gold-filter');
                const sweep = document.createElement('div');
                sweep.className = "gold-sweep";
                stickerContent.appendChild(sweep);
            } else {
                img.classList.remove('gold-filter');
            }
            
            modal.classList.add('active');
        }

        function closeDetail() { 
            document.getElementById('modal-detail').classList.remove('active'); 
            setTimeout(() => { isModalActive = false; }, 200);
        }

        // ELIMINAR LOS VIEJOS HANDLERS HTML5
        function allowDrop(e) { e.preventDefault(); }

        // LÓGICA PARALLAX 3D + REFLEJOS DINÁMICOS + ROTACIÓN BASE
        function initParallax(el) {
            const baseRot = parseFloat(el.dataset.rotation || 0);
            
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = x - xc;
                const dy = y - yc;
                
                // Parallax 3D + Mantener rotación del pegado (Z)
                el.style.transform = `rotateY(${dx / 10}deg) rotateX(${-dy / 10}deg) rotateZ(${baseRot}deg)`;
                
                // Reflejos Dinámicos (CSS Variables)
                const px = (x / rect.width) * 100;
                const py = (y / rect.height) * 100;
                el.style.setProperty('--mouse-x', `${px}%`);
                el.style.setProperty('--mouse-y', `${py}%`);
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = `rotateY(0deg) rotateX(0deg) rotateZ(${baseRot}deg)`;
                el.style.setProperty('--mouse-x', `50%`);
                el.style.setProperty('--mouse-y', `50%`);
            });
        }

        // Inicializar todas las pegadas al cargar
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.sticker-body').forEach(initParallax);
        });
    </script>
</body>
</html>
