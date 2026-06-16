<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';

// Verificar mantenimiento
checkMaintenance($pdo);

if (isLoggedIn()) {
    $user = getCurrentUser($pdo);
    if ($user) {
        if ($user['role'] === 'admin') {
            header("Location: admin/dashboard.php");
        } elseif ($user['role'] === 'docente') {
            header("Location: docente/dashboard.php");
        } else {
            header("Location: dashboard.php");
        }
        exit();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>Álbum 32: Camino al 20 de Junio</title>
    <link rel="icon" type="image/x-icon" href="assets/img/favicon.ico">
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

    <?php 
    // Mostrar mensaje si viene por error de sesión
    $error = $_GET['error'] ?? '';
    if ($error === 'session_expired') {
        echo '<script>window.onload = () => showNotification("Tu sesión ha caducado por inactividad (15 min)", "error");</script>';
    } elseif ($error === 'simultaneous_login') {
        echo '<script>window.onload = () => showNotification("Se ha iniciado sesión desde otro dispositivo", "error");</script>';
    }
    ?>

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
                <div class="relative">
                    <input type="password" name="password" id="login-password" required class="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-white neon-border-cian transition-all" placeholder="••••••••">
                    <button type="button" onclick="togglePassword('login-password', this)" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                        👁️
                    </button>
                </div>
            </div>
            <button type="submit" class="w-full btn-gradient py-4 rounded-xl text-white font-bold text-lg mt-4">ENTRAR AL SISTEMA</button>
        </form>

        <!-- Formulario Registro -->
        <form id="form-register" class="space-y-4 hidden">
            <div class="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl mb-4">
                <p class="text-cyan-400 text-[10px] uppercase font-bold text-center">Registro solo habilitado de 17:30 a 22:30</p>
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">DNI (Para validación)</label>
                <input type="text" id="reg-dni" name="dni" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white neon-border-cian transition-all" placeholder="Solo números">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">Nombre Completo</label>
                <input type="text" id="reg-fullname" name="full_name" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white neon-border-cian transition-all">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">Curso</label>
                <input type="text" id="reg-course" name="course" readonly class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-gray-500 cursor-not-allowed transition-all" placeholder="Se completará al validar DNI">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">Usuario</label>
                <input type="text" name="username" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white neon-border-cian transition-all">
            </div>
            <div>
                <label class="block text-gray-400 text-xs uppercase mb-1 ml-1">Contraseña</label>
                <div class="relative">
                    <input type="password" name="password" id="reg-password" required class="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-2 text-white neon-border-cian transition-all" placeholder="••••••••">
                    <button type="button" onclick="togglePassword('reg-password', this)" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                        👁️
                    </button>
                </div>
            </div>
            <button type="submit" class="w-full btn-gradient py-4 rounded-xl text-white font-bold text-lg mt-4">CREAR CUENTA</button>
        </form>
    </div>

    <script>
        function togglePassword(inputId, btn) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                btn.textContent = '🙈';
            } else {
                input.type = 'password';
                btn.textContent = '👁️';
            }
        }

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

        // Validación de DNI y Autocompletado
        const dniInput = document.getElementById('reg-dni');
        const nameInput = document.getElementById('reg-fullname');
        const courseInput = document.getElementById('reg-course');

        dniInput.oninput = async () => {
            if (dniInput.value.length >= 7) {
                try {
                    const res = await fetch(`api/check_dni.php?dni=${dniInput.value}`);
                    const data = await res.json();
                    if (data.success) {
                        nameInput.value = data.data.full_name;
                        courseInput.value = data.data.course;
                        nameInput.classList.add('text-cyan-400');
                        courseInput.classList.add('text-cyan-400');
                    } else {
                        nameInput.value = "";
                        courseInput.value = "";
                        nameInput.classList.remove('text-cyan-400');
                        courseInput.classList.remove('text-cyan-400');
                    }
                } catch (err) { console.error("Error validando DNI"); }
            }
        };

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
                            window.location.href = data.data.redirect;
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
