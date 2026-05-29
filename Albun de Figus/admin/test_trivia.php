<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';
requireLogin();

$user = getCurrentUser($pdo);
if (!$user || !$user['is_admin']) { header("Location: ../dashboard.php"); exit(); }

// Resetear sesión de trivia de prueba si se solicita
if (isset($_GET['reset'])) {
    unset($_SESSION['trivia_test_session']);
    header("Location: test_trivia.php");
    exit();
}

/**
 * Lógica Simplificada de Trivia para Pruebas (Sin Cooldown ni Tiempo)
 */
$action = $_GET['action'] ?? '';

if ($action === 'start') {
    $stmtTrivias = $pdo->query("SELECT id, question, option_a, option_b, option_c, category, correct_option FROM trivias WHERE is_active = 1 ORDER BY RAND() LIMIT 3");
    $questions = $stmtTrivias->fetchAll();

    foreach($questions as &$q) {
        $opts = [
            ['key' => 'a', 'val' => $q['option_a']],
            ['key' => 'b', 'val' => $q['option_b']],
            ['key' => 'c', 'val' => $q['option_c']]
        ];
        shuffle($opts);
        $q['shuffled_options'] = $opts;
    }

    $_SESSION['trivia_test_session'] = [
        'questions' => $questions,
        'current_idx' => 0,
        'correct_count' => 0
    ];

    $q = $questions[0];
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'data' => [
            'question' => [
                'id' => $q['id'],
                'category' => $q['category'],
                'question' => $q['question'],
                'options' => $q['shuffled_options']
            ],
            'total' => 3,
            'current' => 1
        ]
    ]);
    exit();
}

if ($action === 'submit') {
    if (!isset($_SESSION['trivia_test_session'])) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'No hay sesión de prueba activa.']);
        exit();
    }

    $session = &$_SESSION['trivia_test_session'];
    $idx = $session['current_idx'];
    $userAnswer = $_POST['answer'] ?? '';

    $correctKey = $session['questions'][$idx]['correct_option'];
    $isCorrect = ($userAnswer === $correctKey);

    if (!$isCorrect) {
        unset($_SESSION['trivia_test_session']);
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => "Incorrecto. Era la opción: " . strtoupper($correctKey), 'data' => ['correct' => false, 'finished' => true]]);
        exit();
    }

    $session['current_idx']++;
    
    if ($session['current_idx'] >= 3) {
        unset($_SESSION['trivia_test_session']);
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => "¡Prueba Superada! (Modo Admin)", 'data' => ['correct' => true, 'finished' => true, 'won' => true]]);
        exit();
    } else {
        $q = $session['questions'][$session['current_idx']];
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => "Siguiente",
            'data' => [
                'correct' => true,
                'finished' => false,
                'question' => [
                    'id' => $q['id'],
                    'category' => $q['category'],
                    'question' => $q['question'],
                    'options' => $q['shuffled_options']
                ],
                'current' => $session['current_idx'] + 1
            ]
        ]);
        exit();
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simulador de Trivia - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Outfit', sans-serif; background: #020617; color: white; min-height: 100vh; display: flex; flex-direction: column; }
        .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .bg-neon-gradient { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); }
        .option-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s; }
        .option-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); border-color: #f59e0b; transform: scale(1.02); }
        #toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 1000; display: none; padding: 12px 24px; border-radius: 16px; font-weight: 800; text-transform: uppercase; box-shadow: 0 10px 30px rgba(0,0,0,0.5); animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
    </style>
</head>
<body class="p-6">
    <div id="toast"></div>

    <header class="mb-10 flex items-center justify-between max-w-md mx-auto w-full">
        <div>
            <a href="trivias.php" class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 inline-block">⬅ VOLVER A GESTIÓN</a>
            <h1 class="text-3xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">Simulador Admin</h1>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl border border-white/10">🧪</div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center">
        
        <div id="start-view" class="text-center space-y-8 w-full max-w-sm">
            <div class="glass-card p-10 rounded-[3rem] border-2 border-white/5 relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 blur-2xl"></div>
                <h2 class="text-xl font-bold mb-4">Modo de Pruebas</h2>
                <p class="text-sm text-gray-400 mb-8">Este entorno permite probar las preguntas sin límite de tiempo ni cooldown de 6 horas.</p>
                <button onclick="startTrivia()" class="w-full bg-neon-gradient py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 active:scale-95 transition-transform">
                    INICIAR SIMULACIÓN 🚀
                </button>
            </div>
        </div>

        <div id="quiz-view" class="hidden w-full max-w-md space-y-6">
            <div class="flex justify-between items-end px-2">
                <div>
                    <span id="question-category" class="text-[10px] font-black text-yellow-400 uppercase tracking-widest">CATEGORÍA</span>
                    <h3 class="text-xs font-bold text-gray-500">PREGUNTA <span id="current-step" class="text-white text-lg font-black">1</span>/3</h3>
                </div>
                <div class="text-xs font-bold text-red-400 uppercase tracking-tighter italic">⏳ Sin Límite</div>
            </div>

            <div class="glass-card p-8 rounded-[2.5rem] border-2 border-white/5">
                <p id="question-text" class="text-xl font-bold leading-tight mb-8">...</p>
                <div class="space-y-4">
                    <button id="btn-a" class="option-btn w-full text-left p-5 rounded-2xl flex items-center gap-4 group">
                        <span class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black group-hover:bg-yellow-500 transition-colors">A</span>
                        <span id="text-a">...</span>
                    </button>
                    <button id="btn-b" class="option-btn w-full text-left p-5 rounded-2xl flex items-center gap-4 group">
                        <span class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black group-hover:bg-yellow-500 transition-colors">B</span>
                        <span id="text-b">...</span>
                    </button>
                    <button id="btn-c" class="option-btn w-full text-left p-5 rounded-2xl flex items-center gap-4 group">
                        <span class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black group-hover:bg-yellow-500 transition-colors">C</span>
                        <span id="text-c">...</span>
                    </button>
                </div>
            </div>
        </div>

        <div id="result-view" class="hidden text-center space-y-6 w-full max-w-sm">
             <div id="result-icon" class="text-7xl mb-4">🏆</div>
             <h2 id="result-title" class="text-3xl font-black uppercase italic">¡Felicidades!</h2>
             <p id="result-desc" class="text-gray-400 text-sm italic px-6"></p>
             <div class="pt-6">
                <a href="test_trivia.php?reset=1" class="inline-block bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-tighter">Probar de Nuevo</a>
             </div>
        </div>
    </main>

    <script>
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
                const res = await fetch('test_trivia.php?action=start');
                const data = await res.json();
                if (data.success) {
                    document.getElementById('start-view').classList.add('hidden');
                    document.getElementById('quiz-view').classList.remove('hidden');
                    loadQuestion(data.data);
                }
            } catch (err) { showToast("Error", "error"); }
        }

        function loadQuestion(data) {
            const q = data.question;
            document.getElementById('question-category').textContent = q.category;
            document.getElementById('current-step').textContent = data.current;
            document.getElementById('question-text').textContent = q.question;
            
            const options = q.options;
            document.getElementById('text-a').textContent = options[0].val;
            document.getElementById('btn-a').onclick = () => submitAnswer(options[0].key);
            document.getElementById('text-b').textContent = options[1].val;
            document.getElementById('btn-b').onclick = () => submitAnswer(options[1].key);
            document.getElementById('text-c').textContent = options[2].val;
            document.getElementById('btn-c').onclick = () => submitAnswer(options[2].key);

            const buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(b => b.disabled = false);
        }

        async function submitAnswer(answer) {
            const buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(b => b.disabled = true);

            const fd = new FormData();
            fd.append('answer', answer);

            try {
                const res = await fetch('test_trivia.php?action=submit', { method: 'POST', body: fd });
                const data = await res.json();

                if (data.success) {
                    if (data.data.finished) {
                        showFinalResult(data);
                    } else {
                        loadQuestion(data.data);
                    }
                } else {
                    showToast(data.message, 'error');
                }
            } catch (err) { showToast("Error", "error"); }
        }

        function showFinalResult(data) {
            document.getElementById('quiz-view').classList.add('hidden');
            const view = document.getElementById('result-view');
            view.classList.remove('hidden');
            document.getElementById('result-icon').textContent = data.data.won ? "🏆" : "❌";
            document.getElementById('result-title').textContent = data.data.won ? "SIMULACIÓN EXITOSA" : "PRUEBA FALLIDA";
            document.getElementById('result-desc').textContent = data.message;
        }
    </script>
</body>
</html>