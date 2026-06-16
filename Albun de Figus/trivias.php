<?php
require_once 'includes/db.php';
require_once 'includes/functions.php';
requireLogin();

$userId = $_SESSION['user_id'];

// Persistencia de vista para admin/docente
$viewParam = (isset($_GET['view']) && $_GET['view'] === 'student') ? '?view=student' : '';
$backUrl = "dashboard.php" . $viewParam;

// Consultar cooldown inicial
$stmt = $pdo->prepare("SELECT last_trivia_at FROM users WHERE id = ?");
$stmt->execute([$userId]);
$lastTrivia = $stmt->fetchColumn();

$cooldownActive = false;
$remainingText = "";

// Consultar cooldown dinámico
$stmtCooldown = $pdo->query("SELECT `value` FROM settings WHERE `key` = 'trivia_cooldown'");
$cooldownHours = (int)($stmtCooldown->fetchColumn() ?: 6);
$cooldownSeconds = $cooldownHours * 3600;

$stmtDiff = $pdo->prepare("SELECT TIMESTAMPDIFF(SECOND, last_trivia_at, NOW()) FROM users WHERE id = ?");
$stmtDiff->execute([$userId]);
$diff = $stmtDiff->fetchColumn();

if ($diff !== null && $diff < $cooldownSeconds) {
    $cooldownActive = true;
    $rem = $cooldownSeconds - $diff;
    $h = floor($rem / 3600);
    $m = floor(($rem % 3600) / 60);
    $remainingText = "PRÓXIMA TRIVIA EN: {$h}h {$m}m";
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trivia Pro - Álbum 32</title>
    <link rel="icon" type="image/x-icon" href="assets/img/favicon.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #020617; color: white; min-height: 100vh; display: flex; flex-direction: column; }
        .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .neon-text-cian { color: #22d3ee; text-shadow: 0 0 10px rgba(34, 211, 238, 0.3); }
        .bg-neon-gradient { background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); }
        
        .timer-bar { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
        .timer-fill { height: 100%; background: #22d3ee; width: 100%; transition: width 1s linear; }
        .timer-warning { background: #ef4444 !important; }

        .option-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; }
        .option-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); border-color: #22d3ee; transform: scale(1.02); }
        .option-btn:active:not(:disabled) { transform: scale(0.98); }

        #toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; display: none; padding: 12px 24px; border-radius: 16px; font-weight: 800; text-transform: uppercase; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    </style>
</head>
<body class="p-6">

    <div id="toast"></div>

    <header class="mb-10 flex items-center justify-between">
        <div>
            <a href="<?php echo $backUrl; ?>" class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 inline-block">⬅ VOLVER</a>
            <h1 class="text-3xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Misión Trivia</h1>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/10">🧠</div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center">
        
        <!-- VISTA INICIAL / COOLDOWN -->
        <div id="start-view" class="<?php echo $cooldownActive ? 'opacity-60' : ''; ?> text-center space-y-8 w-full max-w-sm">
            <div class="glass-card p-10 rounded-[3rem] border-2 border-white/5 relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-24 h-24 bg-cyan-500/10 blur-2xl"></div>
                
                <h2 class="text-xl font-bold mb-4">¿Estás listo para el desafío?</h2>
                <ul class="text-sm text-gray-400 space-y-2 mb-8 text-left">
                    <li>🔹 <span class="text-white">3 Preguntas</span> consecutivas.</li>
                    <li>🔹 <span class="text-white">30 Segundos</span> por respuesta.</li>
                    <li>🔹 <span class="text-white">Puntaje perfecto</span> = 1 Sobre.</li>
                </ul>

                <?php if($cooldownActive): ?>
                    <div class="bg-red-500/10 text-red-400 py-4 rounded-2xl font-black text-xs tracking-widest border border-red-500/20">
                        <?php echo $remainingText; ?>
                    </div>
                <?php else: ?>
                    <button onclick="startTrivia()" class="w-full bg-neon-gradient py-5 rounded-2xl font-black text-lg shadow-xl shadow-cyan-500/20 active:scale-95 transition-transform">
                        ¡EMPEZAR AHORA! 🚀
                    </button>
                <?php endif; ?>
            </div>
            <p class="text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em]">Acceso cada <?php echo $cooldownHours; ?> horas</p>
        </div>

        <!-- VISTA DE PREGUNTAS (OCULTA AL INICIO) -->
        <div id="quiz-view" class="hidden w-full max-w-md space-y-6">
            <!-- Header de Pregunta -->
            <div class="flex justify-between items-end px-2">
                <div>
                    <span id="question-category" class="text-[10px] font-black text-cyan-400 uppercase tracking-widest">CATEGORÍA</span>
                    <h3 class="text-xs font-bold text-gray-500">PREGUNTA <span id="current-step" class="text-white text-lg font-black">1</span>/3</h3>
                </div>
                <div id="timer-text" class="text-2xl font-black neon-text-cian">30s</div>
            </div>

            <!-- Barra de Tiempo -->
            <div class="timer-bar">
                <div id="timer-fill" class="timer-fill"></div>
            </div>

            <!-- Card de Pregunta -->
            <div class="glass-card p-8 rounded-[2.5rem] border-2 border-white/5">
                <p id="question-text" class="text-xl font-bold leading-tight mb-8">...</p>
                
                <div class="space-y-4">
                    <button id="btn-a" class="option-btn w-full text-left p-5 rounded-2xl flex items-center gap-4 group">
                        <span class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black group-hover:bg-cyan-500 transition-colors">1</span>
                        <span id="text-a">...</span>
                    </button>
                    <button id="btn-b" class="option-btn w-full text-left p-5 rounded-2xl flex items-center gap-4 group">
                        <span class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black group-hover:bg-cyan-500 transition-colors">2</span>
                        <span id="text-b">...</span>
                    </button>
                    <button id="btn-c" class="option-btn w-full text-left p-5 rounded-2xl flex items-center gap-4 group">
                        <span class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black group-hover:bg-cyan-500 transition-colors">3</span>
                        <span id="text-c">...</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- VISTA DE RESULTADOS (OCULTA AL INICIO) -->
        <div id="result-view" class="hidden text-center space-y-6 w-full max-w-sm">
             <div id="result-icon" class="text-7xl mb-4">🏆</div>
             <h2 id="result-title" class="text-3xl font-black uppercase italic">¡Felicidades!</h2>
             <p id="result-desc" class="text-gray-400 text-sm italic px-6"></p>
             <div class="pt-6">
                <a href="<?php echo $backUrl; ?>" class="inline-block bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-tighter">Volver al Inicio</a>
             </div>
        </div>

    </main>

    <?php renderGlobalAssets($pdo); ?>

    <script>
        let timerInterval;
        let timeLeft = 30;

        function showToast(msg, type = 'success') {
            const t = document.getElementById('toast');
            t.textContent = msg;
            t.style.display = 'block';
            t.style.background = type === 'success' ? '#ffffff' : '#ef4444';
            t.style.color = type === 'success' ? '#000000' : '#ffffff';
            setTimeout(() => { t.style.display = 'none'; }, 3000);
        }

        async function startTrivia() {
            try {
                const res = await fetch('api/trivia_engine.php?action=start');
                const data = await res.json();

                if (data.success) {
                    document.getElementById('start-view').classList.add('hidden');
                    document.getElementById('quiz-view').classList.remove('hidden');
                    loadQuestion(data.data);
                } else {
                    showToast(data.message, 'error');
                }
            } catch (err) {
                showToast("Error de conexión", "error");
            }
        }

        function loadQuestion(data) {
            const q = data.question;
            document.getElementById('question-category').textContent = q.category;
            document.getElementById('current-step').textContent = data.current;
            document.getElementById('question-text').textContent = q.question;
            
            // Renderizar opciones mezcladas
            const options = q.options;
            
            document.getElementById('text-a').textContent = options[0].val;
            document.getElementById('btn-a').onclick = () => submitAnswer(options[0].key);
            
            document.getElementById('text-b').textContent = options[1].val;
            document.getElementById('btn-b').onclick = () => submitAnswer(options[1].key);
            
            document.getElementById('text-c').textContent = options[2].val;
            document.getElementById('btn-c').onclick = () => submitAnswer(options[2].key);
            
            resetTimer();
        }

        function resetTimer() {
            clearInterval(timerInterval);
            timeLeft = 30;
            const bar = document.getElementById('timer-fill');
            const text = document.getElementById('timer-text');
            
            bar.style.width = '100%';
            bar.classList.remove('timer-warning');
            text.textContent = `30s`;
            text.classList.remove('text-red-500');

            timerInterval = setInterval(() => {
                timeLeft--;
                text.textContent = `${timeLeft}s`;
                bar.style.width = `${(timeLeft / 30) * 100}%`;

                if (timeLeft <= 5) {
                    bar.classList.add('timer-warning');
                    text.classList.add('text-red-500');
                }

                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    handleTimeout();
                }
            }, 1000);
        }

        function handleTimeout() {
            showToast("¡SE ACABÓ EL TIEMPO!", "error");
            setTimeout(() => { location.reload(); }, 2000);
        }

        async function submitAnswer(answer) {
            clearInterval(timerInterval);
            const buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(b => b.disabled = true);

            const fd = new FormData();
            fd.append('answer', answer);

            try {
                const res = await fetch('api/trivia_engine.php?action=submit', { method: 'POST', body: fd });
                const data = await res.json();

                if (data.success) {
                    if (data.data.finished) {
                        showFinalResult(data);
                    } else {
                        loadQuestion(data.data);
                        buttons.forEach(b => b.disabled = false);
                    }
                } else {
                    showToast(data.message, 'error');
                    if (data.data && data.data.finished) {
                        setTimeout(() => location.reload(), 2000);
                    } else {
                         setTimeout(() => location.reload(), 2000);
                    }
                }
            } catch (err) {
                showToast("Error al enviar respuesta", "error");
                buttons.forEach(b => b.disabled = false);
            }
        }

        function showFinalResult(data) {
            document.getElementById('quiz-view').classList.add('hidden');
            const view = document.getElementById('result-view');
            view.classList.remove('hidden');

            if (data.data.won) {
                document.getElementById('result-icon').textContent = "🏆";
                document.getElementById('result-title').textContent = "¡MISIÓN CUMPLIDA!";
                document.getElementById('result-desc').textContent = data.message;
            } else {
                document.getElementById('result-icon').textContent = "❌";
                document.getElementById('result-title').textContent = "SIGUE ESTUDIANDO";
                document.getElementById('result-desc').textContent = data.message;
            }
        }
    </script>

</body>
</html>
