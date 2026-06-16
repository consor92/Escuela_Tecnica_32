<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';
requireLogin();

// 1. Verificación de Seguridad: Solo Docente o Admin
$user = getCurrentUser($pdo);
if ($user['role'] !== 'docente' && $user['role'] !== 'admin') {
    header("Location: ../dashboard.php");
    exit;
}

// 2. Obtener Alumnos (con buscador)
$search = $_GET['search'] ?? '';
$sql = "SELECT id, username, full_name, course FROM users WHERE role = 'alumno'";
if ($search) {
    $sql .= " AND (full_name LIKE ? OR username LIKE ?)";
}
$sql .= " ORDER BY course ASC, full_name ASC";

$stmtAlumnos = $pdo->prepare($sql);
if ($search) {
    $stmtAlumnos->execute(["%$search%", "%$search%"]);
} else {
    $stmtAlumnos->execute();
}
$alumnos = $stmtAlumnos->fetchAll();

// 3. Obtener Códigos Propios (Asignados a este Docente)
$stmtCodes = $pdo->prepare("
    SELECT c.*, b.reference, u.full_name as used_by, upc.used_at
    FROM promo_codes c
    JOIN promo_batches b ON c.batch_id = b.id
    LEFT JOIN user_promo_codes upc ON c.id = upc.code_id
    LEFT JOIN users u ON upc.user_id = u.id
    WHERE b.teacher_id = ?
    ORDER BY c.created_at DESC
");
$stmtCodes->execute([$user['id']]);
$myCodes = $stmtCodes->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Docente - Gestión</title>
    <link rel="icon" type="image/x-icon" href="../assets/img/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #020617; color: white; min-height: 100vh; overflow-x: hidden; }
        .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .neon-text-cian { color: #22d3ee; text-shadow: 0 0 15px rgba(34, 211, 238, 0.4); }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

        /* BURGER MENU & HEADER STYLE */
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
        @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .menu-item {
            display: flex; items-center: center; gap: 0.75rem; padding: 0.75rem 1rem;
            border-radius: 1rem; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
            color: white; transition: all 0.2s;
        }
        .menu-item:hover { background: rgba(255,255,255,0.05); }
        .menu-item span { font-size: 1.1rem; }
        .menu-item.logout { color: #f87171; margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); pt: 1rem; border-radius: 0; }

        .btn-close-modal {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1.25rem;
            border-radius: 1.75rem;
            display: block;
            width: 100%;
            color: #64748b !important;
        }
        .btn-close-modal:hover { background: rgba(34, 211, 238, 0.15); }
    </style>
</head>
<body class="p-6 md:p-10">

    <div class="max-w-6xl mx-auto space-y-10">
        <!-- HEADER -->
        <header class="flex justify-between items-center mb-8 relative">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-neon-gradient rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-cyan-500/20">
                    👨‍🏫
                </div>
                <div>
                    <h1 class="text-2xl font-black italic uppercase leading-none text-white">Panel Docente</h1>
                    <p class="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Gestión de Alumnos</p>
                </div>
            </div>

            <!-- MENU CONTEXTUAL ESTILO ALUMNO -->
            <div class="relative">
                <button onclick="toggleUserMenu()" class="w-12 h-12 glass-card rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all group">
                    <div class="w-5 h-0.5 bg-white rounded-full group-hover:scale-x-110 transition-transform"></div>
                    <div class="w-5 h-0.5 bg-white rounded-full group-hover:scale-x-110 transition-transform"></div>
                    <div class="w-5 h-0.5 bg-white rounded-full group-hover:scale-x-110 transition-transform"></div>
                </button>

                <div id="user-menu">
                    <div class="px-4 py-2 border-b border-white/5 mb-2">
                        <p class="text-[10px] font-black text-white uppercase truncate"><?php echo $user['full_name']; ?></p>
                        <p class="text-[8px] font-bold text-emerald-500 uppercase">Docente Activo</p>
                    </div>

                    <button onclick="openModal('profile'); toggleUserMenu()" class="menu-item w-full">
                        <span>👤</span> Mi Perfil
                    </button>

                    <button onclick="openModal('suggestion'); toggleUserMenu()" class="menu-item w-full">
                        <span>💡</span> Sugerencias
                    </button>

                    <?php if(isset($user['is_admin']) && $user['is_admin']): ?>
                        <a href="../admin/dashboard.php" class="menu-item">
                            <span>🛡️</span> Panel Maestro
                        </a>
                    <?php endif; ?>

                    <a href="../api/logout.php" class="menu-item logout">
                        <span>🚪</span> Cerrar Sesión
                    </a>
                </div>
            </div>
        </header>

        <main class="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            <!-- SECCIÓN 1: BLANQUEO DE CONTRASEÑAS -->
            <section class="glass-card rounded-[3rem] p-8 flex flex-col h-[650px]">
                <div class="mb-8">
                    <h2 class="text-2xl font-black italic uppercase text-cyan-400 mb-2">Blanqueo de Claves</h2>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-6">Resetea el acceso de cualquier alumno a una clave aleatoria</p>
                    
                    <form action="" method="GET" class="relative">
                        <input type="text" name="search" placeholder="Buscar por Nombre o Usuario..." value="<?php echo htmlspecialchars($search); ?>" class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-cyan-500 pr-24 transition-all">
                        <button type="submit" class="absolute right-2 top-2 bottom-2 bg-cyan-500 text-black font-black px-4 rounded-xl text-[10px] uppercase">BUSCAR</button>
                    </form>
                </div>

                <div class="flex-1 overflow-y-auto custom-scroll pr-2 space-y-3">
                    <?php if (empty($alumnos)): ?>
                        <p class="text-center py-20 text-gray-600 font-bold uppercase tracking-widest italic">No se encontraron alumnos</p>
                    <?php endif; ?>

                    <?php foreach ($alumnos as $al): ?>
                        <div class="bg-white/5 border border-white/5 p-5 rounded-[1.5rem] flex justify-between items-center hover:border-cyan-500/30 transition-all">
                            <div>
                                <h4 class="font-black text-white text-sm leading-none mb-1"><?php echo htmlspecialchars($al['full_name']); ?></h4>
                                <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">CURSO: <?php echo htmlspecialchars($al['course']); ?> • @<?php echo htmlspecialchars($al['username']); ?></p>
                            </div>
                            <button onclick="openResetPass(<?php echo $al['id']; ?>, '<?php echo addslashes($al['full_name']); ?>')" class="bg-white/5 hover:bg-red-500 hover:text-white text-gray-400 border border-white/10 px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all">RESETEAR</button>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <!-- SECCIÓN 2: MIS CÓDIGOS -->
            <section class="glass-card rounded-[3rem] p-8 flex flex-col h-[650px]">
                <div class="mb-8">
                    <h2 class="text-2xl font-black italic uppercase text-emerald-400 mb-2">Mis Códigos Activos</h2>
                    <p class="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-6">Listado de tickets generados para tu entrega</p>
                </div>

                <div class="flex-1 overflow-y-auto custom-scroll pr-2 space-y-4">
                    <?php if (empty($myCodes)): ?>
                        <p class="text-center py-20 text-gray-600 font-bold uppercase tracking-widest italic">No tienes códigos asignados</p>
                    <?php endif; ?>

                    <?php foreach ($myCodes as $c): ?>
                        <div class="bg-white/5 border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <span class="text-2xl font-black tracking-widest text-emerald-400 block mb-1"><?php echo htmlspecialchars($c['code']); ?></span>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase italic"><?php echo htmlspecialchars($c['reference']); ?></p>
                                </div>
                                <div class="text-right">
                                    <span class="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black text-white"><?php echo $c['used_by_count']; ?> / <?php echo $c['max_uses']; ?> USOS</span>
                                </div>
                            </div>
                            
                            <div class="flex justify-between items-center pt-4 border-t border-white/5">
                                <div>
                                    <span class="text-[8px] font-black <?php echo $c['is_used'] ? 'text-red-500' : 'text-emerald-500'; ?> uppercase tracking-widest block mb-1">
                                        ● <?php echo $c['is_used'] ? 'AGOTADO' : 'DISPONIBLE'; ?>
                                    </span>
                                    <?php if($c['is_used'] && $c['used_by']): ?>
                                        <p class="text-[7px] text-white font-bold uppercase">
                                            Canjeado por: <span class="text-cyan-400"><?php echo htmlspecialchars($c['used_by']); ?></span>
                                            <br>
                                            <span class="text-gray-500 font-mono italic"><?php echo date('d/m H:i', strtotime($c['used_at'])); ?> hs</span>
                                        </p>
                                    <?php endif; ?>
                                </div>
                                <span class="text-[8px] text-gray-600 font-mono italic">VENCE: <?php echo date('d/m/Y', strtotime($c['expires_at'])); ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>
        </main>
    </div>

    <!-- MODAL MI PERFIL -->
    <div id="modal-profile" class="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] hidden flex items-center justify-center p-6">
        <div class="glass-card w-full max-w-sm rounded-[3rem] p-10 border-emerald-500/20 border-2 text-center">
            <h2 class="text-2xl font-black italic uppercase text-emerald-400 mb-8">Mi Perfil</h2>
            
            <div class="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
                <p class="text-xs font-black text-white uppercase mb-1"><?php echo htmlspecialchars($user['full_name']); ?></p>
                <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Docente de E.T. 32</p>
            </div>

            <form id="form-change-pass" class="space-y-4">
                <h3 class="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cambiar Contraseña</h3>
                <input type="password" id="pass-current" placeholder="Clave Actual" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-sm font-black text-white outline-none focus:border-emerald-500">
                <input type="password" id="pass-new" placeholder="Nueva Clave" required class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-sm font-black text-white outline-none focus:border-emerald-500">
                <button type="submit" class="w-full bg-emerald-500 text-black py-4 rounded-[1.5rem] font-black uppercase text-xs shadow-xl hover:scale-105 transition-all">Actualizar Clave</button>
            </form>

            <button onclick="closeModal('profile')" class="w-full text-gray-600 font-black uppercase text-[10px] mt-8 tracking-widest">Cancelar</button>
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
                    <option value="idea" class="bg-slate-900 text-white">💡 Una Idea</option>
                    <option value="bug" class="bg-slate-900 text-white">🐛 Reportar Bug</option>
                    <option value="mejora" class="bg-slate-900 text-white">📈 Mejora Técnica</option>
                    <option value="otro" class="bg-slate-900 text-white">❓ Otro</option>
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

    <!-- MODAL RESET PASS -->
    <div id="modal-reset-pass" class="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] hidden flex items-center justify-center p-6">
        <div class="glass-card w-full max-w-sm rounded-[3rem] p-10 border-red-500/20 border-2 text-center">
            <h2 class="text-2xl font-black italic uppercase text-red-500 mb-4">Blanqueo de Claves</h2>
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

    <div id="toast-container" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] pointer-events-none"></div>

    <script>
        function showToast(msg, isError = false) {
            const toast = document.createElement('div');
            toast.className = `px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl mb-2 transition-all duration-300 animate-bounce ${isError ? 'bg-red-500 text-white' : 'bg-white text-black'}`;
            toast.textContent = msg;
            document.getElementById('toast-container').appendChild(toast);
            setTimeout(() => { toast.classList.add('opacity-0'); setTimeout(() => toast.remove(), 300); }, 3000);
        }

        function toggleUserMenu() {
            const menu = document.getElementById('user-menu');
            menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
        }

        // Cerrar menú si se hace clic fuera
        window.onclick = function(event) {
            if (!event.target.closest('.relative')) {
                document.getElementById('user-menu').style.display = 'none';
            }
        }

        function openModal(id) { document.getElementById('modal-' + id).classList.remove('hidden'); }
        function closeModal(id) { 
            document.getElementById('modal-' + id).classList.add('hidden'); 
            if(id === 'reset-pass') {
                document.getElementById('reset-actions').classList.remove('hidden');
                document.getElementById('reset-result').classList.add('hidden');
                document.getElementById('btn-reset-done').classList.add('hidden');
            }
        }

        // Manejo de Sugerencias
        const suggText = document.getElementById('suggestion-text');
        const suggCounter = document.getElementById('suggestion-counter');
        
        if(suggText) {
            suggText.addEventListener('input', () => {
                suggCounter.innerText = `${suggText.value.length} / 255`;
                suggCounter.className = suggText.value.length >= 250 ? 'text-[8px] font-black text-red-500 uppercase' : 'text-[8px] font-black text-gray-500 uppercase';
            });
        }

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
                const res = await fetch('../api/send_suggestion.php', { 
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

        let pendingResetId = 0;
        function openResetPass(uid, name) {
            pendingResetId = uid;
            document.getElementById('reset-user-name').innerText = name;
            openModal('reset-pass');
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
            } catch (err) { showToast("Error de conexión", true); }
        }

        document.getElementById('form-change-pass').onsubmit = async (e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.append('current_password', document.getElementById('pass-current').value);
            fd.append('new_password', document.getElementById('pass-new').value);

            try {
                const res = await fetch('../api/admin_fetch.php?action=change_my_password', { method: 'POST', body: fd });
                const data = await res.json();
                showToast(data.message, !data.success);
                if(data.success) {
                    setTimeout(() => closeModal('profile'), 1000);
                    e.target.reset();
                }
            } catch (err) {
                showToast("Error de conexión", true);
            }
        }
    </script>
</body>
</html>
