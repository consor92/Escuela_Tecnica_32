<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';
requireLogin();

$user = getCurrentUser($pdo);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Apertura de Sobres - Álbum 32</title>
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

        /* Contenedor compacto para el sobre */
        .pack-center-container {
            width: 280px; 
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            position: relative;
        }

        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.08); }

        #flash { position: fixed; inset: 0; background: white; z-index: 500; pointer-events: none; opacity: 0; }
        .flash-anim { animation: flash-out 0.6s ease-out forwards; }
        @keyframes flash-out { 0% { opacity: 1; } 100% { opacity: 0; } }

        /* MODAL */
        .modal-blur { position: fixed; inset: 0; background: rgba(0,0,0,0.96); backdrop-filter: blur(25px); z-index: 5000; display: none; align-items: center; justify-content: center; cursor: zoom-out; }
        .modal-blur.active { display: flex; }
        
        /* --- UI SOBRE --- */
        .pack-wrapper { position: relative; display: block; cursor: pointer; padding: 10px; overflow: visible; }
        .booster-pack {
            width: 200px; height: 300px;
            background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%);
            border-radius: 12px; position: relative;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid rgba(255,255,255,0.3);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            overflow: visible;
        }
        
        .pack-counter {
            position: absolute; top: -15px; right: -15px; 
            background: white; color: #020617; 
            width: 45px; height: 45px; border-radius: 50%; 
            display: flex; align-items: center; justify-content: center; 
            font-weight: 900; font-size: 1.2rem; 
            border: 4px solid #22d3ee; z-index: 1000; 
            box-shadow: 0 10px 20px rgba(0,0,0,0.4);
        }

        .pack-shake { animation: intense-shake 0.8s infinite; }
        @keyframes intense-shake { 0%, 100% { transform: translate(0,0); } 10%, 30%, 50%, 70%, 90% { transform: translate(-8px, 0); } 20%, 40%, 60%, 80% { transform: translate(8px, 0); } }

        /* FIGURITAS PREMIUM - Tamaño optimizado para el abanico */
        .sticker-card-fixed { width: 200px; height: 280px; perspective: 1000px; flex-shrink: 0; }
        .sticker-body { width: 100%; height: 100%; background: white; border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); position: relative; transform-style: preserve-3d; transition: transform 0.1s ease-out; overflow: hidden; }
        .sticker-content { width: 100%; height: 100%; background: #0f172a; position: relative; overflow: hidden; }

        .frame-common { border: 5px solid #64748b; }
        .frame-uncommon { border: 6px solid #10b981; }
        .frame-rare { border: 7px solid #22d3ee; box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .frame-holo { border: 8px solid transparent; background: linear-gradient(#0f172a, #0f172a) padding-box, conic-gradient(from var(--angle), #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) border-box; animation: rotate-angle 4s linear infinite; }
        .frame-gold { border: 8px solid transparent; background: linear-gradient(#0f172a, #0f172a) padding-box, linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24) border-box; background-size: 300% 300%; animation: holo-border 3s linear infinite; box-shadow: 0 0 25px rgba(251, 191, 36, 0.5); }
        
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotate-angle { to { --angle: 360deg; } }
        @keyframes holo-border { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }

        .overlay-holo { position: absolute; inset: 0; z-index: 20; mix-blend-mode: screen; background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 24px 24px; animation: sparkles 4s linear infinite; opacity: 0.6; }
        .overlay-rare { position: absolute; inset: 0; z-index: 20; mix-blend-mode: overlay; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%); background-size: 200% 100%; animation: sweep-special 2.5s infinite ease-in-out; }
        .overlay-gold { position: absolute; inset: 0; z-index: 20; mix-blend-mode: overlay; background: linear-gradient(135deg, rgba(255, 215, 0, 0.5) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 215, 0, 0.5) 100%); }
        .gold-sweep { position: absolute; inset: -50%; z-index: 25; mix-blend-mode: color-dodge; background: linear-gradient(110deg, transparent 40%, #fff 50%, transparent 60%); animation: sweep 2s infinite linear; }
        .gold-filter { filter: sepia(1) saturate(5) hue-rotate(10deg) brightness(0.8) contrast(1.2); }

        @keyframes sparkles { 0% { background-position: 0 0; opacity: 0.3; } 50% { opacity: 0.8; } 100% { background-position: 48px 48px; opacity: 0.3; } }
        @keyframes sweep-special { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
        @keyframes sweep { 0% { transform: translate(-10%, -10%); } 100% { transform: translate(10%, 10%); } }

        .rarity-tag { position: absolute; bottom: 40px; left: 10px; z-index: 30; padding: 2px 8px; border-radius: 4px; font-size: 7px; font-weight: 900; text-transform: uppercase; color: white; background: rgba(0,0,0,0.7); }

        /* RESULTADOS - ABANICO UNIFICADO */
        #results-view { width: 100%; display: none; flex-direction: column; align-items: center; padding-top: 10px; position: relative; }
        
        .cards-hand { 
            position: relative;
            display: flex; 
            justify-content: center; 
            align-items: center; 
            width: 100%; 
            height: 400px; 
            margin-top: 20px;
            perspective: 2000px;
            transition: transform 0.3s ease;
        }
        
        .card-item { 
            position: absolute;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), z-index 0s linear 0.1s;
            transform-origin: bottom center;
            cursor: pointer;
            will-change: transform;
            transform: translateX(var(--tx)) translateY(var(--ty)) rotate(var(--rot));
        }

        /* Configuración del Abanico con Variables */
        .card-item:nth-child(1) { --tx: -160px; --ty: 40px; --rot: -20deg; z-index: 10; }
        .card-item:nth-child(2) { --tx: -80px;  --ty: 10px; --rot: -10deg; z-index: 20; }
        .card-item:nth-child(3) { --tx: 0px;    --ty: 0px;  --rot: 0deg;   z-index: 30; }
        .card-item:nth-child(4) { --tx: 80px;   --ty: 10px; --rot: 10deg;  z-index: 20; }
        .card-item:nth-child(5) { --tx: 160px;  --ty: 40px; --rot: 20deg;  z-index: 10; }

        /* Efecto de enfoque: cuando pasamos el mouse por el mazo, todas se apagan un poco */
        .cards-hand:hover .card-item {
            opacity: 0.6;
            filter: brightness(0.6) grayscale(0.3);
        }

        /* Pero la carta que tiene el mouse se ilumina y se viene al frente */
        .card-item:hover {
            z-index: 500 !important;
            opacity: 1 !important;
            filter: brightness(1.1) grayscale(0) !important;
            transform: translateX(var(--tx)) translateY(-100px) rotate(0deg) scale(1.2) !important;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), z-index 0s, opacity 0.2s;
        }

        .card-item:active {
            z-index: 600 !important;
            transform: translateX(var(--tx)) translateY(-120px) rotate(0deg) scale(1.3) !important;
        }

        /* Ajuste de escala para Móviles */
        @media (max-width: 640px) {
            .cards-hand { transform: scale(0.85); height: 350px; }
        }
        @media (max-width: 480px) {
            .cards-hand { transform: scale(0.72); height: 300px; margin-top: 0; }
        }
        @media (max-width: 360px) {
            .cards-hand { transform: scale(0.65); height: 280px; }
        }

        /* HEADER Y NAVEGACIÓN */
        .top-header { position: fixed; top: 0; left: 0; right: 0; height: 60px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; z-index: 2000; }
        
        .btn-nav-back { background: rgba(255,255,255,0.05); padding: 8px 15px; border-radius: 10px; font-weight: 800; font-size: 0.7rem; border: 1px solid rgba(255,255,255,0.1); color: white; text-transform: uppercase; }
        
        .user-info { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .user-name { font-size: 0.7rem; font-weight: 600; color: #94a3b8; }
        .btn-logout-small { font-size: 0.6rem; color: #ef4444; font-weight: 800; text-transform: uppercase; text-decoration: none; border: 1px solid rgba(239, 68, 68, 0.2); padding: 2px 6px; border-radius: 6px; }

        .floating { animation: float 4s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        .badge-new { position: absolute; top: 10px; left: 10px; z-index: 40; background: #22d3ee; color: #020617; font-size: 8px; font-weight: 900; padding: 3px 8px; border-radius: 4px; transform: rotate(-8deg); }

        .btn-ready { width: 90%; max-width: 280px; background: #22d3ee; color: #020617; padding: 16px; border-radius: 20px; font-weight: 900; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 10px; box-shadow: 0 10px 25px rgba(34,211,238,0.3); }
    </style>
</head>
<body>

    <div id="flash"></div>

    <div id="modal-detail" class="modal-blur" onclick="closeDetail()">
        <div class="flex flex-col items-center max-w-sm w-full p-4" onclick="event.stopPropagation()">
            <div id="modal-sticker-container" style="width:260px; height:360px; margin-bottom: 25px;">
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
                <div id="modal-rarity-tag" class="rarity-tag" style="display:inline-block; padding:4px 12px; border-radius:6px; font-size:10px; font-weight:900; text-transform:uppercase; position:static;"></div>
                <p id="modal-desc" class="text-gray-400 text-sm leading-relaxed italic mt-4 mb-4"></p>
                <button onclick="closeDetail()" class="px-8 py-2 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-widest">Cerrar</button>
            </div>
        </div>
    </div>

    <header class="top-header">
        <a href="dashboard.php" class="btn-nav-back">⬅ VOLVER</a>
        <div class="user-info">
            <span class="user-name"><?php echo htmlspecialchars($user['username']); ?></span>
            <a href="api/logout.php" class="btn-logout-small">Salir</a>
        </div>
    </header>

    <main>
        <!-- VISTA SOBRE (CENTRADA VERTICALMENTE) -->
        <div id="pack-selector" class="pack-center-container transition-all">
            <div class="pack-wrapper" id="pack-wrapper" onclick="handleOpen()">
                <?php if($user['packs_available'] > 0): ?>
                    <div id="main-pack" class="booster-pack floating">
                        <div class="pack-counter"><?php echo $user['packs_available']; ?></div>
                        <div class="text-7xl mb-4">✨</div>
                        <h2 class="text-2xl font-black italic uppercase leading-none text-white">Sobre<br>Especial</h2>
                        <div class="mt-8 bg-white/10 px-6 py-2 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border border-white/10">Toca para abrir</div>
                    </div>
                <?php else: ?>
                    <div class="booster-pack opacity-30 grayscale border-dashed border-2">
                        <div class="text-6xl">📭</div>
                        <h2 class="text-xl font-black italic text-white uppercase mt-4">Sin Sobres</h2>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- VISTA RESULTADOS -->
        <div id="results-view" class="w-full">
            <div class="text-center mb-1">
                <h2 class="text-2xl font-black italic tracking-tighter text-cyan-400 uppercase">¡BOTÍN OBTENIDO!</h2>
                <p class="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Desliza para ver tus 5 figus</p>
            </div>
            
            <div id="cards-hand" class="cards-hand"></div>

            <div class="w-full flex justify-center">
                <button onclick="location.reload()" class="btn-ready">ABRIR OTRO</button>
            </div>
        </div>
    </main>

    <script>
        let isProcessing = false;
        let isModalActive = false;

        function handleTilt(e, el) {
            if (isModalActive) return;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = (y - (rect.height / 2)) / 10;
            const rotateY = (x - (rect.width / 2)) / -10;
            el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        }

        function handleReset(el) { el.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`; }

        function openDetail(card) {
            isModalActive = true;
            const modal = document.getElementById('modal-detail');
            const overlay = document.getElementById('modal-overlay');
            const stickerContent = document.querySelector('#modal-sticker-body .sticker-content');
            const img = document.getElementById('modal-img');
            const tag = document.getElementById('modal-rarity-tag');
            
            const oldSweep = stickerContent.querySelector('.gold-sweep');
            if(oldSweep) oldSweep.remove();

            img.src = card.external_url;
            document.getElementById('modal-name').textContent = card.name;
            document.getElementById('modal-number').textContent = `Nº ${card.number}`;
            document.getElementById('modal-desc').textContent = card.description || 'Una pieza histórica única de nuestra técnica.';
            
            tag.textContent = card.rarity;
            tag.className = `rarity-tag tag-${card.rarity}`;
            
            document.getElementById('modal-sticker-body').className = `sticker-body frame-${card.rarity}`;
            
            overlay.className = '';
            if (card.rarity === 'holo') overlay.className = 'overlay-holo';
            if (card.rarity === 'rare') overlay.className = 'overlay-rare';
            
            if(card.rarity === 'gold') {
                img.classList.add('gold-filter');
                overlay.className = 'overlay-gold';
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

        async function handleOpen() {
            if (isProcessing) return;
            isProcessing = true;
            
            const wrapper = document.getElementById('pack-wrapper');
            const pack = document.getElementById('main-pack');
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
                    
                    const hasHigh = data.data.stickers.some(s => s.rarity === 'holo' || s.rarity === 'gold');
                    if (hasHigh) confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
                }, 1000);

            } catch (e) { console.error(e); isProcessing = false; }
        }

        function renderHand(stickers) {
            const results = document.getElementById('results-view');
            const hand = document.getElementById('cards-hand');
            results.style.display = 'flex';
            hand.innerHTML = '';

            stickers.forEach((s) => {
                const sData = JSON.stringify(s).replace(/'/g, "&apos;");
                const cardHtml = `
                    <div class="card-item">
                        <div class="sticker-card-fixed">
                            <div class="sticker-body frame-${s.rarity}" 
                                 onmousemove="handleTilt(event, this)" 
                                 onmouseleave="handleReset(this)"
                                 onclick='openDetail(${sData})'>
                                <div class="sticker-content">
                                    ${s.rarity === 'holo' ? '<div class="overlay-holo"></div>' : ''}
                                    ${s.rarity === 'rare' ? '<div class="overlay-rare"></div>' : ''}
                                    ${s.rarity === 'gold' ? '<div class="overlay-gold"></div><div class="gold-sweep"></div>' : ''}
                                    ${s.is_new ? '<div class="badge-new">¡NUEVA!</div>' : ''}
                                    <img src="${s.external_url}" class="w-full h-full object-cover ${s.rarity === 'gold' ? 'gold-filter' : ''}">
                                    <div class="rarity-tag">${s.rarity}</div>
                                    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/60 to-transparent">
                                        <h4 class="text-xs font-black italic uppercase truncate text-white">${s.name}</h4>
                                        <p class="text-[8px] text-cyan-400 font-black">Nº ${s.number}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                hand.insertAdjacentHTML('beforeend', cardHtml);
            });
        }
    </script>
</body>
</html>
