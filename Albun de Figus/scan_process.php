<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';

// Si no está logueado, guardamos a dónde quería ir y mandamos al login
if (!isLoggedIn()) {
    if (isset($_GET['slug'])) {
        $_SESSION['pending_qr'] = $_GET['slug'];
    }
    header("Location: index.php?msg=login_required_qr");
    exit();
}

$userId = $_SESSION['user_id'];

// Persistencia de vista para admin/docente
$viewParam = (isset($_GET['view']) && $_GET['view'] === 'student') ? '?view=student' : '';
$backUrl = "dashboard.php" . $viewParam;

$slug = cleanInput($_GET['slug'] ?? $_SESSION['pending_qr'] ?? '');
unset($_SESSION['pending_qr']); // Limpiar después de usar

if (empty($slug)) {
    header("Location: dashboard.php?error=qr_invalid");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validando QR - Álbum 32</title>
    <link rel="icon" type="image/x-icon" href="assets/img/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;900&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #020617; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; overflow: hidden; }
        .glass { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .neon-text { text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
        .reward-pop { animation: rewardPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes rewardPop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .floating { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    </style>
</head>
<body>
    <div class="max-w-sm w-full p-10 glass rounded-[3rem] text-center relative overflow-hidden">
        <!-- Decoración de fondo -->
        <div class="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 blur-[80px]"></div>
        <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/10 blur-[80px]"></div>

        <div id="loader" class="relative z-10">
            <div class="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 class="text-xl font-black uppercase italic tracking-widest text-cyan-400">Escaneando...</h2>
            <p class="mt-4 text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">Validando con el servidor</p>
        </div>
        
        <div id="result" class="hidden relative z-10">
            <!-- ALERTA HAPPY HOUR -->
            <div id="happy-hour-alert" class="hidden mb-6 bg-orange-500/20 border border-orange-500/40 py-2 px-4 rounded-full flex items-center justify-center gap-2 animate-pulse">
                <span class="text-xs font-black text-orange-400 uppercase tracking-tighter">🔥 ¡HAPPY HOUR ACTIVO! (+ Sobres)</span>
            </div>

            <div id="reward-visual" class="hidden mb-8">
                <div class="relative inline-block">
                    <?php 
                    $stmtAlbum = $pdo->query("SELECT pack_img FROM albums WHERE id = 1");
                    $packImg = $stmtAlbum->fetchColumn();
                    ?>
                    <img src="<?php echo getDriveUrl($pdo, $packImg); ?>" class="w-32 h-auto mx-auto floating drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]" alt="Sobre">
                    <div id="amount-badge" class="absolute -top-4 -right-4 bg-yellow-500 text-black w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl border-4 border-slate-950 shadow-2xl shadow-yellow-500/20">+1</div>
                </div>
            </div>

            <h2 id="result-title" class="text-3xl font-black italic uppercase mb-2 tracking-tighter"></h2>
            <p id="result-msg" class="text-xs font-bold text-gray-400 mb-10 uppercase tracking-widest leading-relaxed"></p>
            
            <a href="<?php echo $backUrl; ?>" id="btn-back" class="block w-full bg-gradient-to-r from-cyan-500 to-purple-600 py-5 rounded-2xl font-black uppercase text-sm shadow-xl active:scale-95 transition-all">
                IR AL INICIO
            </a>
        </div>
    </div>

    <script>
        async function processQR() {
            try {
                // 1. Consultar Happy Hour para la alerta
                const resHH = await fetch('api/admin_fetch.php?action=get_happy_hour');
                const dataHH = await resHH.json();
                if(dataHH.success && dataHH.data.active) {
                    document.getElementById('happy-hour-alert').classList.remove('hidden');
                }

                // 2. Procesar QR
                const res = await fetch(`api/scan_qr.php?slug=<?php echo $slug; ?>&format=json`);
                const data = await res.json();
                
                document.getElementById('loader').classList.add('hidden');
                const resultDiv = document.getElementById('result');
                resultDiv.classList.remove('hidden');
                
                const title = document.getElementById('result-title');
                const msg = document.getElementById('result-msg');
                const visual = document.getElementById('reward-visual');
                const badge = document.getElementById('amount-badge');
                
                if (data.success) {
                    if (data.data && data.data.redirect) {
                        title.textContent = "CONECTANDO";
                        title.className = "text-3xl font-black italic uppercase mb-2 text-purple-400";
                        msg.textContent = "Accediendo a la misión trivia...";
                        setTimeout(() => window.location.href = data.data.redirect, 1000);
                        return;
                    }

                    title.textContent = "¡BOTÍN LOGRADO!";
                    title.className = "text-3xl font-black italic uppercase mb-2 text-yellow-500 neon-text";
                    msg.textContent = data.message;
                    
                    // Mostrar visual de sobres
                    visual.classList.remove('hidden');
                    visual.classList.add('reward-pop');
                    if(data.data && data.data.amount) {
                        badge.textContent = `+${data.data.amount}`;
                    }

                    // Efecto Confeti
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#22d3ee', '#fbbf24', '#ffffff']
                    });

                } else {
                    title.textContent = "SIN SUERTE";
                    title.className = "text-3xl font-black italic uppercase mb-2 text-red-500";
                    msg.textContent = data.message;
                }
            } catch (err) {
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('result').classList.remove('hidden');
                document.getElementById('result-title').textContent = "ERROR";
                document.getElementById('result-msg').textContent = "Fallo de conexión con el sistema.";
            }
        }
        
        window.onload = () => {
            setTimeout(processQR, 800); // Pequeño delay para el suspenso
        };
    </script>
</body>
</html>
