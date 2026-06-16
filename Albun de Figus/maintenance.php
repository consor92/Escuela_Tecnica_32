<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';

// Esta página es el destino final para mantenimiento y fuera de horario.
// No debe redirigir a index.php para evitar bucles con checkMaintenance().

// Si es admin logueado, permitirle ver esta página pero darle opción de ir al dashboard
$user = getCurrentUser($pdo);
$isAdmin = ($user && $user['is_admin'] == 1);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>Mantenimiento - Álbum 32</title>
    <link rel="icon" type="image/x-icon" href="assets/img/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { background: #020617; color: white; font-family: 'Outfit', sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 2rem; }
        .glass { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(20px); border-radius: 3rem; padding: 4rem 2rem; width: 100%; max-width: 500px; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
    </style>
</head>
<body>
    <div class="glass space-y-8">
        <div class="text-8xl animate-float">🚧</div>
        <div>
            <h1 class="text-4xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 mb-2">Álbum en Pausa</h1>
            <p class="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Mantenimiento / Fuera de Horario</p>
        </div>
        <p class="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            Estamos ajustando los últimos detalles o el sistema se encuentra fuera del horario permitido. ¡Vuelve pronto para seguir completando tu álbum!
        </p>
        
        <?php if($isAdmin): ?>
            <div class="pt-6">
                <a href="admin/dashboard.php" class="bg-cyan-500 text-black px-8 py-3 rounded-2xl font-black uppercase text-xs shadow-lg shadow-cyan-500/20 inline-block transition-all hover:scale-105">Entrar como Admin</a>
                <p class="text-[9px] text-cyan-500/50 mt-4 font-black uppercase">Solo tú puedes ver esto</p>
            </div>
        <?php endif; ?>

        <div class="pt-10 border-t border-white/5">
            <p class="text-[9px] text-gray-700 font-black uppercase tracking-widest">E.T. Nº 32 "Gral. José de San Martín"</p>
        </div>
    </div>

    <script>
        // Auto-refresh cada minuto para detectar cuando vuelva a estar online
        setTimeout(() => location.reload(), 60000);
    </script>
</body>
</html>
