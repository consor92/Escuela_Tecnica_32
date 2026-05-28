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
    </style>
</head>
<body class="pb-10">

    <div id="toast-container"></div>

    <header class="p-8 pt-12">
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-3xl font-black uppercase italic tracking-tighter"><?php echo $user['full_name']; ?></h1>
                <p class="text-[10px] text-cyan-400 font-black uppercase tracking-widest opacity-70"><?php echo $user['course']; ?> • E.T. Nº 32</p>
            </div>
            <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-xl">🛡️</div>
        </div>

        <div class="glass-card p-6 rounded-[2rem] border-white/5">
            <div class="flex justify-between items-end mb-3">
                <span class="text-[9px] font-black uppercase text-gray-500 tracking-widest">Mi Colección</span>
                <span class="text-lg font-black neon-text-cian"><?php echo round($porcentaje); ?>%</span>
            </div>
            <div class="progreso-bar">
                <div class="progreso-fill" style="width: <?php echo $porcentaje; ?>%"></div>
            </div>
        </div>
    </header>

    <main class="px-8 space-y-8">
        
        <!-- CARD SOBRES GIGANTE -->
        <div class="relative group">
            <div class="absolute inset-0 bg-cyan-500/10 blur-[50px] rounded-full opacity-50"></div>
            <div class="relative glass-card rounded-[3rem] p-10 text-center border-cyan-500/30 border-2 overflow-hidden bg-gradient-to-br from-cyan-900/20 to-purple-900/20">
                <h3 class="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Sobres Listos</h3>
                <div class="text-8xl font-black mb-8 flex items-center justify-center gap-3">
                    <span id="packs-count" class="neon-text-cian"><?php echo $user['packs_available']; ?></span>
                    <span class="text-3xl animate-bounce">✨</span>
                </div>
                <a href="abrir_sobres.php" class="block w-full bg-neon-gradient py-5 rounded-[2rem] font-black text-white text-lg shadow-xl active:scale-95 transition-all uppercase">
                    ¡ABRIR SOBRES! 🚀
                </a>
            </div>
        </div>

        <!-- GRID DE ACCIONES (Ultra Compacto y Centrado) -->
        <div class="flex flex-wrap justify-center gap-4">
            <a href="album.php" class="menu-btn glass-card w-24">
                <div class="menu-icon bg-blue-500/10 text-blue-400">📖</div>
                <span class="menu-label text-[8px]">Álbum</span>
            </a>

            <a href="trivias.php" class="menu-btn glass-card w-24">
                <div class="menu-icon bg-amber-500/10 text-amber-400">💡</div>
                <span class="menu-label text-[8px]">Trivia</span>
                <div id="trivia-timer" class="cooldown-text hidden">00:00:00</div>
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

        <!-- Botón Salir -->
        <div class="pt-4">
            <a href="api/logout.php" class="flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 py-4 rounded-[2rem] text-xs font-black uppercase text-red-400 tracking-widest hover:bg-red-500/20 transition-all">
                <span>🚪</span> CERRAR SESIÓN
            </a>
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
        <div class="glass-card w-full max-w-sm rounded-[3rem] p-10 border-emerald-500/20 border-2">
            <h2 class="text-2xl font-black italic uppercase text-emerald-400 text-center mb-8">Canje de Repes</h2>
            <div class="bg-emerald-500/5 rounded-3xl p-6 text-center mb-8 border border-emerald-500/10">
                <p class="text-[10px] font-black text-emerald-500 uppercase mb-2">Tus Puntos</p>
                <div id="duplicate-points" class="text-5xl font-black text-white">...</div>
            </div>
            <div class="space-y-3">
                <button onclick="processTrade(1)" class="w-full bg-white/5 p-5 rounded-2xl flex justify-between font-black text-xs hover:bg-white/10 transition-all"><span>1 SOBRE</span> <span class="text-emerald-400">10 PTS</span></button>
                <button onclick="processTrade(5)" class="w-full bg-white/5 p-5 rounded-2xl flex justify-between font-black text-xs hover:bg-white/10 transition-all"><span>PACK 5</span> <span class="text-emerald-400">50 PTS</span></button>
                <button onclick="processTrade(10)" class="w-full bg-white/5 p-5 rounded-2xl flex justify-between font-black text-xs hover:bg-white/10 transition-all"><span>PACK 10</span> <span class="text-emerald-400">100 PTS</span></button>
            </div>
            <button onclick="document.getElementById('trade-modal').classList.add('hidden')" class="w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest text-center">Cerrar</button>
        </div>
    </div>

    <div id="promo-modal" class="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] hidden flex items-center justify-center p-6">
        <div class="glass-card w-full max-w-sm rounded-[3rem] p-10 border-purple-500/20 border-2">
            <h2 class="text-2xl font-black italic uppercase text-purple-400 text-center mb-8">Código Profe</h2>
            <input type="text" id="promo-input" placeholder="PALABRA CLAVE" class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-center text-2xl font-black text-white outline-none uppercase mb-8 focus:border-purple-500">
            <button onclick="redeemCode()" id="redeem-btn" class="w-full bg-neon-gradient py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl">CANJEAR 🚀</button>
            <button onclick="document.getElementById('promo-modal').classList.add('hidden')" class="w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest text-center">Cancelar</button>
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
                    document.getElementById('trade-modal').classList.add('hidden');
                    showReward(amount + (data.data.extra_amount || 0), data.message, "¡CANJE EXITOSO!");
                } else showToast(data.message, true);
            } catch(e) { showToast("Error de red", true); }
        }

        function openTradeModal() { document.getElementById('trade-modal').classList.remove('hidden'); loadPoints(); }
        function openPromoModal() { document.getElementById('promo-modal').classList.remove('hidden'); document.getElementById('promo-input').focus(); }

        async function loadPoints() {
            const res = await fetch('api/trade_duplicates.php', { method: 'POST', body: new URLSearchParams({action:'calculate'}) });
            const data = await res.json();
            if(data.success) {
                document.getElementById('duplicate-points').innerText = data.data.points;
                if(data.data.points > 0) {
                    document.getElementById('badge-pts').classList.remove('hidden');
                    document.getElementById('badge-pts').innerText = `${data.data.points} PTS`;
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
