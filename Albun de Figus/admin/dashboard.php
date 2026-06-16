<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';
requireLogin();

$user = getCurrentUser($pdo);
if (!$user || $user['role'] !== 'admin') { header("Location: ../dashboard.php"); exit(); }

$totalUsers = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'alumno'")->fetchColumn();
$totalCompleted = $pdo->query("SELECT COUNT(*) FROM users WHERE album_completed = 1")->fetchColumn();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>Admin - Panel Maestro</title>
    <link rel="icon" type="image/x-icon" href="../assets/img/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { background: #020617; color: white; font-family: 'Outfit', sans-serif; }
        .glass-admin { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(10px); }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .modal-view { position: fixed; inset: 0; background: rgba(0,0,0,0.96); backdrop-filter: blur(20px); z-index: 100; display: none; padding: 1.5rem; }
        .modal-content { max-width: 1000px; margin: 0 auto; height: 100%; display: flex; flex-direction: column; }
        
        #podium-tab-view::-webkit-scrollbar { width: 0px; background: transparent; }
        #podium-tab-view { scrollbar-width: none; -ms-overflow-style: none; }
        
        .list-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s; }
        .list-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }

        .btn-close { color: #f87171 !important; font-weight: 900; transition: all 0.2s; cursor: pointer; }
        .btn-close:hover { transform: scale(1.2); color: #ff4d4d !important; }

        .custom-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; padding: 12px 24px; border-radius: 16px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; animation: slideUp 0.3s ease-out; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        @keyframes slideUp { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

        .sim-card { background: rgba(255,255,255,0.03); border-radius: 2rem; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }

        /* --- ESTILOS DE RAREZA PARA EL SIMULADOR --- */
        .frame-common { border-color: #64748b !important; }
        .frame-uncommon { border-color: #10b981 !important; }
        .frame-rare { border-color: #22d3ee !important; box-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .frame-holo { 
            border-color: transparent !important; 
            background: linear-gradient(#0f172a, #0f172a) padding-box, conic-gradient(from var(--angle, 0deg), #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000) border-box; 
            animation: rotate-angle 4s linear infinite; 
        }
        .frame-gold { 
            border-color: transparent !important; 
            background: linear-gradient(#0f172a, #0f172a) padding-box, linear-gradient(135deg, #fbbf24, #f59e0b, #fbbf24) border-box; 
            animation: holo-border 3s linear infinite; 
            box-shadow: inset 0 0 12px rgba(251, 191, 36, 0.8);
        }
        
        @keyframes rotate-angle { from { --angle: 0deg; } to { --angle: 360deg; } }
        @keyframes holo-border { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        
        .gold-aura {
            position: absolute; inset: 0; background: radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%);
            z-index: 5; animation: aura-pulse 3s infinite alternate; pointer-events: none;
        }
        @keyframes aura-pulse { 0% { opacity: 0.2; transform: scale(0.95); } 100% { opacity: 0.5; transform: scale(1.05); } }

        .overlay-holo { position: absolute; inset: 0; z-index: 10; mix-blend-mode: screen; background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 1px, transparent 1px); background-size: 24px 24px; animation: sparkles 4s linear infinite; opacity: 0.4; }
        .overlay-rare { position: absolute; inset: 0; z-index: 10; mix-blend-mode: overlay; background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%); background-size: 200% 100%; animation: sweep-special 2.5s infinite ease-in-out; }
        
        @keyframes sweep-special { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes sparkles { from { background-position: 0 0; } to { background-position: 48px 48px; } }

        .gold-sweep { 
            position: absolute; top: -100%; left: -100%; width: 300%; height: 300%;
            background: linear-gradient(110deg, transparent 45%, rgba(255,255,255,0.6) 50%, transparent 55%);
            animation: sweep 4s infinite; z-index: 15; opacity: 0.5;
        }
        @keyframes sweep { 0% { transform: translate(-20%, -20%); } 100% { transform: translate(20%, 20%); } }
        
        .gold-filter { filter: sepia(0.5) brightness(1.2) contrast(1.1) saturate(1.5) hue-rotate(-10deg); }
    </style>
</head>
<body class="p-6 md:p-10">

    <div id="toast-container"></div>

    <div class="max-w-4xl mx-auto space-y-10">
        <!-- HEADER -->
        <header>
            <div class="mb-6">
                <a href="../dashboard.php?view=student" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block">⬅ VOLVER</a>
            </div>
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase italic tracking-tighter">Panel Maestro</h1>
                    <p class="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] ml-1">E.T. Nº 32 • Gestión y Auditoría</p>
                </div>
                <div class="flex gap-3">
                    <button id="btn-happy-hour" onclick="toggleHappyHour()" class="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase transition-all">🔥 Happy Hour: OFF</button>
                    <button id="btn-maintenance" onclick="toggleMaintenance()" class="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase transition-all">🏗️ Estado: Online</button>
                    <button id="btn-school-hours" onclick="openSchoolHours()" class="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase transition-all">🕒 Horario: OFF</button>
                    <button onclick="openSettings()" class="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase">⚙️ URL Config</button>
                    <button onclick="openChangePass()" class="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase" title="Cambiar mi contraseña">🔑</button>
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
                <p id="kpi-status" class="text-xs font-black text-purple-500 uppercase tracking-widest">Online</p>
            </div>
        </div>

        <!-- MENU ACCIONES RAPIDAS -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onclick="openRegisterDocente()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group border-emerald-500/20 border-2">
                <div class="text-5xl group-hover:scale-110 transition-transform">👨‍🏫</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none text-emerald-400">Registrar Docente</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Alta de profesores (Pass = DNI)</span>
                </div>
            </button>
            <button onclick="openAlumnos()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">🎓</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Listado Usuarios</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Alumnos, Profes y Admin</span>
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
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Lotes de 1 a 5 sobres</span>
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
            <button onclick="openPodium()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group">
                <div class="text-5xl group-hover:scale-110 transition-transform">🏆</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none">Podio Ganadores</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Ver podio y gestionar turnos</span>
                </div>
            </button>
            <button onclick="openSuggestions()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group border-amber-500/20 border-2">
                <div class="text-5xl group-hover:scale-110 transition-transform">💡</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none text-amber-400">Sugerencias</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Feedback de usuarios</span>
                </div>
            </button>
            <button onclick="openStickers()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group border-cyan-500/20 border-2">
                <div class="text-5xl group-hover:scale-110 transition-transform">🖼️</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none text-cyan-400">Gestión Figuritas</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Agregar y editar colección</span>
                </div>
            </button>
            <button onclick="openAlbums()" class="glass-admin p-10 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/5 transition-all group border-purple-500/20 border-2">
                <div class="text-5xl group-hover:scale-110 transition-transform">📚</div>
                <div class="text-left">
                    <span class="font-black uppercase text-lg italic block leading-none text-purple-400">Gestión Álbumes</span>
                    <span class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Crear y configurar colecciones</span>
                </div>
            </button>
        </div>
    </div>

    <!-- MODAL REGISTRAR DOCENTE -->
    <div id="modal-register-docente" class="modal-view">
        <div class="modal-content max-w-md justify-center">
            <h2 class="text-3xl font-black italic uppercase mb-8 text-emerald-400 text-center">Nuevo Docente</h2>
            <form id="form-register-docente" class="space-y-4">
                <div>
                    <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">Nombre Completo</label>
                    <input type="text" name="full_name" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">Usuario (Ej: pgonzalez)</label>
                    <input type="text" name="username" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm outline-none focus:border-emerald-500">
                </div>
                <div>
                    <label class="text-[9px] font-black uppercase text-gray-500 mb-1 block">DNI (Será su clave inicial)</label>
                    <input type="text" name="dni" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm outline-none focus:border-emerald-500">
                </div>
                <div class="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 mb-6">
                    <p class="text-[10px] text-emerald-400 leading-relaxed italic text-center">
                        <span class="font-black">NOTA:</span> El docente se registrará para el curso <span class="text-white font-bold">Profesor</span> por defecto. Podrá cambiar su clave al ingresar usando su DNI.
                    </p>
                </div>
                <button type="submit" class="w-full bg-emerald-500 text-black font-black py-4 rounded-xl uppercase text-xs shadow-xl">Dar de Alta Docente</button>
                <button type="button" onclick="closeModal('register-docente')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block text-white hover:bg-white/10 transition-all mt-4 w-full text-center">⬅ CANCELAR</button>
            </form>
        </div>
    </div>

    <!-- MODAL ALUMNOS -->
    <div id="modal-alumnos" class="modal-view">
        <div class="modal-content">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-black italic uppercase text-white">Gestión de Usuarios</h2>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Alumnos, Profesores y Administradores</p>
                </div>
                <div class="flex gap-4 items-center">
                    <input type="text" id="alumno-search" onkeyup="loadAlumnos()" placeholder="Buscar usuario..." class="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-cyan-500">
                    <button onclick="closeModal('alumnos')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block text-white hover:bg-white/10 transition-all">⬅ VOLVER</button>
                </div>
            </header>
            <div class="flex-1 custom-scroll overflow-y-auto pr-2">
                <div class="grid grid-cols-[2fr_1fr_1fr_0.5fr_1fr] gap-4 py-4 px-6 text-[10px] font-black uppercase text-gray-500 sticky top-0 bg-slate-950 z-20 border-b border-white/10">
                    <div class="cursor-pointer hover:text-white" onclick="sortBy('full_name')">Usuario / Rol ↕</div>
                    <div class="text-center" onclick="sortBy('stuck_count')">Progreso ↕</div>
                    <div class="text-center" onclick="sortBy('completed_at')">Finalización ↕</div>
                    <div class="text-right" onclick="sortBy('packs_available')">Sobres ↕</div>
                    <div class="text-right">Acción</div>
                </div>
                <div id="alumnos-list" class="divide-y divide-white/5"></div>
            </div>
        </div>
    </div>

    <!-- MODAL AUDITORIA -->
    <div id="modal-audit" class="modal-view" style="z-index: 150;">
        <div class="modal-content max-w-2xl">
            <h2 class="text-3xl font-black italic uppercase text-cyan-400 mb-8" id="audit-name">Historial</h2>
            <div class="flex-1 custom-scroll overflow-y-auto space-y-4" id="audit-list"></div>
            <button onclick="closeModal('audit')" class="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase text-sm mt-8">Cerrar</button>
        </div>
    </div>

    <!-- MODAL QR -->
    <div id="modal-qr" class="modal-view">
        <div class="modal-content max-w-4xl">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-black italic uppercase text-white">Estaciones QR</h2>
                <button onclick="closeModal('qr')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block text-white hover:bg-white/10 transition-all">⬅ VOLVER</button>
            </header>
            <form id="form-register-qr" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-6 glass-admin rounded-3xl">
                <input type="text" id="qr-name" placeholder="Nombre Estación" required class="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                <select id="qr-type" class="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white">
                    <option value="pack">Sobre Gratis</option>
                    <option value="trivia">Lanzador Trivia</option>
                </select>
                <button type="submit" class="bg-cyan-500 text-black font-black py-3 rounded-xl uppercase text-[10px]">Crear QR</button>
            </form>
            <div id="qr-list" class="flex-1 custom-scroll overflow-y-auto space-y-4"></div>
        </div>
    </div>

    <!-- PREVIEW QR -->
    <div id="modal-qr-view" class="modal-view" style="z-index:200;">
        <div class="modal-content max-w-xs text-center justify-center space-y-6">
            <h3 class="text-2xl font-black italic text-white" id="preview-title">...</h3>
            <div class="bg-white p-6 rounded-[3rem]"><img id="preview-img" src="" class="w-full h-auto"></div>
            <code id="preview-url" class="block bg-black p-4 rounded-xl text-cyan-400 text-[10px] break-all border border-white/10"></code>
            <button onclick="closeModal('qr-view')" class="w-full bg-red-500/20 text-red-400 py-4 rounded-2xl font-black uppercase text-xs border border-red-500/30">Cerrar</button>
        </div>
    </div>

    <!-- MODAL PROMO -->
    <div id="modal-promo" class="modal-view">
        <div class="modal-content max-w-5xl">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-black italic uppercase text-purple-400">Lotes de Códigos</h2>
                <button onclick="closeModal('promo')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block text-white hover:bg-white/10 transition-all">⬅ VOLVER</button>
            </header>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="space-y-8">
                    <form id="form-generate-batch" class="glass-admin p-8 rounded-[2.5rem] space-y-4 h-fit">
                        <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Generar Nuevo Lote</p>
                        <select id="promo-teacher" required class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white cursor-pointer"></select>
                        <input type="text" id="promo-reference" placeholder="Referencia (Ej: Premio Clase)" required class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-purple-500">
                        <input type="number" id="promo-quantity" value="30" min="1" max="100" class="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white text-sm outline-none focus:border-purple-500">
                        <button type="submit" class="w-full bg-purple-500 text-white font-black py-4 rounded-xl uppercase text-xs shadow-xl hover:scale-[1.02] transition-all">Generar Lote</button>
                    </form>

                    <!-- AJUSTES BIENVENIDA -->
                    <div class="glass-admin p-8 rounded-[2.5rem] space-y-6 h-fit border-emerald-500/20 border-2">
                        <div>
                            <h3 class="text-xs font-black text-emerald-400 uppercase italic">Kit de Bienvenida</h3>
                            <p class="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Auto-entrega a profes nuevos</p>
                        </div>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <span class="text-[10px] font-black text-white uppercase">Estado</span>
                                <button id="btn-welcome-promo" onclick="toggleWelcomePromo()" class="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all">Cargando...</button>
                            </div>
                            <div class="space-y-1">
                                <label class="text-[8px] font-black text-gray-600 uppercase">Cantidad de Sobres</label>
                                <input type="number" id="welcome-promo-qty" value="10" min="1" max="50" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs outline-none focus:border-emerald-500">
                            </div>
                            <button onclick="saveWelcomeSettings()" class="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black py-3 rounded-xl uppercase text-[9px] hover:bg-emerald-500 hover:text-black transition-all">Guardar Ajustes</button>
                        </div>
                    </div>
                </div>
                <div id="promo-list" class="lg:col-span-2 space-y-4 custom-scroll overflow-y-auto"></div>
            </div>
        </div>
    </div>

    <!-- MODAL PODIO -->
    <div id="modal-podium" class="modal-view">
        <div class="modal-content">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-black italic uppercase text-yellow-500">Cuadro de Honor</h2>
                <div class="flex gap-4">
                    <button id="btn-toggle-podium-res" data-active="0" onclick="togglePodiumRestriction()" class="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase">Restricción Turno: OFF</button>
                    <button onclick="closeModal('podium')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block">⬅ VOLVER</button>
                </div>
            </header>
            <div class="flex gap-4 mb-8 border-b border-white/10">
                <button id="tab-podium-view" onclick="showPodiumTab('view')" class="px-6 py-3 text-xs font-black uppercase">Ver Podio</button>
                <button id="tab-podium-manage" onclick="showPodiumTab('manage')" class="px-6 py-3 text-xs font-black uppercase">Gestionar Turnos</button>
            </div>
            <div id="podium-tab-view" class="flex-1 custom-scroll overflow-y-auto"></div>
            <div id="podium-tab-manage" class="hidden flex-1 custom-scroll overflow-y-auto">
                <div id="course-shift-list" class="max-w-md mx-auto space-y-3"></div>
            </div>
        </div>
    </div>

    <!-- MODAL SUGERENCIAS -->
    <div id="modal-suggestions" class="modal-view">
        <div class="modal-content max-w-4xl">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-black italic uppercase text-amber-400">Buzón de Sugerencias</h2>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-widest">Feedback de la comunidad</p>
                </div>
                <div class="flex gap-4 items-center">
                    <button id="btn-toggle-implemented" onclick="toggleImplementedFilter()" class="bg-white/5 border border-white/10 px-6 py-3 rounded-xl text-xs font-black uppercase transition-all">
                        Ocultar Hechos: OFF
                    </button>
                    <button onclick="closeModal('suggestions')" class="bg-white/5 px-6 py-3 rounded-lg font-black text-xs border border-white/10 tracking-widest uppercase inline-block text-white">⬅ VOLVER</button>
                </div>
            </header>
            <div id="suggestions-container" class="flex-1 custom-scroll overflow-y-auto space-y-6">
                <!-- Se llena vía JS -->
            </div>
        </div>
    </div>

    <!-- MODAL SETTINGS -->
    <div id="modal-settings" class="modal-view">
        <div class="modal-content max-w-md justify-center">
            <h2 class="text-2xl font-black italic uppercase mb-8 text-white">Ajustes Globales</h2>
            <form id="form-settings" class="space-y-6">
                <input type="text" id="base-url" placeholder="URL Base QR" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                <input type="text" id="drive-base-url" placeholder="URL Base Drive" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                <div class="grid grid-cols-2 gap-4">
                    <input type="number" id="cooldown-qr" placeholder="Espera QR" required class="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                    <input type="number" id="cooldown-trivia" placeholder="Espera Trivia" required class="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                </div>
                <button type="submit" class="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-xs">Guardar</button>
                <button type="button" onclick="closeModal('settings')" class="w-full text-gray-500 font-bold uppercase text-[10px] mt-4">Cancelar</button>
            </form>
        </div>
    </div>

    <!-- MODAL RAREZAS -->
    <div id="modal-rarities" class="modal-view">
        <div class="modal-content max-w-4xl justify-center">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-black italic uppercase text-white">Probabilidades del Sistema</h2>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Ajuste de algoritmos de drop y recompensas</p>
                </div>
                <button onclick="closeModal('rarities')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 uppercase">⬅ VOLVER</button>
            </header>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- FIGURITAS -->
                <form id="form-rarities" class="space-y-4 glass-admin p-6 rounded-3xl border-white/5">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xs font-black uppercase text-cyan-400 italic">Figuritas</h3>
                        <span id="sum-rarities" class="text-[10px] font-black px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">0%</span>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1"><label class="text-[8px] text-gray-500 font-black uppercase">Común</label><input type="number" id="rate-common" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                        <div class="space-y-1"><label class="text-[8px] text-gray-500 font-black uppercase">Poco Común</label><input type="number" id="rate-uncommon" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                        <div class="space-y-1"><label class="text-[8px] text-gray-500 font-black uppercase">Rara</label><input type="number" id="rate-rare" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                        <div class="space-y-1"><label class="text-[8px] text-gray-500 font-black uppercase">Holo</label><input type="number" id="rate-holo" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                        <div class="space-y-1 col-span-2"><label class="text-[8px] text-gray-500 font-black uppercase">Gold</label><input type="number" id="rate-gold" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                    </div>
                    <button type="submit" class="w-full bg-cyan-500 text-black font-black py-3 rounded-xl uppercase text-[10px]">Guardar Drop</button>
                </form>

                <!-- PREMIOS CÓDIGO -->
                <form id="form-promo-rates" class="space-y-4 glass-admin p-6 rounded-3xl border-white/5">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-xs font-black uppercase text-purple-400 italic">Sobres Regalo</h3>
                        <span id="sum-promo" class="text-[10px] font-black px-2 py-1 rounded bg-purple-500/10 text-purple-400">0%</span>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1"><label class="text-[8px] text-gray-500 font-black uppercase">1 Sobre</label><input type="number" id="promo-p1" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                        <div class="space-y-1"><label class="text-[8px] text-gray-500 font-black uppercase">2 Sobres</label><input type="number" id="promo-p2" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                        <div class="space-y-1"><label class="text-[8px] text-gray-500 font-black uppercase">3 Sobres</label><input type="number" id="promo-p3" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                        <div class="space-y-1"><label class="text-[8px] text-gray-500 font-black uppercase">4 Sobres</label><input type="number" id="promo-p4" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                        <div class="space-y-1 col-span-2"><label class="text-[8px] text-gray-500 font-black uppercase">5 Sobres</label><input type="number" id="promo-p5" class="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs w-full"></div>
                    </div>
                    <button type="submit" class="w-full bg-purple-500 text-white font-black py-3 rounded-xl uppercase text-[10px]">Guardar Premios</button>
                </form>

                <!-- BONUS DE CANJE -->
                <div class="space-y-6">
                    <form id="form-trade-bonus" class="space-y-4 glass-admin p-6 rounded-3xl border-white/5">
                        <h3 class="text-xs font-black uppercase text-emerald-400 italic mb-2">Bonus Canje (repetidas)</h3>
                        <div class="space-y-2">
                            <label class="text-[8px] text-gray-500 font-black uppercase">Prob. Sobre Extra (%)</label>
                            <input type="number" id="trade-bonus-rate" min="0" max="100" class="bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xl font-black w-full text-center">
                        </div>
                        <button type="submit" class="w-full bg-emerald-500 text-black font-black py-3 rounded-xl uppercase text-[10px]">Guardar Bonus</button>
                    </form>

                    <div class="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-3xl">
                        <p class="text-[9px] text-yellow-500 leading-relaxed font-bold uppercase italic">
                            ⚠️ Recuerda que las sumas de "Figuritas" y "Sobres Regalo" deben ser exactamente 100% para que el algoritmo funcione.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL FIGURITAS -->
    <div id="modal-stickers" class="modal-view">
        <div class="modal-content max-w-5xl">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-black italic uppercase text-white">Gestión de Figuritas</h2>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Colección completa del álbum</p>
                </div>
                <div class="flex gap-4 items-center">
                    <div class="flex bg-white/5 border border-white/10 rounded-xl px-2">
                        <select id="sticker-sort" onchange="loadStickers()" class="bg-transparent text-[10px] font-black uppercase text-gray-400 py-2 outline-none">
                            <option value="number"># Nº Figu</option>
                            <option value="rarity">💎 Rareza</option>
                            <option value="name">A-Z Nombre</option>
                        </select>
                    </div>
                    <input type="text" id="sticker-search" onkeyup="loadStickers()" placeholder="Buscar figu..." class="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-cyan-500">
                    <button onclick="editSticker()" class="bg-cyan-500 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase">+ NUEVA FIGU</button>
                    <button onclick="closeModal('stickers')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block">⬅ VOLVER</button>
                </div>
            </header>

            <div class="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
                <!-- LISTADO -->
                <div class="flex-1 custom-scroll overflow-y-auto pr-2">
                    <div id="stickers-list"></div>
                </div>

                <!-- FORMULARIO EDICIÓN -->
                <div id="sticker-editor" class="hidden w-full lg:w-80 glass-admin p-6 rounded-[2rem] border-white/5 h-fit sticky top-0">
                    <h3 id="editor-title" class="text-xs font-black uppercase text-cyan-400 mb-6 italic">Editar Figurita</h3>
                    <form id="form-sticker" class="space-y-4">
                        <input type="hidden" id="sticker-id">
                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Álbum</label>
                            <select id="sticker-album-id" required class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-xs"></select>
                        </div>
                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Número</label>
                            <input type="number" id="sticker-number" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs">
                        </div>
                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Nombre</label>
                            <input type="text" id="sticker-name" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs">
                        </div>
                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Descripción</label>
                            <textarea id="sticker-desc" rows="2" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs"></textarea>
                        </div>
                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Rareza</label>
                            <select id="sticker-rarity" class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-xs">
                                <option value="common">Común</option>
                                <option value="uncommon">Poco Común</option>
                                <option value="rare">Rara</option>
                                <option value="holo">Holo</option>
                                <option value="gold">Gold</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">URL Imagen (Drive/Absoluta)</label>
                            <input type="text" id="sticker-url" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                        </div>
                        <div class="pt-4 flex gap-2">
                            <button type="submit" class="flex-1 bg-cyan-500 text-black font-black py-3 rounded-xl uppercase text-[10px]">Guardar</button>
                            <button type="button" onclick="cancelStickerEdit()" class="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl uppercase text-[10px]">✖</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL ÁLBUMES -->
    <div id="modal-albums" class="modal-view">
        <div class="modal-content max-w-5xl">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-black italic uppercase text-purple-400">Gestión de Álbumes</h2>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Configuración técnica de colecciones</p>
                </div>
                <div class="flex gap-4">
                    <button onclick="editAlbum()" class="bg-purple-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">+ NUEVO ÁLBUM</button>
                    <button onclick="closeModal('albums')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 tracking-widest uppercase inline-block">⬅ VOLVER</button>
                </div>
            </header>

            <div class="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
                <div class="flex-1 custom-scroll overflow-y-auto pr-2">
                    <div id="albums-list" class="space-y-4"></div>
                </div>

                <div id="album-editor" class="hidden w-full lg:w-96 glass-admin p-8 rounded-[2rem] border-white/5 h-fit sticky top-0 overflow-y-auto max-h-full custom-scroll">
                    <h3 id="album-editor-title" class="text-xs font-black uppercase text-purple-400 mb-6 italic">Editar Álbum</h3>
                    <form id="form-album" class="space-y-4">
                        <input type="hidden" id="album-id">
                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Nombre del Álbum</label>
                            <input type="text" id="album-name" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs">
                        </div>
                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Total Figuritas</label>
                            <input type="number" id="album-total" value="50" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs">
                        </div>
                        <div class="grid grid-cols-1 gap-4 border-t border-white/5 pt-4 mt-4">
                            <p class="text-[7px] font-black text-gray-600 uppercase tracking-[0.2em]">Assets Visuales (URLs/Paths)</p>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Portada (Tapa)</label>
                                <input type="text" id="album-cover" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Contraportada (Lomo)</label>
                                <input type="text" id="album-back" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Fondo Página 1</label>
                                <input type="text" id="album-page-p1" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Fondo Página 2</label>
                                <input type="text" id="album-page-p2" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Fondo Página 3</label>
                                <input type="text" id="album-page-p3" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Fondo Página 4</label>
                                <input type="text" id="album-page-p4" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Fondo Página 5</label>
                                <input type="text" id="album-page-p5" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Página Honor 1</label>
                                <input type="text" id="album-honor-1" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Página Honor 2</label>
                                <input type="text" id="album-honor-2" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Imagen del Sobre (Pack)</label>
                                <input type="text" id="album-pack" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Dorso Figuritas</label>
                                <input type="text" id="album-sticker-back" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                            <div>
                                <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Marco/Borde Figuritas</label>
                                <input type="text" id="album-sticker-frame" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-[10px]">
                            </div>
                        </div>

                        <!-- GESTIÓN MASIVA DE IMÁGENES DE FIGURITAS -->
                        <div id="section-bulk-stickers" class="hidden border-t border-white/5 pt-4 mt-4">
                            <p class="text-[7px] font-black text-purple-400 uppercase tracking-[0.2em] mb-4 italic">Figuritas del Álbum (URLs)</p>
                            <div id="album-stickers-list" class="space-y-3 max-h-80 overflow-y-auto custom-scroll pr-2 mb-4">
                                <!-- Se carga vía JS -->
                            </div>
                            <button type="button" onclick="saveBulkStickerUrls()" class="w-full bg-purple-500/20 border border-purple-500/50 text-purple-400 font-black py-3 rounded-xl uppercase text-[9px] hover:bg-purple-500 hover:text-white transition-all">Guardar URLs de Figuritas</button>
                        </div>

                        <div>
                            <label class="text-[8px] text-gray-500 font-black uppercase mb-1 block">Estado</label>
                            <select id="album-active" class="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-xs">
                                <option value="1">Activo / Visible</option>
                                <option value="0">Inactivo / Oculto</option>
                            </select>
                        </div>
                        <div class="pt-4 flex gap-2">
                            <button type="submit" class="flex-1 bg-purple-500 text-white font-black py-3 rounded-xl uppercase text-[10px]">Guardar Álbum</button>
                            <button type="button" onclick="cancelAlbumEdit()" class="bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl uppercase text-[10px]">✖</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL CAMBIAR PASS -->
    <div id="modal-change-pass" class="modal-view">
        <div class="modal-content max-w-md justify-center">
            <h2 class="text-2xl font-black italic uppercase mb-8 text-white text-center">Mi Seguridad</h2>
            <form id="form-change-pass" class="space-y-4">
                <input type="password" id="pass-current" placeholder="Contraseña Actual" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                <input type="password" id="pass-new" placeholder="Nueva Contraseña" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white">
                <button type="submit" class="w-full bg-cyan-500 text-black font-black py-4 rounded-xl uppercase text-xs">Actualizar Clave</button>
                <button type="button" onclick="closeModal('change-pass')" class="w-full text-gray-500 font-bold uppercase text-[10px] mt-4">Cancelar</button>
            </form>
        </div>
    </div>

    <!-- MODAL RESET PASS -->
    <div id="modal-reset-pass" class="modal-view" style="z-index:300;">
        <div class="modal-content max-w-sm justify-center text-center">
            <h2 class="text-2xl font-black italic uppercase text-red-500 mb-4">Blanquear Clave</h2>
            <p class="text-xs text-gray-400 mb-8">¿Estás seguro de resetear la clave de <span id="reset-user-name" class="text-white font-bold"></span>?</p>
            <div id="reset-result" class="hidden mb-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                <p class="text-[10px] text-emerald-400 font-black uppercase mb-2">Nueva Clave Temporal:</p>
                <p id="new-temp-pass" class="text-3xl font-black text-white tracking-widest"></p>
            </div>
            <div class="flex flex-col gap-3" id="reset-actions">
                <button onclick="confirmResetPass()" class="w-full bg-red-500 text-white font-black py-4 rounded-xl uppercase text-xs">Sí, Blanquear</button>
                <button onclick="closeModal('reset-pass')" class="w-full text-gray-500 font-bold uppercase text-[10px] mt-4">Cancelar</button>
            </div>
            <button id="btn-reset-done" onclick="closeModal('reset-pass')" class="hidden w-full bg-white text-black font-black py-4 rounded-xl uppercase text-xs mt-4">Entendido</button>
        </div>
    </div>

    <!-- MODAL SIMULADOR -->
    <div id="modal-simulator" class="modal-view">
        <div class="modal-content max-w-4xl">
            <header class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-3xl font-black italic uppercase text-cyan-400">Simulador de Sobres</h2>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Prueba de probabilidades en tiempo real</p>
                </div>
                <button onclick="closeModal('simulator')" class="bg-white/5 px-4 py-2 rounded-lg font-black text-[10px] border border-white/10 uppercase">⬅ VOLVER</button>
            </header>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div class="glass-admin p-4 rounded-2xl text-center border-white/5">
                    <p class="text-[8px] font-black text-gray-500 uppercase">Comunes</p>
                    <p id="sim-count-common" class="text-xl font-black text-white">0</p>
                </div>
                <div class="glass-admin p-4 rounded-2xl text-center border-emerald-500/20">
                    <p class="text-[8px] font-black text-emerald-500 uppercase">Poco Comunes</p>
                    <p id="sim-count-uncommon" class="text-xl font-black text-white">0</p>
                </div>
                <div class="glass-admin p-4 rounded-2xl text-center border-blue-500/20">
                    <p class="text-[8px] font-black text-blue-500 uppercase">Raras</p>
                    <p id="sim-count-rare" class="text-xl font-black text-white">0</p>
                </div>
                <div class="glass-admin p-4 rounded-2xl text-center border-purple-500/20">
                    <p class="text-[8px] font-black text-purple-500 uppercase">Holos</p>
                    <p id="sim-count-holo" class="text-xl font-black text-white">0</p>
                </div>
                <div class="glass-admin p-4 rounded-2xl text-center border-yellow-500/20">
                    <p class="text-[8px] font-black text-yellow-500 uppercase">Gold</p>
                    <p id="sim-count-gold" class="text-xl font-black text-white">0</p>
                </div>
                <div class="glass-admin p-4 rounded-2xl text-center border-cyan-500/20">
                    <p class="text-[8px] font-black text-cyan-500 uppercase">Sobres</p>
                    <p id="sim-count-packs" class="text-xl font-black text-white">0</p>
                </div>
            </div>

            <div class="flex gap-4 mb-8">
                <button onclick="runSimulation(1)" class="flex-1 bg-cyan-500 text-black font-black py-4 rounded-2xl uppercase italic text-sm shadow-lg hover:scale-105 transition-all">Abrir x1</button>
                <button onclick="runSimulation(10)" class="flex-1 bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl uppercase italic text-sm hover:bg-white/10 transition-all">Abrir x10</button>
                <button onclick="resetSimStats()" class="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">Reiniciar</button>
            </div>

            <div id="sim-results" class="flex-1 grid grid-cols-5 md:grid-cols-10 gap-2 overflow-y-auto custom-scroll pr-2 pb-10">
                <!-- Resultados aquí -->
            </div>
        </div>
    </div>

    <!-- MODAL HORARIOS ESCOLARES -->
    <div id="modal-school-hours" class="modal-view">
        <div class="modal-content max-w-md justify-center">
            <h2 class="text-3xl font-black italic uppercase mb-8 text-cyan-400 text-center">Horario Escolar</h2>
            <div class="space-y-6 glass-admin p-8 rounded-[2.5rem] border-white/10">
                <div class="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                    <span class="text-xs font-black uppercase text-white">Restricción Horaria</span>
                    <button id="btn-toggle-school-hours" onclick="toggleSchoolHoursLocal()" class="bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all">Cargando...</button>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-[9px] font-black uppercase text-gray-500 ml-2">Apertura (H)</label>
                        <input type="number" id="school-opening" min="0" max="23" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-center font-black">
                    </div>
                    <div class="space-y-1">
                        <label class="text-[9px] font-black uppercase text-gray-500 ml-2">Cierre (H)</label>
                        <input type="number" id="school-closing" min="0" max="23" class="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-center font-black">
                    </div>
                </div>

                <div class="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
                    <p class="text-[9px] text-yellow-500 leading-relaxed italic text-center">
                        Si está <b>ACTIVO</b>, los alumnos solo podrán entrar en la franja horaria definida (Ej: 08 a 22). Los administradores siempre tienen acceso.
                    </p>
                </div>

                <button onclick="saveSchoolHours()" class="w-full bg-cyan-500 text-black font-black py-4 rounded-xl uppercase text-xs shadow-xl">Guardar Configuración</button>
            </div>
            <button type="button" onclick="closeModal('school-hours')" class="w-full text-gray-500 font-bold uppercase text-[10px] mt-8 text-center">Cerrar</button>
        </div>
    </div>

    <script>
        // --- GESTIÓN ÁLBUMES ---
        function openAlbums() {
            document.getElementById('modal-albums').style.display = 'block';
            loadAlbums();
        }

        async function loadAlbums() {
            try {
                const res = await fetch('../api/admin_fetch.php?action=get_albums');
                const d = await res.json();
                document.getElementById('albums-list').innerHTML = d.data.map(a => `
                    <div class="glass-admin p-6 rounded-3xl border-white/5 flex justify-between items-center group">
                        <div class="flex items-center gap-6">
                            <div class="w-16 h-20 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                                <img src="${a.cover_img}" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h4 class="text-lg font-black uppercase text-white">${a.name}</h4>
                                <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">${a.total_stickers} FIGURITAS TOTALES • ${a.is_active ? '✅ ACTIVO' : '❌ INACTIVO'}</p>
                            </div>
                        </div>
                        <button onclick='editAlbum(${JSON.stringify(a).replace(/'/g, "&apos;")})' class="bg-white/5 hover:bg-purple-500 text-white p-4 rounded-2xl transition-all">✏️</button>
                    </div>
                `).join('');
            } catch (err) {
                showToast("Error al cargar álbumes", true);
            }
        }

        async function editAlbum(a = null) {
            const editor = document.getElementById('album-editor');
            editor.classList.remove('hidden');
            
            if (a) {
                document.getElementById('album-editor-title').innerText = "Editar Álbum";
                document.getElementById('album-id').value = a.id;
                document.getElementById('album-name').value = a.name;
                document.getElementById('album-total').value = a.total_stickers;
                // Usar campos _raw para que el editor mantenga los IDs de Drive originales
                document.getElementById('album-cover').value = a.cover_img_raw || a.cover_img;
                document.getElementById('album-back').value = a.back_cover_img_raw || a.back_cover_img;
                document.getElementById('album-page-p1').value = a.page_bg_p1_raw || a.page_bg_p1 || '';
                document.getElementById('album-page-p2').value = a.page_bg_p2_raw || a.page_bg_p2 || '';
                document.getElementById('album-page-p3').value = a.page_bg_p3_raw || a.page_bg_p3 || '';
                document.getElementById('album-page-p4').value = a.page_bg_p4_raw || a.page_bg_p4 || '';
                document.getElementById('album-page-p5').value = a.page_bg_p5_raw || a.page_bg_p5 || '';
                document.getElementById('album-honor-1').value = a.honor_page_1_bg_raw || a.honor_page_1_bg || '';
                document.getElementById('album-honor-2').value = a.honor_page_2_bg_raw || a.honor_page_2_bg || '';
                document.getElementById('album-pack').value = a.pack_img_raw || a.pack_img || '';
                document.getElementById('album-sticker-back').value = a.sticker_back_img_raw || a.sticker_back_img;
                document.getElementById('album-sticker-frame').value = a.sticker_frame_border_img_raw || a.sticker_frame_border_img;
                document.getElementById('album-active').value = a.is_active;

                // Cargar figuritas del álbum
                document.getElementById('section-bulk-stickers').classList.remove('hidden');
                loadAlbumStickers(a.id);
            } else {
                document.getElementById('album-editor-title').innerText = "Nuevo Álbum";
                document.getElementById('form-album').reset();
                document.getElementById('album-id').value = 0;
                document.getElementById('section-bulk-stickers').classList.add('hidden');
            }
        }

        async function loadAlbumStickers(albumId) {
            const listEl = document.getElementById('album-stickers-list');
            listEl.innerHTML = '<p class="text-[9px] text-gray-500 animate-pulse">Cargando figuritas...</p>';
            try {
                const res = await fetch(`../api/admin_fetch.php?action=get_album_stickers&album_id=${albumId}`);
                const d = await res.json();
                if (d.success && d.data.length > 0) {
                    listEl.innerHTML = d.data.map(s => `
                        <div class="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[8px] font-black text-cyan-400 uppercase">#${s.number} - ${s.name}</span>
                            </div>
                            <input type="text" data-sticker-id="${s.id}" value="${s.external_url}" class="bulk-sticker-url w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[9px] text-white outline-none focus:border-purple-500">
                        </div>
                    `).join('');
                } else {
                    listEl.innerHTML = '<p class="text-[9px] text-gray-500 italic">No hay figuritas en este álbum aún</p>';
                }
            } catch (err) {
                listEl.innerHTML = '<p class="text-[9px] text-red-500">Error al cargar figuritas</p>';
            }
        }

        async function saveBulkStickerUrls() {
            const inputs = document.querySelectorAll('.bulk-sticker-url');
            const urls = {};
            inputs.forEach(input => {
                urls[input.dataset.stickerId] = input.value.trim();
            });

            if (Object.keys(urls).length === 0) return;

            try {
                const res = await fetch('../api/admin_fetch.php?action=save_bulk_sticker_urls', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ urls })
                });
                const d = await res.json();
                showToast(d.message, !d.success);
            } catch (err) {
                showToast("Error de conexión", true);
            }
        }

        function cancelAlbumEdit() {
            document.getElementById('album-editor').classList.add('hidden');
            document.getElementById('form-album').reset();
        }

        document.getElementById('form-album').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('id', document.getElementById('album-id').value);
            fd.append('name', document.getElementById('album-name').value);
            fd.append('total_stickers', document.getElementById('album-total').value);
            fd.append('cover_img', document.getElementById('album-cover').value);
            fd.append('back_cover_img', document.getElementById('album-back').value);
            fd.append('page_bg_p1', document.getElementById('album-page-p1').value);
            fd.append('page_bg_p2', document.getElementById('album-page-p2').value);
            fd.append('page_bg_p3', document.getElementById('album-page-p3').value);
            fd.append('page_bg_p4', document.getElementById('album-page-p4').value);
            fd.append('page_bg_p5', document.getElementById('album-page-p5').value);
            fd.append('honor_page_1_bg', document.getElementById('album-honor-1').value);
            fd.append('honor_page_2_bg', document.getElementById('album-honor-2').value);
            fd.append('pack_img', document.getElementById('album-pack').value);
            fd.append('sticker_back_img', document.getElementById('album-sticker-back').value);
            fd.append('sticker_frame_border_img', document.getElementById('album-sticker-frame').value);
            fd.append('is_active', document.getElementById('album-active').value);

            try {
                const res = await fetch('../api/admin_fetch.php?action=save_album', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
                if (d.success) {
                    cancelAlbumEdit();
                    loadAlbums();
                }
            } catch (err) {
                showToast("Error de conexión", true);
            }
        }

        // --- GESTIÓN FIGURITAS ---
        async function openStickers() {
            document.getElementById('modal-stickers').style.display = 'block';
            await loadAlbumsList();
            loadStickers();
        }

        async function loadAlbumsList() {
            const res = await fetch('../api/admin_fetch.php?action=get_albums');
            const d = await res.json();
            document.getElementById('sticker-album-id').innerHTML = d.data.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
        }

        async function loadStickers() {
            try {
                const search = document.getElementById('sticker-search').value.toLowerCase();
                const sortBy = document.getElementById('sticker-sort').value;
                const res = await fetch('../api/admin_fetch.php?action=get_stickers');
                const d = await res.json();
                
                // Definir jerarquía de rareza para ordenamiento
                const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'holo': 4, 'gold': 5 };

                // Filtrar y ordenar
                const filtered = d.data.filter(s => 
                    s.name.toLowerCase().includes(search) || 
                    s.number.toString().includes(search) ||
                    s.album_name.toLowerCase().includes(search)
                ).sort((a, b) => {
                    if (sortBy === 'number') return a.number - b.number;
                    if (sortBy === 'rarity') {
                        const diff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
                        return diff !== 0 ? diff : a.number - b.number; // Si empatan rareza, ordenar por número
                    }
                    if (sortBy === 'name') return a.name.localeCompare(b.name);
                    return 0;
                });

                // Agrupar por álbum (manteniendo el orden ya aplicado dentro de cada grupo)
                const groups = filtered.reduce((acc, s) => {
                    if (!acc[s.album_name]) acc[s.album_name] = [];
                    acc[s.album_name].push(s);
                    return acc;
                }, {});

                const listEl = document.getElementById('stickers-list');
                if (filtered.length === 0) {
                    listEl.innerHTML = `<div class="p-20 text-center glass-admin rounded-3xl border-dashed border-2 border-white/5"><p class="text-gray-500 font-bold uppercase text-xs tracking-widest">No se encontraron figuritas</p></div>`;
                    return;
                }

                listEl.innerHTML = Object.entries(groups).map(([album, stickers]) => `
                    <div class="col-span-full mb-8">
                        <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full flex justify-between items-center p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                            <div class="flex items-center gap-4">
                                <span class="text-2xl">📚</span>
                                <div class="text-left">
                                    <h3 class="text-lg font-black uppercase text-white italic">${album}</h3>
                                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest">${stickers.length} FIGURITAS TOTALES</p>
                                </div>
                            </div>
                            <span class="text-gray-500 group-hover:text-white transition-colors">↕</span>
                        </button>
                        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6 px-2">
                            ${stickers.map(s => `
                                <div class="glass-admin p-4 rounded-3xl border-white/5 group relative overflow-hidden">
                                    <div class="aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-black/40 border border-white/5 relative">
                                        <img src="${s.external_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" onerror="this.src='https://placehold.co/300x400/1e293b/white?text=No+Image'">
                                        <div class="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded-lg border border-white/10 text-[8px] font-black text-cyan-400">#${s.number}</div>
                                    </div>
                                    <div class="space-y-1 px-1">
                                        <div class="flex justify-between items-center text-[8px] font-black uppercase">
                                            <span class="${s.rarity === 'common' ? 'text-gray-500' : s.rarity === 'uncommon' ? 'text-emerald-400' : s.rarity === 'rare' ? 'text-blue-500' : s.rarity === 'holo' ? 'text-purple-500' : 'text-yellow-500'}">${s.rarity}</span>
                                        </div>
                                        <h4 class="text-[10px] font-bold text-white truncate uppercase tracking-tight">${s.name}</h4>
                                    </div>
                                    <!-- Overlay corregido: Backdrop-blur solo al fondo, botones visibles -->
                                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3">
                                        <div class="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
                                        <button onclick='editSticker(${JSON.stringify(s).replace(/'/g, "&apos;")})' class="relative z-10 bg-white text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-transform">Editar</button>
                                        <button onclick="deleteSticker(${s.id})" class="relative z-10 text-red-500 font-black text-[9px] uppercase hover:underline">Eliminar</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
                
                listEl.className = "space-y-4 pb-20";

            } catch (err) {
                console.error(err);
                showToast("Error al cargar figuritas", true);
            }
        }

        function editSticker(s = null) {
            const editor = document.getElementById('sticker-editor');
            editor.classList.remove('hidden');
            
            if (s) {
                document.getElementById('editor-title').innerText = "Editar Figurita #" + s.number;
                document.getElementById('sticker-id').value = s.id;
                document.getElementById('sticker-album-id').value = s.album_id;
                document.getElementById('sticker-number').value = s.number;
                document.getElementById('sticker-name').value = s.name;
                document.getElementById('sticker-desc').value = s.description || '';
                document.getElementById('sticker-rarity').value = s.rarity;
                document.getElementById('sticker-url').value = s.external_url_raw || s.external_url;
            } else {
                document.getElementById('editor-title').innerText = "Nueva Figurita";
                document.getElementById('form-sticker').reset();
                document.getElementById('sticker-id').value = 0;
            }
        }

        function cancelStickerEdit() {
            document.getElementById('sticker-editor').classList.add('hidden');
            document.getElementById('form-sticker').reset();
        }

        document.getElementById('form-sticker').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('id', document.getElementById('sticker-id').value);
            fd.append('album_id', document.getElementById('sticker-album-id').value);
            fd.append('number', document.getElementById('sticker-number').value);
            fd.append('name', document.getElementById('sticker-name').value);
            fd.append('description', document.getElementById('sticker-desc').value);
            fd.append('rarity', document.getElementById('sticker-rarity').value);
            fd.append('external_url', document.getElementById('sticker-url').value);

            try {
                const res = await fetch('../api/admin_fetch.php?action=save_sticker', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
                if (d.success) {
                    cancelStickerEdit();
                    loadStickers();
                }
            } catch (err) {
                showToast("Error de conexión", true);
            }
        }

        async function deleteSticker(id) {
            if (!confirm("¿Seguro que quieres eliminar esta figurita? No se puede deshacer.")) return;
            const fd = new FormData();
            fd.append('id', id);
            try {
                const res = await fetch('../api/admin_fetch.php?action=delete_sticker', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
                if (d.success) loadStickers();
            } catch (err) {
                showToast("Error de conexión", true);
            }
        }

        // --- NAVEGACIÓN Y TOASTS ---
        function showToast(msg, isError = false) {
            const toast = document.createElement('div');
            toast.className = `custom-toast px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all duration-300 transform translate-y-0 ${isError ? 'bg-red-500 text-white' : 'bg-emerald-500 text-black'}`;
            toast.textContent = msg;
            document.getElementById('toast-container').appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(10px)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
        function closeModal(id) { 
            document.getElementById(`modal-${id}`).style.display = 'none'; 
            if(id === 'reset-pass') {
                document.getElementById('reset-actions').classList.remove('hidden');
                document.getElementById('reset-result').classList.add('hidden');
                document.getElementById('btn-reset-done').classList.add('hidden');
            }
        }
        
        // --- ESTADOS (HAPPY/MAINT/HOURS) ---
        async function checkStatus() {
            try {
                const res = await fetch('../api/admin_fetch.php?action=get_status');
                const d = await res.json();
                if(d.success) {
                    const hh = document.getElementById('btn-happy-hour');
                    hh.innerText = `🔥 Happy Hour: ${d.data.happy ? 'ON' : 'OFF'}`;
                    hh.className = d.data.happy ? 'bg-orange-500 text-black px-4 py-3 rounded-2xl text-[9px] font-black uppercase shadow-lg' : 'bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase';
                    
                    const mt = document.getElementById('btn-maintenance');
                    mt.innerText = `🏗️ Estado: ${d.data.maintenance ? 'Offline' : 'Online'}`;
                    mt.className = d.data.maintenance ? 'bg-red-500 text-white px-4 py-3 rounded-2xl text-[9px] font-black uppercase shadow-lg' : 'bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase';

                    const sh = document.getElementById('btn-school-hours');
                    if(sh) {
                        sh.innerText = `🕒 Horario: ${d.data.school_hours.enabled ? 'ON' : 'OFF'}`;
                        sh.className = d.data.school_hours.enabled ? 'bg-cyan-500 text-black px-4 py-3 rounded-2xl text-[9px] font-black uppercase shadow-lg' : 'bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-[9px] font-black uppercase';
                    }

                    const kpi = document.getElementById('kpi-status');
                    if(kpi) {
                        kpi.innerText = d.data.maintenance ? 'Offline' : 'Online';
                        kpi.className = d.data.maintenance ? 'text-xs font-black text-red-500 uppercase tracking-widest' : 'text-xs font-black text-purple-500 uppercase tracking-widest';
                    }
                }
            } catch (e) {
                console.error("Error al chequear estado:", e);
            }
        }

        async function openSchoolHours() {
            document.getElementById('modal-school-hours').style.display = 'block';
            try {
                const res = await fetch('../api/admin_fetch.php?action=get_status');
                const d = await res.json();
                if(d.success) {
                    const h = d.data.school_hours;
                    document.getElementById('school-opening').value = h.opening;
                    document.getElementById('school-closing').value = h.closing;
                    const btn = document.getElementById('btn-toggle-school-hours');
                    btn.innerText = h.enabled ? 'ACTIVO' : 'DESACTIVADO';
                    btn.className = h.enabled ? 'bg-emerald-500 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg' : 'bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase';
                }
            } catch(e) { showToast("Error al cargar configuración", true); }
        }

        function toggleSchoolHoursLocal() {
            const btn = document.getElementById('btn-toggle-school-hours');
            const isActive = btn.innerText === 'ACTIVO';
            btn.innerText = isActive ? 'DESACTIVADO' : 'ACTIVO';
            btn.className = !isActive ? 'bg-emerald-500 text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg' : 'bg-white/5 border border-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase';
        }

        async function saveSchoolHours() {
            const enabled = document.getElementById('btn-toggle-school-hours').innerText === 'ACTIVO' ? '1' : '0';
            const opening = document.getElementById('school-opening').value;
            const closing = document.getElementById('school-closing').value;

            const fd = new FormData();
            fd.append('enabled', enabled);
            fd.append('opening', opening);
            fd.append('closing', closing);

            try {
                const res = await fetch('../api/admin_fetch.php?action=save_school_hours', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
                checkStatus();
            } catch(e) { showToast("Error de conexión", true); }
        }
        async function toggleHappyHour() {
            try {
                const btn = document.getElementById('btn-happy-hour');
                const s = btn.innerText.includes('OFF') ? '1' : '0';
                const fd = new FormData(); fd.append('status', s);
                const res = await fetch('../api/admin_fetch.php?action=toggle_happy_hour', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message);
                checkStatus();
            } catch (e) {
                showToast("Error de conexión", true);
            }
        }
        async function toggleMaintenance() {
            try {
                const mt = document.getElementById('btn-maintenance');
                const isOnline = mt.innerText.toLowerCase().includes('online');
                const nextStatus = isOnline ? '1' : '0';
                
                const fd = new FormData();
                fd.append('status', nextStatus);
                
                const res = await fetch('../api/admin_fetch.php?action=toggle_maintenance', { method: 'POST', body: fd });
                const d = await res.json();
                
                showToast(d.message, !d.success);
                checkStatus();
            } catch (e) {
                console.error(e);
                showToast("Error de conexión", true);
            }
        }

        // --- GESTIÓN USUARIOS ---
        let currentSort = { column: 'completed_at', direction: 'ASC' };
        function openAlumnos() { document.getElementById('modal-alumnos').style.display = 'block'; loadAlumnos(); }
        async function loadAlumnos() {
            const s = document.getElementById('alumno-search').value;
            const res = await fetch(`../api/admin_fetch.php?action=get_alumnos&order=${currentSort.column}&dir=${currentSort.direction}&search=${s}`);
            const d = await res.json();
            document.getElementById('alumnos-list').innerHTML = d.data.map(a => `
                <div class="grid grid-cols-[2fr_1fr_1fr_0.5fr_1fr] gap-4 py-6 px-6 items-center hover:bg-white/5">
                    <div>
                        <p class="font-bold text-sm text-white">${a.full_name} ${a.role === 'admin' ? '🛡️' : a.role === 'docente' ? '👨‍🏫' : ''}</p>
                        <p class="text-[9px] text-gray-500 uppercase font-black">${a.course} (@${a.username})</p>
                    </div>
                    <div class="text-center text-cyan-400 font-black text-xs">${Math.round(a.stuck_count/50*100)}%</div>
                    <div class="text-center text-[10px] font-mono">${a.completed_at ? a.completed_at.split(' ')[0] : '---'}</div>
                    <div class="text-right font-black text-white">${a.packs_available}</div>
                    <div class="text-right flex gap-2 justify-end">
                        <button onclick="openResetPass(${a.id}, '${a.full_name.replace(/'/g, "\\'")}')" class="text-[8px] font-black text-red-400 border border-red-500/30 px-2 py-1.5 rounded-lg">RESET</button>
                        <button onclick="viewAudit(${a.id}, '${a.full_name.replace(/'/g, "\\'")}')" class="text-[8px] font-black text-cyan-500 border border-cyan-500/30 px-2 py-1.5 rounded-lg">AUDITAR</button>
                    </div>
                </div>
            `).join('');
        }
        async function viewAudit(uid, name) {
            document.getElementById('modal-audit').style.display = 'block';
            document.getElementById('audit-name').innerText = name;
            const res = await fetch(`../api/admin_fetch.php?action=get_audit&user_id=${uid}`);
            const d = await res.json();
            document.getElementById('audit-list').innerHTML = d.data.map(l => `
                <div class="p-4 bg-white/5 rounded-xl flex justify-between">
                    <div><p class="text-[10px] font-black text-cyan-400 uppercase">${l.source_type}</p><p class="text-xs text-white">${l.source_id || ''}</p></div>
                    <div class="text-right font-black text-white">+${l.amount}</div>
                </div>
            `).join('');
        }

        // --- REGISTRO DOCENTE ---
        function openRegisterDocente() { document.getElementById('modal-register-docente').style.display = 'block'; }
        document.getElementById('form-register-docente').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const res = await fetch('../api/admin_fetch.php?action=register_docente', { method: 'POST', body: fd });
            const d = await res.json();
            showToast(d.message, !d.success);
            if(d.success) { closeModal('register-docente'); e.target.reset(); }
        }

        // --- QR ---
        function openQR() { document.getElementById('modal-qr').style.display = 'block'; loadQR(); }
        async function loadQR() {
            try {
                const res = await fetch('../api/admin_fetch.php?action=get_qr');
                const d = await res.json();
                
                // Agrupar por tipo
                const groups = d.data.reduce((acc, q) => {
                    const label = q.type === 'pack' ? '🎁 Sobres Gratis' : '🧠 Lanzadores de Trivia';
                    if (!acc[label]) acc[label] = [];
                    acc[label].push(q);
                    return acc;
                }, {});

                const listEl = document.getElementById('qr-list');
                if (d.data.length === 0) {
                    listEl.innerHTML = '<p class="text-center text-gray-500 py-10 uppercase text-[10px] font-black">No hay estaciones QR creadas</p>';
                    return;
                }

                listEl.innerHTML = Object.entries(groups).map(([label, items]) => `
                    <div class="mb-4">
                        <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                            <span class="text-[10px] font-black uppercase text-white tracking-widest">${label} (${items.length})</span>
                            <span class="text-gray-500 group-hover:text-white transition-colors">↕</span>
                        </button>
                        <div class="grid grid-cols-1 gap-3 mt-3 px-2">
                            ${items.map(q => `
                                <div class="p-5 list-item flex justify-between items-center rounded-2xl">
                                    <div>
                                        <h4 class="font-black text-white uppercase text-sm">${q.display_name}</h4>
                                        <p class="text-[9px] text-gray-500 font-bold uppercase">${q.total_scans} USOS TOTALES</p>
                                    </div>
                                    <button onclick="previewQR('${q.slug}', '${q.display_name}')" class="bg-cyan-500 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase">VER QR</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
            } catch (err) {
                showToast("Error al cargar estaciones QR", true);
            }
        }
        async function previewQR(slug, name) {
            const res = await fetch('../api/admin_fetch.php?action=get_url');
            const d = await res.json();
            const url = `${d.data.url}api/scan_qr.php?slug=${slug}`;
            document.getElementById('preview-title').innerText = name;
            document.getElementById('preview-url').innerText = url;
            document.getElementById('preview-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
            document.getElementById('modal-qr-view').style.display = 'block';
        }
        document.getElementById('form-register-qr').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData(); fd.append('display_name', document.getElementById('qr-name').value); fd.append('type', document.getElementById('qr-type').value);
            await fetch('../api/register_qr.php', { method: 'POST', body: fd });
            document.getElementById('qr-name').value = ''; loadQR();
        }

        // --- PROMO ---
        function openPromo() { 
            document.getElementById('modal-promo').style.display = 'block'; 
            loadTeachers(); 
            loadBatches(); 
            loadWelcomeSettings();
        }

        async function loadTeachers() {
            const res = await fetch('../api/admin_promo.php?action=get_teachers');
            const d = await res.json();
            
            // Opción para todos
            let options = '<option value="">Asignar a...</option>';
            options += '<option value="-1" class="text-purple-400 font-black">🌟 TODOS LOS DOCENTES</option>';
            options += d.data.map(t => `<option value="${t.id}">${t.role === 'admin' ? '🛡️' : '👨‍🏫'} ${t.full_name}</option>`).join('');
            
            document.getElementById('promo-teacher').innerHTML = options;
        }

        async function loadWelcomeSettings() {
            try {
                const res = await fetch('../api/admin_promo.php?action=get_promo_settings');
                const d = await res.json();
                if(d.success) {
                    const btn = document.getElementById('btn-welcome-promo');
                    btn.innerText = d.data.enabled ? 'ACTIVO' : 'DESACTIVADO';
                    btn.className = d.data.enabled 
                        ? "bg-emerald-500 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg transition-all"
                        : "bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all";
                    document.getElementById('welcome-promo-qty').value = d.data.quantity;
                }
            } catch(e) {}
        }

        async function toggleWelcomePromo() {
            const btn = document.getElementById('btn-welcome-promo');
            const nextStatus = btn.innerText === 'ACTIVO' ? '0' : '1';
            const qty = document.getElementById('welcome-promo-qty').value;
            
            const fd = new FormData();
            fd.append('enabled', nextStatus);
            fd.append('quantity', qty);
            
            const res = await fetch('../api/admin_promo.php?action=save_promo_settings', { method: 'POST', body: fd });
            const d = await res.json();
            showToast(d.message);
            loadWelcomeSettings();
        }

        async function saveWelcomeSettings() {
            const btn = document.getElementById('btn-welcome-promo');
            const status = btn.innerText === 'ACTIVO' ? '1' : '0';
            const qty = document.getElementById('welcome-promo-qty').value;
            
            const fd = new FormData();
            fd.append('enabled', status);
            fd.append('quantity', qty);
            
            const res = await fetch('../api/admin_promo.php?action=save_promo_settings', { method: 'POST', body: fd });
            const d = await res.json();
            showToast(d.message);
            loadWelcomeSettings();
        }
        async function loadBatches() {
            try {
                const res = await fetch('../api/admin_promo.php?action=get_batches');
                const d = await res.json();
                
                // Agrupar por docente
                const groups = d.data.reduce((acc, b) => {
                    const label = b.teacher_name || 'Sin Asignar';
                    if (!acc[label]) acc[label] = [];
                    acc[label].push(b);
                    return acc;
                }, {});

                const listEl = document.getElementById('promo-list');
                if (d.data.length === 0) {
                    listEl.innerHTML = '<div class="p-20 text-center glass-admin rounded-[2.5rem] border-dashed border-2 border-white/5"><p class="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">No hay lotes generados aún</p></div>';
                    return;
                }

                listEl.innerHTML = Object.entries(groups).map(([teacher, batches]) => `
                    <div class="mb-4">
                        <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                            <div class="flex items-center gap-3">
                                <span class="text-lg">👨‍🏫</span>
                                <span class="text-[10px] font-black uppercase text-white tracking-widest">${teacher} (${batches.length} Lotes)</span>
                            </div>
                            <span class="text-gray-500 group-hover:text-white transition-colors">↕</span>
                        </button>
                        <div class="grid grid-cols-1 gap-4 mt-4 px-2">
                            ${batches.map(b => `
                                <div class="glass-admin p-6 rounded-3xl border border-white/5">
                                    <div class="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 class="font-black text-white text-sm uppercase italic">${b.reference}</h4>
                                            <p class="text-[8px] text-gray-500 font-bold uppercase tracking-widest">${new Date().toLocaleDateString()}</p>
                                        </div>
                                        <div class="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                                            <span class="text-[9px] font-black text-purple-400 uppercase">${b.used_count}/${b.quantity} USADOS</span>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        ${b.codes.slice(0, 8).map(c => `
                                            <code class="bg-black/40 p-2 rounded-lg text-[10px] text-center border border-white/5 ${c.is_used ? 'line-through opacity-30 text-gray-500' : 'text-emerald-400 font-bold'}">${c.code}</code>
                                        `).join('')}
                                        ${b.codes.length > 8 ? `<div class="col-span-full text-center py-1"><span class="text-[8px] text-gray-600 font-black uppercase">... y ${b.codes.length - 8} más</span></div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('');
            } catch (err) {
                showToast("Error al cargar lotes", true);
            }
        }
        document.getElementById('form-generate-batch').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('teacher_id', document.getElementById('promo-teacher').value);
            fd.append('reference', document.getElementById('promo-reference').value);
            fd.append('quantity', document.getElementById('promo-quantity').value);
            const res = await fetch('../api/admin_promo.php?action=generate_batch', { method: 'POST', body: fd });
            const d = await res.json(); if(d.success) loadBatches(); showToast(d.message, !d.success);
        }

        // --- CONFIGS ---
        function openSettings() {
            document.getElementById('modal-settings').style.display = 'block';
            fetch('../api/admin_fetch.php?action=get_url').then(r=>r.json()).then(d=>{
                document.getElementById('base-url').value = d.data.url;
                document.getElementById('drive-base-url').value = d.data.drive_url;
                document.getElementById('cooldown-qr').value = d.data.qr_cooldown;
                document.getElementById('cooldown-trivia').value = d.data.trivia_cooldown;
            });
        }
        document.getElementById('form-settings').onsubmit = async (e) => {
            e.preventDefault();
            const fd1 = new FormData(); fd1.append('url', document.getElementById('base-url').value); fd1.append('drive_url', document.getElementById('drive-base-url').value);
            await fetch('../api/admin_fetch.php?action=save_url', { method: 'POST', body: fd1 });
            const fd2 = new FormData(); fd2.append('qr_cooldown', document.getElementById('cooldown-qr').value); fd2.append('trivia_cooldown', document.getElementById('cooldown-trivia').value);
            await fetch('../api/admin_fetch.php?action=save_cooldowns', { method: 'POST', body: fd2 });
            closeModal('settings'); showToast("Ajustes guardados");
        }

        // --- RAREZAS ---
        function updateRaritySums() {
            const rSum = ['rate-common','rate-uncommon','rate-rare','rate-holo','rate-gold'].reduce((acc,id)=>acc+parseInt(document.getElementById(id).value||0),0);
            const pSum = ['promo-p1','promo-p2','promo-p3','promo-p4','promo-p5'].reduce((acc,id)=>acc+parseInt(document.getElementById(id).value||0),0);
            
            const rEl = document.getElementById('sum-rarities');
            rEl.innerText = rSum + '%';
            rEl.className = `text-[10px] font-black px-2 py-1 rounded ${rSum===100?'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'}`;
            
            const pEl = document.getElementById('sum-promo');
            pEl.innerText = pSum + '%';
            pEl.className = `text-[10px] font-black px-2 py-1 rounded ${pSum===100?'bg-emerald-500/10 text-emerald-400':'bg-red-500/10 text-red-400'}`;
        }

        function openRarities() {
            document.getElementById('modal-rarities').style.display = 'block';
            fetch('../api/admin_fetch.php?action=get_rarities').then(r=>r.json()).then(d=>{
                document.getElementById('rate-common').value = d.data.stickers.common;
                document.getElementById('rate-uncommon').value = d.data.stickers.uncommon;
                document.getElementById('rate-rare').value = d.data.stickers.rare;
                document.getElementById('rate-holo').value = d.data.stickers.holo;
                document.getElementById('rate-gold').value = d.data.stickers.gold;
                document.getElementById('promo-p1').value = d.data.promo["1"];
                document.getElementById('promo-p2').value = d.data.promo["2"];
                document.getElementById('promo-p3').value = d.data.promo["3"];
                document.getElementById('promo-p4').value = d.data.promo["4"];
                document.getElementById('promo-p5').value = d.data.promo["5"];
                document.getElementById('trade-bonus-rate').value = d.data.trade_bonus;
                updateRaritySums();
            });
        }
        
        ['rate-common','rate-uncommon','rate-rare','rate-holo','rate-gold','promo-p1','promo-p2','promo-p3','promo-p4','promo-p5'].forEach(id => {
            document.getElementById(id).oninput = updateRaritySums;
        });

        document.getElementById('form-rarities').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('common', document.getElementById('rate-common').value);
            fd.append('uncommon', document.getElementById('rate-uncommon').value);
            fd.append('rare', document.getElementById('rate-rare').value);
            fd.append('holo', document.getElementById('rate-holo').value);
            fd.append('gold', document.getElementById('rate-gold').value);
            try {
                const res = await fetch('../api/admin_fetch.php?action=save_rarities', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
            } catch (err) {
                showToast("Error de conexión", true);
            }
        }
        document.getElementById('form-promo-rates').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('p1', document.getElementById('promo-p1').value);
            fd.append('p2', document.getElementById('promo-p2').value);
            fd.append('p3', document.getElementById('promo-p3').value);
            fd.append('p4', document.getElementById('promo-p4').value);
            fd.append('p5', document.getElementById('promo-p5').value);
            try {
                const res = await fetch('../api/admin_fetch.php?action=save_promo_rates', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
            } catch (err) {
                showToast("Error de conexión", true);
            }
        }
        document.getElementById('form-trade-bonus').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('rate', document.getElementById('trade-bonus-rate').value);
            try {
                const res = await fetch('../api/admin_fetch.php?action=save_trade_bonus', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
            } catch (err) {
                showToast("Error de conexión", true);
            }
        }

        // --- PODIO ---
        function openPodium() { document.getElementById('modal-podium').style.display = 'block'; showPodiumTab('view'); }
        function showPodiumTab(tab) {
            const v = document.getElementById('podium-tab-view'), m = document.getElementById('podium-tab-manage');
            if(tab === 'view') { v.classList.remove('hidden'); m.classList.add('hidden'); loadPodiumData(); }
            else { v.classList.add('hidden'); m.classList.remove('hidden'); loadCourseShifts(); }
        }
        async function togglePodiumRestriction() {
            const btn = document.getElementById('btn-toggle-podium-res');
            const currentActive = btn.getAttribute('data-active') === '1';
            const newStatus = currentActive ? '0' : '1';
            
            const fd = new FormData();
            fd.append('status', newStatus);
            
            try {
                const res = await fetch('../api/admin_fetch.php?action=toggle_podium_restriction', { method: 'POST', body: fd });
                const d = await res.json();
                if(d.success) {
                    showToast(d.message);
                    loadPodiumData();
                } else {
                    showToast(d.message, true);
                }
            } catch (err) {
                console.error(err);
                showToast("Error de conexión", true);
            }
        }
        async function loadPodiumData() {
            try {
                const res = await fetch('../api/admin_fetch.php?action=get_podium');
                const d = await res.json();
                
                const btnRes = document.getElementById('btn-toggle-podium-res');
                const isRestricted = !!d.data.restriction;
                
                if (isRestricted) {
                    btnRes.setAttribute('data-active', '1');
                    btnRes.innerText = "Restricción Turno: ON";
                    btnRes.className = "bg-emerald-500 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all";
                } else {
                    btnRes.setAttribute('data-active', '0');
                    btnRes.innerText = "Restricción Turno: OFF";
                    btnRes.className = "bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all";
                }

                document.getElementById('podium-tab-view').innerHTML = d.data.podiums.map(p => {
                    const winners = p.official_podium;
                    if (winners.length === 0) {
                        return `
                            <div class="mb-10 text-center">
                                <h3 class="text-xl font-black uppercase text-white mb-6">${p.album_name}</h3>
                                <div class="p-10 glass-admin rounded-[2.5rem] border-dashed border-2 border-white/5">
                                    <p class="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">Aún no hay ganadores en este álbum</p>
                                </div>
                            </div>
                        `;
                    }

                    const first = winners[0];
                    const second = winners[1] || null;
                    const third = winners[2] || null;

                    return `
                        <div class="mb-20">
                            <h3 class="text-2xl font-black uppercase text-center mb-12 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">${p.album_name}</h3>

                            <div class="flex items-end justify-center gap-2 md:gap-4 mb-16 h-64">
                                <!-- 2DO -->
                                <div class="flex flex-col items-center">
                                    <div class="mb-3 text-center">
                                        <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">2º PUESTO</p>
                                        <p class="text-[10px] font-bold text-white truncate w-24">${second ? second.full_name : '---'}</p>
                                    </div>
                                    <div class="w-24 md:w-28 bg-gradient-to-b from-slate-700/20 to-slate-900/40 border-t-2 border-slate-400/50 rounded-t-2xl flex items-center justify-center text-3xl font-black text-slate-400/20 relative overflow-hidden" style="height: 110px;">
                                        2
                                        <div class="absolute inset-0 bg-white/5"></div>
                                    </div>
                                </div>

                                <!-- 1RO -->
                                <div class="flex flex-col items-center">
                                    <div class="mb-3 text-center scale-110">
                                        <div class="text-xl mb-1">👑</div>
                                        <p class="text-[7px] font-black text-yellow-500 uppercase tracking-widest mb-1">1º PUESTO</p>
                                        <p class="text-[11px] font-black text-white truncate w-28 md:w-32">${first.full_name}</p>
                                    </div>
                                    <div class="w-28 md:w-32 bg-gradient-to-b from-yellow-600/20 to-yellow-900/40 border-t-4 border-yellow-500 rounded-t-3xl flex items-center justify-center text-6xl font-black text-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-hidden" style="height: 170px;">
                                        1
                                        <div class="absolute inset-0 bg-yellow-400/5"></div>
                                    </div>
                                </div>

                                <!-- 3RO -->
                                <div class="flex flex-col items-center">
                                    <div class="mb-3 text-center">
                                        <p class="text-[7px] font-black text-orange-700 uppercase tracking-widest mb-1">3º PUESTO</p>
                                        <p class="text-[10px] font-bold text-white truncate w-24">${third ? third.full_name : '---'}</p>
                                    </div>
                                    <div class="w-24 md:w-28 bg-gradient-to-b from-orange-900/10 to-slate-900/40 border-t-2 border-orange-800/50 rounded-t-2xl flex items-center justify-center text-2xl font-black text-orange-800/20 relative overflow-hidden" style="height: 80px;">
                                        3
                                        <div class="absolute inset-0 bg-orange-500/5"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="max-w-xl mx-auto space-y-3">
                                ${winners.map((w,i) => `
                                    <div class="p-4 glass-admin rounded-2xl flex justify-between items-center hover:bg-white/5 transition-all group">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black ${i===0?'text-yellow-500':i===1?'text-slate-400':i===2?'text-orange-700':'text-gray-500'}">
                                                #${i+1}
                                            </div>
                                            <div>
                                                <p class="text-xs font-black text-white uppercase">${w.full_name}</p>
                                                <p class="text-[8px] font-bold text-gray-500 uppercase tracking-widest">${w.course} • Turno ${w.shift}</p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <p class="text-cyan-400 font-mono text-[10px] font-black">${w.completed_at.split(' ')[0]}</p>
                                            <p class="text-[8px] font-bold text-gray-600 uppercase">En ${w.duration_formatted}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('');

            } catch (err) {
                showToast("Error al cargar datos del podio", true);
            }
        }
        async function loadCourseShifts() {
            const res = await fetch('../api/admin_fetch.php?action=get_courses_shifts');
            const d = await res.json();
            
            const listContainer = document.getElementById('course-shift-list');
            
            // Renderizar encabezado con formulario de agregado
            let html = `
                <div class="mb-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
                    <p class="text-[9px] font-black text-cyan-400 uppercase mb-3 tracking-widest">Registrar Nuevo Curso</p>
                    <div class="flex gap-2">
                        <input type="text" id="new-course-name" placeholder="Ej: 7°1" class="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase">
                        <select id="new-course-shift" class="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-[10px] text-white">
                            <option value="mañana">TM</option>
                            <option value="tarde">TT</option>
                            <option value="vespertino" selected>TV</option>
                        </select>
                        <button onclick="addCourseManual()" class="bg-cyan-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase">Añadir</button>
                    </div>
                </div>
            `;

            if (d.data.length === 0) {
                html += '<p class="text-center text-gray-500 py-4 uppercase text-[9px] font-black">No hay cursos configurados</p>';
            } else {
                html += d.data.map(c => `
                    <div class="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                        <div>
                            <span class="text-xs font-black text-white uppercase">${c.course}</span>
                            <p class="text-[8px] text-gray-500 font-bold uppercase mt-0.5">Turno Actual: ${c.shift}</p>
                        </div>
                        <div class="flex items-center gap-3">
                            <select onchange="updateCourseShift('${c.course}', this.value)" class="bg-slate-900 border border-white/10 text-[10px] px-2 py-1.5 rounded-lg text-white font-bold">
                                <option value="mañana" ${c.shift==='mañana'?'selected':''}>TM</option>
                                <option value="tarde" ${c.shift==='tarde'?'selected':''}>TT</option>
                                <option value="vespertino" ${c.shift==='vespertino'?'selected':''}>TV</option>
                            </select>
                            <button onclick="deleteCourseShift('${c.course}')" class="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                <span class="text-xs">✕</span>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
            listContainer.innerHTML = html;
        }

        async function addCourseManual() {
            const name = document.getElementById('new-course-name').value.trim();
            const shift = document.getElementById('new-course-shift').value;
            if(!name) return showToast("El nombre del curso es obligatorio", true);
            
            const fd = new FormData();
            fd.append('course', name);
            fd.append('shift', shift);
            
            const res = await fetch('../api/admin_fetch.php?action=save_course_shift', { method: 'POST', body: fd });
            const d = await res.json();
            showToast(d.message, !d.success);
            if(d.success) {
                document.getElementById('new-course-name').value = '';
                loadCourseShifts();
            }
        }

        async function deleteCourseShift(course) {
            if(!confirm(`¿Estás seguro de eliminar el curso ${course}? Se perderá la configuración de su turno.`)) return;
            const fd = new FormData();
            fd.append('course', course);
            const res = await fetch('../api/admin_fetch.php?action=delete_course_shift', { method: 'POST', body: fd });
            const d = await res.json();
            showToast(d.message, !d.success);
            loadCourseShifts();
        }

        async function updateCourseShift(c, s) {
            const fd = new FormData(); fd.append('course', c); fd.append('shift', s);
            await fetch('../api/admin_fetch.php?action=save_course_shift', { method: 'POST', body: fd });
            showToast("Turno actualizado");
            loadCourseShifts(); // Recargar para actualizar los textos
        }

        // --- MISC ---
        function openChangePass() { document.getElementById('modal-change-pass').style.display = 'block'; }
        document.getElementById('form-change-pass').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('current_password', document.getElementById('pass-current').value);
            fd.append('new_password', document.getElementById('pass-new').value);
            try {
                const res = await fetch('../api/admin_fetch.php?action=change_my_password', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
                if(d.success) {
                    closeModal('change-pass');
                    e.target.reset();
                }
            } catch (err) {
                showToast("Error de conexión con el servidor", true);
            }
        }

        let pendingResetId = 0;
        function openResetPass(uid, name) {
            pendingResetId = uid;
            document.getElementById('reset-user-name').innerText = name;
            document.getElementById('modal-reset-pass').style.display = 'block';
        }
        async function confirmResetPass() {
            const fd = new FormData(); fd.append('user_id', pendingResetId);
            try {
                const res = await fetch('../api/admin_fetch.php?action=reset_user_password', { method: 'POST', body: fd });
                const d = await res.json();
                if(d.success) {
                    document.getElementById('reset-actions').classList.add('hidden');
                    document.getElementById('reset-result').classList.remove('hidden');
                    document.getElementById('new-temp-pass').innerText = d.data.new_password;
                    document.getElementById('btn-reset-done').classList.remove('hidden');
                } else {
                    showToast(d.message, true);
                }
            } catch (err) {
                showToast("Error de conexión con el servidor", true);
            }
        }

        // --- SIMULADOR ---
        let simStats = { common: 0, uncommon: 0, rare: 0, holo: 0, gold: 0, packs: 0 };
        function openSimulator() { document.getElementById('modal-simulator').style.display = 'block'; }
        
        async function runSimulation(count = 1) {
            const container = document.getElementById('sim-results');
            container.innerHTML = '';
            simStats.packs += count;

            for (let i = 0; i < count; i++) {
                const res = await fetch('../api/admin_fetch.php?action=test_open_pack');
                const d = await res.json();
                
                d.data.stickers.forEach(s => {
                    if (s.rarity === 'common') simStats.common++;
                    else if (s.rarity === 'uncommon') simStats.uncommon++;
                    else if (s.rarity === 'rare') simStats.rare++;
                    else if (s.rarity === 'holo') simStats.holo++;
                    else if (s.rarity === 'gold') simStats.gold++;

                    const card = document.createElement('div');
                    // Aplicar marcos de rareza
                    const frameClass = `frame-${s.rarity}`;
                    card.className = `aspect-[3/4] rounded-lg overflow-hidden border-2 ${frameClass} bg-white/5 relative group`;
                    
                    // Efectos especiales para Gold y Holo
                    let specialEffects = '';
                    if (s.rarity === 'gold') specialEffects = '<div class="gold-aura"></div><div class="gold-sweep"></div>';
                    if (s.rarity === 'holo') specialEffects = '<div class="overlay-holo"></div>';
                    if (s.rarity === 'rare') specialEffects = '<div class="overlay-rare"></div>';

                    card.innerHTML = `
                        <div class="w-full h-full relative">
                            ${specialEffects}
                            <img src="${s.external_url}" class="w-full h-full object-cover group-hover:scale-110 transition-transform ${s.rarity === 'gold' ? 'gold-filter' : ''}">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-2">
                                <p class="text-[7px] font-black uppercase text-white truncate">${s.name}</p>
                                <div class="flex justify-between items-center mt-0.5">
                                    <p class="text-[6px] text-cyan-400 font-bold uppercase">#${s.number}</p>
                                    <span class="text-[5px] px-1 rounded bg-white/10 font-black uppercase">${s.rarity}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }
            updateSimUI();
        }

        function updateSimUI() {
            document.getElementById('sim-count-common').innerText = simStats.common;
            document.getElementById('sim-count-uncommon').innerText = simStats.uncommon;
            document.getElementById('sim-count-rare').innerText = simStats.rare;
            document.getElementById('sim-count-holo').innerText = simStats.holo;
            document.getElementById('sim-count-gold').innerText = simStats.gold;
            document.getElementById('sim-count-packs').innerText = simStats.packs;
        }

        function resetSimStats() {
            simStats = { common: 0, uncommon: 0, rare: 0, holo: 0, gold: 0, packs: 0 };
            document.getElementById('sim-results').innerHTML = '';
            updateSimUI();
        }

        // --- SUGERENCIAS ---
        let hideImplemented = false;
        function toggleImplementedFilter() {
            hideImplemented = !hideImplemented;
            const btn = document.getElementById('btn-toggle-implemented');
            btn.innerText = `Ocultar Hechos: ${hideImplemented ? 'ON' : 'OFF'}`;
            btn.className = hideImplemented 
                ? "bg-amber-500 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase shadow-lg transition-all"
                : "bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all";
            loadSuggestions();
        }

        function openSuggestions() {
            document.getElementById('modal-suggestions').style.display = 'block';
            loadSuggestions();
        }

        async function loadSuggestions() {
            const container = document.getElementById('suggestions-container');
            
            try {
                const res = await fetch('../api/admin_fetch.php?action=get_suggestions');
                const d = await res.json();
                
                let filteredData = d.data;
                if (hideImplemented) {
                    filteredData = d.data.filter(s => s.status !== 'implemented');
                }

                if (filteredData.length === 0) {
                    container.innerHTML = '<div class="p-20 text-center glass-admin rounded-[2.5rem] border-dashed border-2 border-white/5"><p class="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">No hay sugerencias que mostrar</p></div>';
                    return;
                }

                // Agrupar por categoría
                const categories = {
                    'bug': { label: '🐛 Bugs Reportados', color: 'text-red-400' },
                    'idea': { label: '💡 Ideas Nuevas', color: 'text-amber-400' },
                    'mejora': { label: '📈 Mejoras Técnicas', color: 'text-blue-400' },
                    'otro': { label: '❓ Otros', color: 'text-gray-400' }
                };

                const grouped = filteredData.reduce((acc, s) => {
                    if (!acc[s.category]) acc[s.category] = [];
                    acc[s.category].push(s);
                    return acc;
                }, {});

                container.innerHTML = Object.entries(categories).map(([key, info]) => {
                    const items = grouped[key] || [];
                    if (items.length === 0) return '';

                    return `
                        <div class="mb-4">
                            <button onclick="this.nextElementSibling.classList.toggle('hidden')" class="w-full flex justify-between items-center p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                                <div class="flex items-center gap-6">
                                    <span class="text-sm font-black uppercase ${info.color} italic">${info.label}</span>
                                    <span class="bg-white/5 px-3 py-1 rounded-full text-xs font-black text-gray-500">${items.length}</span>
                                </div>
                                <span class="text-gray-400 group-hover:text-white transition-colors">↕</span>
                            </button>
                            <div class="space-y-4 mt-6 px-4">
                                ${items.map(s => {
                                    const statusColors = {
                                        'pending': 'bg-red-500/20 text-red-400 border-red-500/30',
                                        'read': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                                        'implemented': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    };
                                    const currentColor = statusColors[s.status] || 'bg-slate-900 text-white border-white/10';

                                    return `
                                        <div class="glass-admin p-8 rounded-[2rem] border-white/5 flex flex-col md:flex-row justify-between gap-6 ${s.status === 'implemented' ? 'opacity-60' : ''}">
                                            <div class="flex-1">
                                                <div class="flex items-center gap-4 mb-3">
                                                    <span class="text-sm font-black text-white uppercase">${s.full_name}</span>
                                                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">${s.course} • ${new Date(s.created_at).toLocaleString()}</span>
                                                    ${s.status === 'implemented' ? '<span class="text-[9px] font-black bg-emerald-500 text-black px-3 py-1 rounded-full uppercase tracking-tighter">IMPLEMENTADO</span>' : ''}
                                                </div>
                                                <p class="text-lg text-gray-200 italic leading-relaxed font-medium">"${s.suggestion}"</p>
                                            </div>
                                            <div class="flex items-center gap-4 h-fit self-end md:self-center">
                                                <select onchange="updateSuggestionStatus(${s.id}, this.value, this)" class="${currentColor} border rounded-xl px-4 py-3 text-xs font-black uppercase outline-none transition-all cursor-pointer">
                                                    <option value="pending" ${s.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                                                    <option value="read" ${s.status === 'read' ? 'selected' : ''}>Leída</option>
                                                    <option value="implemented" ${s.status === 'implemented' ? 'selected' : ''}>¡Hecho!</option>
                                                </select>
                                                <button onclick="deleteSuggestion(${s.id})" class="text-red-500/40 hover:text-red-500 p-3 transition-colors text-xl">🗑️</button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('');

            } catch (err) {
                showToast("Error al cargar sugerencias", true);
            }
        }

        async function updateSuggestionStatus(id, status, selectEl) {
            const fd = new FormData();
            fd.append('id', id);
            fd.append('status', status);
            try {
                const res = await fetch('../api/admin_fetch.php?action=update_suggestion_status', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
                
                if (d.success) {
                    // Actualizar color del select inmediatamente
                    const statusColors = {
                        'pending': 'bg-red-500/20 text-red-400 border-red-500/30',
                        'read': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                        'implemented': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    };
                    selectEl.className = `${statusColors[status]} border rounded-xl px-3 py-2 text-[8px] font-black uppercase outline-none transition-all`;
                    
                    // Si el filtro de "Ocultar" está activo y marcamos como implementado, recargar
                    if (hideImplemented && status === 'implemented') {
                        setTimeout(() => loadSuggestions(), 500);
                    }
                }
            } catch (err) { showToast("Error de conexión", true); }
        }

        async function deleteSuggestion(id) {
            if (!confirm("¿Eliminar esta sugerencia permanentemente?")) return;
            const fd = new FormData();
            fd.append('id', id);
            try {
                const res = await fetch('../api/admin_fetch.php?action=delete_suggestion', { method: 'POST', body: fd });
                const d = await res.json();
                showToast(d.message, !d.success);
                if (d.success) loadSuggestions();
            } catch (err) { showToast("Error de conexión", true); }
        }

        // --- INICIALIZACIÓN ---
        checkStatus();
    </script>
</body>
</html>
