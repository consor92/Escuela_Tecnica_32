<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';
if (isLoggedIn()) {
    $user = getCurrentUser($pdo);
    if ($user && $user['is_admin']) {
        header("Location: admin/dashboard.php");
    } else {
        header("Location: dashboard.php");
    }
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Álbum 32: Camino al 20 de Junio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Outfit', sans-serif;
            background: radial-gradient(circle at top right, #1e1b4b, #0f172a, #020617);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
            overflow-x: hidden;
        }
        .glass {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }
        .neon-border-cian:focus {
            border-color: #22d3ee;
            box-shadow: 0 0 15px rgba(34, 211, 238, 0.5);
            outline: none;
        }
        .neon-text-violet {
            text-shadow: 0 0 10px #a78bfa;
        }
        .btn-gradient {
            background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%);
            transition: all 0.3s ease;
        }
        .btn-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(124, 58, 237, 0.6);
        }
        .tab-active {
            border-bottom: 3px solid #22d3ee;
            color: #22d3ee;
        }
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .toast {
            position: fixed; top: 20px; right: 20px; padding: 1rem 2rem; border-radius: 1rem;
            backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);
            transform: translateX(120%); transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            z-index: 1000; font-weight: bold;
        }
        .toast.show { transform: translateX(0); }
        .toast-error { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border-color: rgba(239, 68, 68, 0.3); }
        .toast-success { background: rgba(34, 211, 238, 0.2); color: #22d3ee; border-color: rgba(34, 211, 238, 0.3); }
    </style>
</head>
<body>

    <div id="custom-toast" class="toast"></div>

    <div class="w-full max-w-md glass rounded-3xl p-8 relative overflow-hidden">
        <!-- Decoración -->
        <div class="absolute -top-10 -right-10 w-32 h-32 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse-slow"></div>
        <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse-slow"></div>

        <div class="text-center mb-8">
            <h1 class="text-4xl font-extrabold text-white mb-2 neon-text-violet italic">ÁLBUM 32</h1>
            <p class="text-gray-400 text-sm tracking-widest uppercase">Camino al 20 de Junio</p>
        </div>

        <!-- Switch de Formulario -->
        <div class="flex justify-center mb-8 border-b border-white/10">
            <button id="tab-login" class="px-6 py-2 text-white font-semibold transition-all tab-active" onclick="showForm('login')">Login</button>
            <button id="tab-register" class="px-6 py-2 text-gray-500 font-semibold transition-all" onclick="showForm('register')">Registro</button>
        </div>

        <!-- Formulario Login -->
        <form id="form-login" class="space-y-5">
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-2 ml-1">Usuario</label>
                <input type="text" name="username" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white neon-border-cian transition-all" placeholder="Tu usuario">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-2 ml-1">Contraseña</label>
                <input type="password" name="password" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white neon-border-cian transition-all" placeholder="••••••••">
            </div>
            <button type="submit" class="w-full btn-gradient py-4 rounded-xl text-white font-bold text-lg mt-4">ENTRAR AL SISTEMA</button>
        </form>

        <!-- Formulario Registro -->
        <form id="form-register" class="space-y-4 hidden">
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">Nombre Completo</label>
                <input type="text" name="full_name" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white neon-border-cian transition-all">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">Usuario</label>
                <input type="text" name="username" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white neon-border-cian transition-all">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">Curso (Ej: 4to 1ra)</label>
                <input type="text" name="course" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white neon-border-cian transition-all">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">Contraseña</label>
                <input type="password" name="password" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white neon-border-cian transition-all" placeholder="••••••••">
            </div>
            <button type="submit" class="w-full btn-gradient py-4 rounded-xl text-white font-bold text-lg mt-4">CREAR CUENTA</button>
        </form>
    </div>

    <script>
        function showForm(type) {
            const login = document.getElementById('form-login');
            const register = document.getElementById('form-register');
            const tabL = document.getElementById('tab-login');
            const tabR = document.getElementById('tab-register');

            if(type === 'login') {
                login.classList.remove('hidden');
                register.classList.add('hidden');
                tabL.classList.add('tab-active');
                tabL.classList.remove('text-gray-500');
                tabR.classList.remove('tab-active');
                tabR.classList.add('text-gray-500');
            } else {
                login.classList.add('hidden');
                register.classList.remove('hidden');
                tabR.classList.add('tab-active');
                tabR.classList.remove('text-gray-500');
                tabL.classList.remove('tab-active');
                tabL.classList.add('text-gray-500');
            }
        }

        function showNotification(msg, type = 'success') {
            const toast = document.getElementById('custom-toast');
            toast.textContent = msg;
            toast.className = `toast show toast-${type}`;
            setTimeout(() => toast.classList.remove('show'), 3000);
        }

        // Manejo de Forms con Fetch
        document.querySelectorAll('form').forEach(form => {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const formData = new FormData(form);
                const endpoint = form.id === 'form-login' ? 'api/login.php' : 'api/register.php';
                
                try {
                    const res = await fetch(endpoint, { method: 'POST', body: formData });
                    const data = await res.json();
                    
                    showNotification(data.message, data.success ? 'success' : 'error');
                    
                    if(data.success) {
                        if(form.id === 'form-login') {
                            window.location.href = data.data.is_admin ? 'admin/dashboard.php' : 'dashboard.php';
                        }
                        else setTimeout(() => showForm('login'), 2000);
                    }
                } catch (err) {
                    showNotification("Error de conexión con el servidor", "error");
                }
            };
        });
    </script>
</body>
</html>
