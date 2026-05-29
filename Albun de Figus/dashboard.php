<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';
requireLogin();

$user = getCurrentUser($pdo);

// Consultar progreso real
$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM user_inventory WHERE user_id = ? AND is_stuck = 1");
$stmt->execute([$user['id']]);
$progreso = $stmt->fetch()['total'];
$porcentaje = ($progreso / 50) * 100;

// Calcular cooldown de trivia de forma segura
$triviaRemaining = 0;
if (isset($user['last_trivia_at']) && $user['last_trivia_at']) {
    $diff = time() - strtotime($user['last_trivia_at']);
    if ($diff < 21600) $triviaRemaining = 21600 - $diff;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Dashboard - Álbum 32</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --rarity-common: #94a3b8;
            --rarity-uncommon: #10b981;
            --rarity-rare: #3b82f6;
            --rarity-holo: #a855f7;
            --rarity-gold: #fbbf24;
        }
        body { font-family: 'Outfit', sans-serif; background: #020617; color: white; min-height: 100vh; overflow-x: hidden; }
        .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.08); }
        .neon-text-cian { color: #22d3ee; text-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .bg-neon-gradient { background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); }
        .progreso-bar { height: 8px; border-radius: 4px; background: rgba(255,255,255,0.05); overflow: hidden; }
        .progreso-fill { height: 100%; background: linear-gradient(90deg, #22d3ee, #8b5cf6); transition: width 1.5s ease-out; }

        .menu-btn { 
            position: relative; padding: 1.25rem; border-radius: 2.25rem; 
            display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .menu-btn:active { transform: scale(0.92); }
        .menu-icon { font-size: 1.5rem; width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; border-radius: 1.25rem; background: rgba(255,255,255,0.05); }
        .menu-label { font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; }

        #modal-reward { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 500; display: none; align-items: center; justify-content: center; padding: 2rem; backdrop-filter: blur(10px); }
        .reward-card { background: linear-gradient(135deg, #0f172a 0%, #020617 100%); border: 2px solid #fbbf24; border-radius: 3rem; padding: 3rem 2rem; text-align: center; max-width: 300px; width: 100%; box-shadow: 0 0 50px rgba(251, 191, 36, 0.2); animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .custom-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; padding: 12px 24px; border-radius: 16px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; animation: slideUp 0.3s ease-out; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        @keyframes slideUp { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        
        .cooldown-text { font-size: 0.6rem; font-family: monospace; color: #f87171; margin-top: 2px; font-weight: bold; }

        /* ESTILOS CANJE AVANZADO */
        .rarity-dot { width: 6px; height: 6px; border-radius: 50%; margin: 4px auto 0; }
        .rarity-stat-item { display: flex; flex-direction: column; align-items: center; }
        .btn-close-modal { 
            transition: all 0.2s ease; 
            cursor: pointer; 
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.08);
            padding: 1.25rem;
            border-radius: 1.5rem;
            display: block;
            width: 100%;
            color: #64748b !important;
        }
        .btn-close-modal:hover, .btn-close-modal:active { 
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.4);
            color: #f87171 !important; 
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(239, 68, 68, 0.15);
        }
        .btn-close-modal:active { transform: translateY(0) scale(0.98); }

        .pack-results-hand { 
            position: relative; display: flex; justify-content: center; align-items: center; 
            width: 100%; height: 250px; margin-top: 1rem; perspective: 1000px;
        }
        .pack-item { 
            position: absolute; width: 120px; height: 180px; 
            background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%);
            border-radius: 12px; border: 2px solid rgba(255,255,255,0.3);
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            box-shadow: 0 10px 20px rgba(0,0,0,0.4);
            transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
            transform-origin: bottom center;
        }
        .pack-item.free { border-color: #fbbf24; box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); }
        .badge-free { position: absolute; top: -10px; right: -10px; background: #fbbf24; color: black; font-size: 8px; font-weight: 900; px-2 py-1 rounded-lg transform rotate-12; padding: 2px 6px; }
    </style>
</head>
<body class="pb-10">

    <div id="toast-container"></div>

    <header class="p-8 pt-12">
        <div class="flex items-center justify-between mb-8">
            <div class="flex flex-col">
                <div class="flex items-center gap-4">
                    <h1 class="text-3xl font-black uppercase italic tracking-tighter"><?php echo $user['full_name']; ?></h1>
                    <a href="api/logout.php" class="w-10 h-10 flex items-center justify-center bg-red-600 border border-red-400 rounded-xl text-lg shadow-lg shadow-red-900/40 hover:bg-red-500 active:scale-90 transition-all" title="Cerrar Sesión">
                        🚪
                    </a>
                </div>
                <p class="text-[10px] text-cyan-400 font-black uppercase tracking-widest opacity-70"><?php echo $user['course']; ?> • E.T. Nº 32</p>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-xl">🛡️</div>
        </div>

        <div class="flex justify-center">
            <div class="glass-card p-6 rounded-[2rem] border-white/5 w-full max-w-xs">
                <div class="flex justify-between items-end mb-3">
                    <span class="text-[9px] font-black uppercase text-gray-500 tracking-widest">Mi Colección</span>
                    <span class="text-lg font-black neon-text-cian"><?php echo round($porcentaje); ?>%</span>
                </div>
                <div class="progreso-bar">
                    <div class="progreso-fill" style="width: <?php echo $porcentaje; ?>%"></div>
                </div>
            </div>
        </div>
    </header>

    <main class="px-8 space-y-8 flex flex-col items-center">
        
        <!-- CARD SOBRES GIGANTE -->
        <div class="relative group w-full max-w-xs">
            <div class="absolute inset-0 bg-cyan-500/10 blur-[50px] rounded-full opacity-50"></div>
            <div class="relative glass-card rounded-[3rem] p-10 text-center border-cyan-500/30 border-2 overflow-hidden bg-gradient-to-br from-cyan-900/20 to-purple-900/20">
                <h3 class="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Sobres Listos</h3>
                <div class="text-8xl font-black mb-8 flex items-center justify-center gap-3">
                    <span id="packs-count" class="neon-text-cian"><?php echo $user['packs_available']; ?></span>
                    <span class="text-3xl animate-bounce">✨</span>
                </div>
                <a href="abrir_sobres.php" class="block w-full bg-neon-gradient py-5 rounded-[2rem] font-black text-white text-lg shadow-xl active:scale-95 transition-all uppercase">
                    ¡ABRIR! 🚀
                </a>
            </div>
        </div>

        <!-- GRID DE ACCIONES (Trivia Removida) -->
        <div class="flex flex-wrap justify-center gap-4 w-full">
            <a href="album.php" class="menu-btn glass-card w-24">
                <div class="menu-icon bg-blue-500/10 text-blue-400">📖</div>
                <span class="menu-label text-[8px]">Álbum</span>
            </a>

            <button onclick="openTradeModal()" class="menu-btn glass-card w-24">
                <div id="badge-pts" class="absolute top-1 right-2 bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full hidden">0 PTS</div>
                <div class="menu-icon bg-emerald-500/10 text-emerald-400">🔄</div>
                <span class="menu-label text-[8px]">Canje</span>
            </button>

            <button onclick="openPromoModal()" class="menu-btn glass-card w-24">
                <div class="menu-icon bg-purple-500/10 text-purple-400">🔑</div>
                <span class="menu-label text-[8px]">Código</span>
            </button>
        </div>
    </main>

    <!-- MODALES -->
    <div id="modal-reward">
        <div class="reward-card">
            <div class="text-6xl mb-4">🎁</div>
            <h2 class="text-2xl font-black text-white italic uppercase mb-1" id="reward-title">¡FELICIDADES!</h2>
            <p class="text-gray-500 font-bold uppercase text-[9px] tracking-widest mb-6" id="reward-msg">Has recibido</p>
            <div class="text-6xl font-black text-yellow-400 mb-8" id="reward-amount">+0</div>
            <button onclick="location.reload()" class="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs">RECLAMAR 🚀</button>
        </div>
    </div>

    <div id="trade-modal" class="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] hidden flex items-center justify-center p-6">
        <!-- Vista Inicial: Cálculo y Selección -->
        <div id="trade-initial-view" class="glass-card w-full max-w-sm md:max-w-xl lg:max-w-2xl rounded-[3rem] p-8 md:p-12 border-emerald-500/20 border-2">
            <h2 class="text-2xl font-black italic uppercase text-emerald-400 text-center mb-6">Canje de Repes</h2>
            
            <div class="bg-emerald-500/5 rounded-3xl p-6 text-center mb-6 border border-emerald-500/10">
                <p class="text-[10px] font-black text-emerald-500 uppercase mb-1 tracking-widest">Puntos Totales</p>
                <div id="duplicate-points" class="text-5xl font-black text-white mb-4">...</div>

                <!-- Desglose de Rarezas (Horizontal) -->
                <div class="flex justify-center gap-6 border-t border-emerald-500/10 pt-4" id="rarity-breakdown">
                    <!-- Se llena vía JS -->
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2 md:gap-4 lg:gap-6">
                <button onclick="processTrade(1)" class="bg-white/5 py-4 md:py-8 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all border border-white/5">
                    <span class="text-[10px] md:text-xs font-black text-white">X1</span>
                    <span class="text-[8px] md:text-[10px] font-bold text-emerald-400">10 PTS</span>
                </button>
                <button onclick="processTrade(5)" class="bg-white/5 py-4 md:py-8 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all border border-white/5">
                    <span class="text-[10px] md:text-xs font-black text-white">X5</span>
                    <span class="text-[8px] md:text-[10px] font-bold text-emerald-400">50 PTS</span>
                </button>
                <button onclick="processTrade(10)" class="bg-white/5 py-4 md:py-8 rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all border border-emerald-500/30">
                    <span class="text-[10px] md:text-xs font-black text-white">X10</span>
                    <span class="text-[8px] md:text-[10px] font-bold text-emerald-400">100 PTS</span>
                </button>
            </div>

            <button onclick="document.getElementById('trade-modal').classList.add('hidden')" class="btn-close-modal w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest text-center">Cerrar</button>

        </div>

        <!-- Vista de Resultados: Mano de Sobres -->
        <div id="trade-results-view" class="hidden glass-card w-full max-w-sm md:max-w-xl lg:max-w-2xl rounded-[3rem] p-8 md:p-12 border-yellow-500/20 border-2 text-center">
            <h2 class="text-2xl font-black italic uppercase text-yellow-400 mb-2">¡BOTÍN DE CANJE!</h2>
            <p id="trade-result-msg" class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4"></p>
            
            <div id="packs-hand" class="pack-results-hand"></div>

            <button onclick="location.reload()" class="w-full bg-yellow-400 text-black py-5 md:py-8 rounded-[2rem] font-black uppercase text-sm md:text-lg shadow-xl mt-8">¡A RECAUDAR! 🚀</button>
        </div>
    </div>

    <div id="promo-modal" class="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] hidden flex items-center justify-center p-6">
        <div class="glass-card w-full max-w-sm rounded-[3rem] p-10 border-purple-500/20 border-2">
            <h2 class="text-2xl font-black italic uppercase text-purple-400 text-center mb-8">Código Profe</h2>
            <input type="text" id="promo-input" placeholder="PALABRA CLAVE" class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-center text-2xl font-black text-white outline-none uppercase mb-8 focus:border-purple-500">
            <button onclick="redeemCode()" id="redeem-btn" class="w-full bg-neon-gradient py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl">CANJEAR 🚀</button>
            <button onclick="document.getElementById('promo-modal').classList.add('hidden')" class="btn-close-modal w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest text-center">Cancelar</button>
        </div>
    </div>

    <script>
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
                } else showToast(data.message, true);
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
                    <div class="text-4xl mb-2">✨</div>
                    <div class="text-[10px] font-black uppercase text-white tracking-tighter">Sobre<br>Especial</div>
                    ${isFree ? '<div class="badge-free">GRATIS</div>' : ''}
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
    </script>
</body>
</html>
