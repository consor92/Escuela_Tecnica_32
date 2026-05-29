<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';
requireLogin();

$user = getCurrentUser($pdo);
if (!$user || $user['is_admin'] != 1) { header("Location: ../dashboard.php"); exit(); }

$totalUsers = $pdo->query("SELECT COUNT(*) FROM users WHERE is_admin = 0")->fetchColumn();
$totalCompleted = $pdo->query("SELECT COUNT(*) FROM users WHERE album_completed = 1")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Panel de Gestión</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { background: #020617; color: white; font-family: 'Outfit', sans-serif; }
        .glass-admin { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .modal-view { position: fixed; inset: 0; background: rgba(0,0,0,0.96); backdrop-filter: blur(20px); z-index: 100; display: none; padding: 1.5rem; }
        .modal-content { max-width: 1000px; margin: 0 auto; height: 100%; display: flex; flex-direction: column; }
        
        .list-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; }
        .list-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }

        .btn-close { color: #f87171 !important; font-weight: 900; transition: all 0.2s; cursor: pointer; }
        .btn-close:hover { transform: scale(1.2); color: #ff4d4d !important; }

        .custom-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; padding: 12px 24px; border-radius: 16px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; animation: slideUp 0.3s ease-out; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        @keyframes slideUp { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

        .sim-card { background: rgba(255,255,255,0.03); border-radius: 2rem; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
    </style>
</head>
<body class="p-6 md:p-10">

    <div id="toast-container"></div>

    <div class="max-w-4xl mx-auto space-y-10">
        <!-- HEADER -->
        <header>
            <div class="mb-6">
                <a href="../dashboard.php" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block">⬅ VOLVER</a>
            </div>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase italic tracking-tighter">Panel Maestro</h1>
                    <p class="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] ml-1">E.T. Nº 32 • Gestión y Auditoría</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="openSettings()" class="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase">⚙️ URL Config</button>
                    <a href="../api/logout.php" class="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest">Salir</a>
                </div>
            </div>
        </header>

        <!-- KPIs -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="glass-admin p-6 rounded-[2rem] border border-white/5 text-center">
                <p class="text-gray-500 text-[8px] font-black uppercase mb-1">Alumnos</p>
                <p class="text-3xl font-black text-white"><?php echo $totalUsers; ?></p>
            </div>
            <div class="glass-admin p-6 rounded-[2rem] border border-white/5 text-center">
                <p class="text-gray-500 text-[8px] font-black uppercase mb-1">Completos</p>
                <p class="text-3xl font-black text-emerald-400"><?php echo $totalCompleted; ?></p>
            </div>
            <div class="glass-admin p-6 rounded-[2rem] border border-white/5 text-center">
                <p class="text-gray-500 text-[8px] font-black uppercase mb-1">Efectividad</p>
                <p class="text-3xl font-black text-cyan-400"><?php echo $totalUsers > 0 ? round(($totalCompleted/$totalUsers)*100) : 0; ?>%</p>
            </div>
            <div class="glass-admin p-6 rounded-[2rem] border border-white/5 text-center">
                <p class="text-gray-500 text-[8px] font-black uppercase mb-1">Estado</p>
                <p class="text-xs font-black text-purple-500 uppercase tracking-widest">Online</p>
            </div>
        </div>

        <!-- MENU ACCIONES RAPIDAS -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onclick="openAlumnos()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">🎓</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Listado Alumnos</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Auditoría de progreso</span>
                </div>
            </button>
            <button onclick="openQR()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">📷</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Estaciones QR</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Generar y auditar visitas</span>
                </div>
            </button>
            <button onclick="openPromo()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">🔑</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Códigos Profe</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Premios temporales (24h)</span>
                </div>
            </button>
            <a href="trivias.php" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">🧠</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Preguntas Trivia</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Configurar banco de datos</span>
                </div>
            </a>
            <a href="test_trivia.php" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">🧪</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Simulador Trivia</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Probar preguntas sin límites</span>
                </div>
            </a>
            <button onclick="openSimulator()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">🚀</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Simulador Sobres</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Probar probabilidades</span>
                </div>
            </button>
            <button onclick="openRarities()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">⚖️</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Rarezas (%)</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Ajustar drop rates</span>
                </div>
            </button>
        </div>
    </div>

    <!-- MODAL ALUMNOS -->
    <div id="modal-alumnos" class="modal-view">
        <div class="modal-content">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-black italic uppercase">Gestión Académica</h2>
                <div class="flex gap-4">
                    <input type="text" id="alumno-search" onkeyup="loadAlumnos()" placeholder="Buscar alumno..." class="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none">
                    <button onclick="closeModal('alumnos')" class="btn-close text-2xl">&times;</button>
                </div>
            </header>
            <div class="flex-1 custom-scroll overflow-y-auto pr-2">
                <table class="w-full text-left border-separate border-spacing-y-2">
                    <thead class="text-[9px] font-black uppercase text-gray-500 sticky top-0 bg-black/90 backdrop-blur-md z-10">
                        <tr>
                            <th onclick="sortBy('full_name')" class="p-4 cursor-pointer hover:text-white transition-colors">Alumno / Curso ↕</th>
                            <th onclick="sortBy('stuck_count')" class="p-4 cursor-pointer hover:text-white transition-colors">Progreso ↕</th>
                            <th onclick="sortBy('completed_at')" class="p-4 cursor-pointer hover:text-white transition-colors">Finalización ↕</th>
                            <th onclick="sortBy('packs_available')" class="p-4 text-right cursor-pointer hover:text-white transition-colors">Sobres ↕</th>
                            <th class="p-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody id="alumnos-list"></tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- MODAL AUDITORIA -->
    <div id="modal-audit" class="modal-view" style="z-index: 150; background: rgba(0,0,0,0.98);">
        <div class="modal-content max-w-lg">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-black italic uppercase text-cyan-400" id="audit-name">Historial</h2>
                <button onclick="closeModal('audit')" class="btn-close text-2xl">&times;</button>
            </header>
            <div class="flex-1 custom-scroll overflow-y-auto space-y-3 pr-2" id="audit-list"></div>
        </div>
    </div>

    <!-- MODAL QR -->
    <div id="modal-qr" class="modal-view">
        <div class="modal-content max-w-4xl">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-black italic uppercase">Estaciones de Escaneo</h2>
                <button onclick="closeModal('qr')" class="btn-close text-2xl">&times;</button>
            </header>
            <form id="form-register-qr" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-6 glass-admin rounded-3xl">
                <input type="text" id="qr-name" placeholder="Nombre (Ej: Patio Belgrano)" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm">
                <select id="qr-type" class="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm">
                    <option value="pack">Tipo: Sobre Gratis</option>
                    <option value="trivia">Tipo: Lanzador Trivia</option>
                </select>
                <button type="submit" class="bg-cyan-500 text-black font-black py-3 rounded-xl uppercase text-[10px]">Crear Nueva Estación</button>
            </form>
            <div id="qr-list" class="flex-1 custom-scroll overflow-y-auto space-y-4 pr-2"></div>
        </div>
    </div>

    <!-- PREVIEW QR -->
    <div id="modal-qr-view" class="modal-view" style="z-index:200;">
        <div class="modal-content max-w-xs text-center justify-center space-y-6">
            <h3 class="text-2xl font-black italic" id="preview-title">...</h3>
            <div class="bg-white p-6 rounded-[3rem] shadow-2xl"><img id="preview-img" src="" class="w-full h-auto"></div>
            <code id="preview-url" class="block bg-black p-4 rounded-xl text-cyan-400 text-[10px] break-all border border-white/10"></code>
            <button onclick="closeModal('qr-view')" class="w-full bg-red-500/20 text-red-400 py-4 rounded-2xl font-black uppercase text-xs border border-red-500/30 hover:bg-red-500/30 transition-all">Cerrar</button>
        </div>
    </div>

    <!-- MODAL PROMO -->
    <div id="modal-promo" class="modal-view">
        <div class="modal-content">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-black italic uppercase">Códigos Promocionales</h2>
                <button onclick="closeModal('promo')" class="btn-close text-2xl">&times;</button>
            </header>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                <form id="form-generate-promo" class="glass-admin p-8 rounded-[2.5rem] space-y-4 h-fit">
                    <h4 class="text-xs font-black uppercase text-purple-400 tracking-widest">Nuevo Código (Premio: 1 Sobre)</h4>
                    <input type="text" id="promo-code" placeholder="BELGRANO20" required class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white uppercase outline-none focus:border-purple-500">
                    <div>
                        <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">Cupos Totales (Alumnos)</label>
                        <input type="number" id="promo-uses" value="50" min="1" class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white">
                    </div>
                    <button type="submit" class="w-full bg-purple-500 text-white font-black py-4 rounded-xl uppercase text-xs">Generar (Vence en 3 días)</button>
                </form>
                <div id="promo-list" class="lg:col-span-2 custom-scroll overflow-y-auto space-y-4 pr-2"></div>
            </div>
        </div>
    </div>

    <!-- MODAL SETTINGS -->
    <div id="modal-settings" class="modal-view">
        <div class="modal-content max-md justify-center">
            <h2 class="text-2xl font-black italic uppercase mb-8">Configuración URL</h2>
            <form id="form-settings" class="space-y-6">
                <input type="text" id="base-url" placeholder="https://miweb.com/figus/" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                <button type="submit" class="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-xs">Guardar URL Base</button>
                <button type="button" onclick="closeModal('settings')" class="w-full bg-red-500/10 text-red-400 py-4 rounded-xl font-black uppercase text-[10px] border border-red-500/20 hover:bg-red-500/20 transition-all">Cerrar</button>
            </form>
        </div>
    </div>

    <!-- MODAL RAREZAS -->
    <div id="modal-rarities" class="modal-view">
        <div class="modal-content max-w-md justify-center">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-black italic uppercase">Probabilidades</h2>
                <button onclick="closeModal('rarities')" class="btn-close text-2xl">&times;</button>
            </header>
            <form id="form-rarities" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">Común (%)</label>
                        <input type="number" id="rate-common" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    </div>
                    <div>
                        <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">Poco Común (%)</label>
                        <input type="number" id="rate-uncommon" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    </div>
                    <div>
                        <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">Rara (%)</label>
                        <input type="number" id="rate-rare" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    </div>
                    <div>
                        <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">Holo (%)</label>
                        <input type="number" id="rate-holo" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    </div>
                    <div class="col-span-2">
                        <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">Gold (%)</label>
                        <input type="number" id="rate-gold" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    </div>
                </div>
                <div id="rarity-sum-check" class="text-center text-[10px] font-bold text-gray-500 py-2">TOTAL: 100%</div>
                <button type="submit" class="w-full bg-emerald-500 text-black font-black py-4 rounded-xl uppercase text-xs shadow-lg shadow-emerald-900/20">Guardar Cambios</button>
            </form>
        </div>
    </div>

    <!-- MODAL SIMULADOR -->
    <div id="modal-simulator" class="modal-view">
        <div class="modal-content">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-black italic uppercase">Simulador de Apertura</h2>
                <button onclick="closeModal('simulator')" class="btn-close text-2xl">&times;</button>
            </header>
            
            <!-- CONTADORES DE SESIÓN -->
            <div class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                    <p class="text-[8px] font-black text-gray-500 uppercase">Sobres</p>
                    <p id="sim-count-packs" class="text-2xl font-black">0</p>
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                    <p class="text-[8px] font-black text-gray-400 uppercase">Comunes</p>
                    <p id="sim-count-common" class="text-2xl font-black">0</p>
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                    <p class="text-[8px] font-black text-emerald-500 uppercase">P. Comunes</p>
                    <p id="sim-count-uncommon" class="text-2xl font-black text-emerald-500">0</p>
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                    <p class="text-[8px] font-black text-cyan-400 uppercase">Raras</p>
                    <p id="sim-count-rare" class="text-2xl font-black text-cyan-400">0</p>
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                    <p class="text-[8px] font-black text-purple-500 uppercase">Holos</p>
                    <p id="sim-count-holo" class="text-2xl font-black text-purple-500">0</p>
                </div>
                <div class="bg-white/5 p-4 rounded-2xl border border-white/10 text-center">
                    <p class="text-[8px] font-black text-yellow-400 uppercase">Golds</p>
                    <p id="sim-count-gold" class="text-2xl font-black text-yellow-400">0</p>
                </div>
            </div>

            <div class="flex flex-wrap justify-center gap-4 mb-10">
                <button onclick="runSimulation(1)" class="bg-cyan-500 text-black font-black px-8 py-4 rounded-2xl text-sm uppercase shadow-xl hover:scale-105 transition-all">Abrir x1 🚀</button>
                <button onclick="runSimulation(10)" class="bg-purple-600 text-white font-black px-8 py-4 rounded-2xl text-sm uppercase shadow-xl hover:scale-105 transition-all">Abrir x10 🔥</button>
                <button onclick="resetSimulation()" class="bg-red-500/10 border border-red-500/20 text-red-400 font-black px-8 py-4 rounded-2xl text-sm uppercase hover:bg-red-500/20 transition-all">Reiniciar 🔄</button>
            </div>

            <div class="flex-1 custom-scroll overflow-y-auto pr-2">
                <div id="simulation-results" class="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <!-- Resultados aquí -->
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentSort = { column: 'completed_at', direction: 'ASC' };

        function sortBy(col) {
            if (currentSort.column === col) {
                currentSort.direction = currentSort.direction === 'ASC' ? 'DESC' : 'ASC';
            } else {
                currentSort.column = col;
                currentSort.direction = 'ASC';
            }
            // Actualizar indicadores visuales (opcional, pero ayuda)
            loadAlumnos();
        }

        function showToast(msg, isError = false) {
            const toast = document.createElement('div');
            toast.className = `custom-toast ${isError ? 'bg-red-500 text-white' : 'bg-white text-black'}`;
            toast.textContent = msg;
            document.getElementById('toast-container').appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        // Manejo de Modales
        function openAlumnos() { document.getElementById('modal-alumnos').style.display = 'block'; loadAlumnos(); }
        function openQR() { document.getElementById('modal-qr').style.display = 'block'; loadQR(); }
        function openPromo() { document.getElementById('modal-promo').style.display = 'block'; loadPromo(); }
        function openSettings() { document.getElementById('modal-settings').style.display = 'block'; fetch('../api/admin_fetch.php?action=get_url').then(r=>r.json()).then(d=>document.getElementById('base-url').value=d.data.url); }
        
        function openRarities() {
            document.getElementById('modal-rarities').style.display = 'block';
            fetch('../api/admin_fetch.php?action=get_rarities')
                .then(r => r.json())
                .then(d => {
                    if(d.success) {
                        document.getElementById('rate-common').value = d.data.common;
                        document.getElementById('rate-uncommon').value = d.data.uncommon;
                        document.getElementById('rate-rare').value = d.data.rare;
                        document.getElementById('rate-holo').value = d.data.holo;
                        document.getElementById('rate-gold').value = d.data.gold;
                    }
                });
        }

        function openSimulator() {
            document.getElementById('modal-simulator').style.display = 'block';
            if(!window.simStats) resetSimulation();
        }

        window.simStats = { packs: 0, common: 0, uncommon: 0, rare: 0, holo: 0, gold: 0 };

        function resetSimulation() {
            window.simStats = { packs: 0, common: 0, uncommon: 0, rare: 0, holo: 0, gold: 0 };
            updateSimUI();
            document.getElementById('simulation-results').innerHTML = '';
        }

        function updateSimUI() {
            document.getElementById('sim-count-packs').innerText = window.simStats.packs;
            document.getElementById('sim-count-common').innerText = window.simStats.common;
            document.getElementById('sim-count-uncommon').innerText = window.simStats.uncommon;
            document.getElementById('sim-count-rare').innerText = window.simStats.rare;
            document.getElementById('sim-count-holo').innerText = window.simStats.holo;
            document.getElementById('sim-count-gold').innerText = window.simStats.gold;
        }

        async function runSimulation(amount = 1) {
            const resultsContainer = document.getElementById('simulation-results');
            resultsContainer.innerHTML = ''; // Limpiar siempre para mostrar solo la última tirada

            for(let i=0; i<amount; i++) {
                const res = await fetch('../api/admin_fetch.php?action=test_open_pack');
                const data = await res.json();
                
                if(data.success) {
                    window.simStats.packs++;
                    data.data.stickers.forEach(s => {
                        window.simStats[s.rarity]++;
                        
                        const colors = { common: 'gray-500', uncommon: 'emerald-500', rare: 'cyan-400', holo: 'purple-500', gold: 'yellow-400' };
                        const frames = { common: '#64748b', uncommon: '#10b981', rare: '#22d3ee', holo: '#a855f7', gold: '#fbbf24' };
                        
                        const cardHtml = `
                            <div class="sim-card group">
                                <div class="aspect-[3/4] relative overflow-hidden bg-slate-900 border-b-4" style="border-color: ${frames[s.rarity]}">
                                    <img src="https://picsum.photos/seed/STK-${s.id}/300/400" class="w-full h-full object-cover">
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                    <div class="absolute bottom-2 left-2 right-2">
                                        <p class="text-[7px] font-black uppercase text-${colors[s.rarity]} tracking-widest">${s.rarity}</p>
                                        <p class="text-lg font-black italic text-white leading-none">Nº ${s.number}</p>
                                    </div>
                                </div>
                                <div class="p-3">
                                    <p class="text-[9px] text-white font-black uppercase truncate">${s.name}</p>
                                </div>
                            </div>`;
                        
                        resultsContainer.insertAdjacentHTML('beforeend', cardHtml);
                    });
                }
            }
            updateSimUI();
            if(amount > 1) showToast(`Simulación de ${amount} sobres completada.`);
        }

        function closeModal(id) { document.getElementById(`modal-${id}`).style.display = 'none'; }

        // Alumnos
        async function loadAlumnos() {
            const search = document.getElementById('alumno-search').value;
            const res = await fetch(`../api/admin_fetch.php?action=get_alumnos&order=${currentSort.column}&dir=${currentSort.direction}&search=${search}`);
            const data = await res.json();
            document.getElementById('alumnos-list').innerHTML = data.data.map(a => {
                const perc = Math.round((a.stuck_count / 50) * 100);
                return `
                <tr class="list-item border-b border-white/5">
                    <td class="p-4">
                        <p class="font-bold text-sm text-white">${a.full_name}</p>
                        <p class="text-[9px] text-gray-500 uppercase">${a.course}</p>
                    </td>
                    <td class="p-4">
                        <div class="flex items-center gap-2">
                            <div class="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div class="h-full bg-cyan-500" style="width: ${perc}%"></div>
                            </div>
                            <span class="text-[10px] font-black text-cyan-400">${perc}%</span>
                        </div>
                        <p class="text-[8px] font-bold text-gray-500 uppercase mt-1">${a.album_completed ? 'Álbum Completo' : 'En Proceso'}</p>
                    </td>
                    <td class="p-4">
                        <p class="text-[10px] font-mono ${a.completed_at ? 'text-emerald-400' : 'text-gray-600'}">
                            ${a.completed_at ? a.completed_at : '---'}
                        </p>
                        <p class="text-[7px] font-bold text-gray-500 uppercase">${a.completed_at ? 'Fecha Finalización' : 'No Completado'}</p>
                    </td>
                    <td class="p-4 text-right">
                        <p class="font-black text-white text-lg">${a.packs_available}</p>
                        <p class="text-[7px] text-gray-500 font-bold uppercase">Sobres</p>
                    </td>
                    <td class="p-4 text-right">
                        <button onclick="viewAudit(${a.id}, '${a.full_name}')" class="text-[9px] font-black text-cyan-500 border border-cyan-500/30 px-3 py-1.5 rounded-lg hover:bg-cyan-500 hover:text-black transition-all">HISTORIAL</button>
                    </td>
                </tr>
            `}).join('');
        }

        async function viewAudit(uid, name) {
            document.getElementById('modal-audit').style.display = 'block';
            document.getElementById('audit-name').innerText = `Historial: ${name}`;
            const res = await fetch(`../api/admin_fetch.php?action=get_audit&user_id=${uid}`);
            const data = await res.json();
            document.getElementById('audit-list').innerHTML = data.data.map(log => `
                <div class="p-4 rounded-xl list-item flex justify-between items-center">
                    <div><p class="text-[10px] font-black uppercase text-cyan-400">${log.source_type}</p><p class="text-xs text-white">${log.source_id || '---'}</p></div>
                    <div class="text-right"><p class="text-xs font-black">+${log.amount}</p><p class="text-[8px] text-gray-500 font-mono">${log.created_at}</p></div>
                </div>
            `).join('');
            if(data.data.length == 0) document.getElementById('audit-list').innerHTML = `<p class="text-center py-10 text-gray-600 italic">Sin registros</p>`;
        }

        // QRs
        async function loadQR() {
            const res = await fetch(`../api/admin_fetch.php?action=get_qr`);
            const data = await res.json();
            document.getElementById('qr-list').innerHTML = data.data.map(e => `
                <div class="p-5 rounded-3xl list-item flex justify-between items-center">
                    <div>
                        <h4 class="font-black text-white uppercase text-sm">${e.display_name}</h4>
                        <p class="text-[9px] font-bold text-gray-500 tracking-widest uppercase">${e.type} • ${e.total_scans} VISITAS</p>
                    </div>
                    <button onclick="previewQR('${e.slug}', '${e.display_name}')" class="bg-cyan-500 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg">VER QR</button>
                </div>
            `).join('');
        }

        async function previewQR(slug, name) {
            const resUrl = await fetch('../api/admin_fetch.php?action=get_url');
            const dataUrl = await resUrl.json();
            const finalUrl = `${dataUrl.data.url}api/scan_qr.php?slug=${slug}`;
            document.getElementById('preview-title').innerText = name;
            document.getElementById('preview-url').innerText = finalUrl;
            document.getElementById('preview-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(finalUrl)}`;
            document.getElementById('modal-qr-view').style.display = 'block';
        }

        // Promos
        async function loadPromo() {
            const res = await fetch(`../api/admin_fetch.php?action=get_promo`);
            const data = await res.json();
            document.getElementById('promo-list').innerHTML = data.data.map(c => `
                <div class="glass-admin p-6 rounded-[2rem] border border-white/5">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="font-black text-xl text-purple-400">${c.code}</span>
                            <p class="text-[9px] font-bold text-gray-500 uppercase">PREMIO: 1 SOBRE • CUPOS: ${c.used_by_count}/${c.max_uses || 50}</p>
                        </div>
                        <div class="text-right">
                            <span class="text-[9px] font-mono block ${c.expired ? 'text-red-500' : 'text-emerald-500'}">${c.expired ? 'VENCIDO' : 'ACTIVO'}</span>
                            <span class="text-[8px] text-gray-600 font-mono italic">Vence: ${c.expires_at}</span>
                        </div>
                    </div>
                    <div class="max-h-[100px] overflow-y-auto custom-scroll space-y-1">
                        ${c.uses.map(u => `<div class="flex justify-between text-[8px] bg-white/5 p-2 rounded-lg"><span class="font-bold">${u.full_name} (${u.course})</span><span class="text-gray-500">${u.used_at}</span></div>`).join('')}
                    </div>
                </div>
            `).join('');
        }

        // Submits
        document.getElementById('form-register-qr').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('display_name', document.getElementById('qr-name').value);
            fd.append('type', document.getElementById('qr-type').value);
            await fetch('../api/register_qr.php', { method: 'POST', body: fd });
            document.getElementById('qr-name').value = '';
            loadQR();
        }

        document.getElementById('form-generate-promo').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('code', document.getElementById('promo-code').value);
            fd.append('max_uses', document.getElementById('promo-uses').value);
            const res = await fetch('../api/generate_code.php', { method: 'POST', body: fd });
            const data = await res.json();
            if(data.success) {
                document.getElementById('promo-code').value = '';
                loadPromo();
                showToast("Código generado correctamente.");
            } else {
                showToast(data.message, true);
            }
        }

        document.getElementById('form-settings').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('url', document.getElementById('base-url').value);
            await fetch('../api/admin_fetch.php?action=save_url', { method: 'POST', body: fd });
            closeModal('settings');
            showToast("URL configurada correctamente.");
        }

        document.getElementById('form-rarities').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('common', document.getElementById('rate-common').value);
            fd.append('uncommon', document.getElementById('rate-uncommon').value);
            fd.append('rare', document.getElementById('rate-rare').value);
            fd.append('holo', document.getElementById('rate-holo').value);
            fd.append('gold', document.getElementById('rate-gold').value);
            
            const res = await fetch('../api/admin_fetch.php?action=save_rarities', { method: 'POST', body: fd });
            const data = await res.json();
            if(data.success) {
                showToast("Probabilidades actualizadas.");
                closeModal('rarities');
            } else showToast(data.message, true);
        }

        // Check de suma en tiempo real
        ['common','uncommon','rare','holo','gold'].forEach(id => {
            document.getElementById(`rate-${id}`).oninput = () => {
                const total = ['common','uncommon','rare','holo','gold'].reduce((acc, curr) => acc + parseInt(document.getElementById(`rate-${curr}`).value || 0), 0);
                const indicator = document.getElementById('rarity-sum-check');
                indicator.innerText = `TOTAL: ${total}%`;
                indicator.className = total === 100 ? 'text-emerald-500' : 'text-red-500';
            };
        });
    </script>
</body>
</html>
