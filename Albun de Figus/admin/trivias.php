<?php
require_once '../includes/db.php';
require_once '../includes/functions.php';
requireLogin();

$user = getCurrentUser($pdo);
if (!$user || !$user['is_admin']) { header("Location: ../dashboard.php"); exit(); }

// Procesar Acciones (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    
    if ($action === 'add' || $action === 'edit') {
        $category = cleanInput($_POST['category']);
        $question = cleanInput($_POST['question']);
        $a = cleanInput($_POST['option_a']);
        $b = cleanInput($_POST['option_b']);
        $c = cleanInput($_POST['option_c']);
        $correct = $_POST['correct_option'];
        
        if ($action === 'add') {
            $stmt = $pdo->prepare("INSERT INTO trivias (category, question, option_a, option_b, option_c, correct_option) VALUES (?,?,?,?,?,?)");
            $stmt->execute([$category, $question, $a, $b, $c, $correct]);
        } else {
            $id = intval($_POST['id']);
            $stmt = $pdo->prepare("UPDATE trivias SET category=?, question=?, option_a=?, option_b=?, option_c=?, correct_option=? WHERE id=?");
            $stmt->execute([$category, $question, $a, $b, $c, $correct, $id]);
        }
    } elseif ($action === 'delete') {
        $id = intval($_POST['id']);
        $stmt = $pdo->prepare("DELETE FROM trivias WHERE id = ?");
        $stmt->execute([$id]);
    }
    header("Location: trivias.php");
    exit();
}

// Obtener todas las trivias
$trivias = $pdo->query("SELECT * FROM trivias ORDER BY id DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Trivias - Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #020617; color: white; font-family: 'Outfit', sans-serif; }
        .glass-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.05); }
    </style>
</head>
<body class="p-6">
    <div class="max-w-5xl mx-auto space-y-8">
        <header class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase">Gestión de Trivias</h1>
                <p class="text-gray-500 text-xs font-bold">AGREGA O MODIFICA PREGUNTAS DEL SISTEMA</p>
            </div>
            <div class="flex gap-3">
                <a href="test_trivia.php" class="bg-yellow-500/10 border border-yellow-500/20 px-6 py-2 rounded-xl text-xs font-bold text-yellow-500 hover:bg-yellow-500/20 transition-all">🧪 PROBAR TRIVIAS</a>
                <a href="dashboard.php" class="bg-white/10 px-6 py-2 rounded-xl text-xs font-bold">VOLVER AL PANEL</a>
            </div>
        </header>

        <!-- Formulario Agregar/Editar -->
        <section class="glass-card p-8 rounded-[2rem]">
            <h3 class="text-lg font-black mb-6 italic" id="form-title">AÑADIR NUEVA PREGUNTA</h3>
            <form method="POST" class="space-y-4">
                <input type="hidden" name="action" id="form-action" value="add">
                <input type="hidden" name="id" id="trivia-id" value="">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Categoría</label>
                        <input type="text" name="category" id="f-category" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Opción Correcta</label>
                        <select name="correct_option" id="f-correct" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none">
                            <option value="a" class="bg-slate-900">A</option>
                            <option value="b" class="bg-slate-900">B</option>
                            <option value="c" class="bg-slate-900">C</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Pregunta</label>
                    <textarea name="question" id="f-question" required rows="2" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Opción A</label>
                        <input type="text" name="option_a" id="f-a" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Opción B</label>
                        <input type="text" name="option_b" id="f-b" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Opción C</label>
                        <input type="text" name="option_c" id="f-c" required class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                    </div>
                </div>

                <div class="flex gap-2">
                    <button type="submit" class="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 py-4 rounded-xl font-black text-sm shadow-lg shadow-cyan-500/20">GUARDAR CAMBIOS</button>
                    <button type="button" onclick="resetForm()" class="bg-white/5 px-6 py-4 rounded-xl font-black text-xs uppercase border border-white/10">Limpiar</button>
                </div>
            </form>
        </section>

        <!-- Tabla de Preguntas -->
        <section class="glass-card rounded-[2rem] overflow-hidden">
            <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                    <tr>
                        <th class="p-6">ID</th>
                        <th class="p-6">Categoría</th>
                        <th class="p-6">Pregunta</th>
                        <th class="p-6">Correcta</th>
                        <th class="p-6">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <?php foreach($trivias as $t): ?>
                    <tr class="hover:bg-white/5 transition-colors">
                        <td class="p-6 font-mono text-cyan-500">#<?php echo $t['id']; ?></td>
                        <td class="p-6 font-bold"><?php echo $t['category']; ?></td>
                        <td class="p-6 text-gray-300 max-w-xs truncate"><?php echo $t['question']; ?></td>
                        <td class="p-6"><span class="bg-white/10 px-3 py-1 rounded-lg font-black"><?php echo strtoupper($t['correct_option']); ?></span></td>
                        <td class="p-6 flex gap-3">
                            <button onclick='editTrivia(<?php echo json_encode($t); ?>)' class="text-cyan-400 font-black uppercase text-[10px] tracking-tighter hover:underline">Editar</button>
                            <form method="POST" class="inline" onsubmit="return confirm('¿Eliminar esta trivia?')">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?php echo $t['id']; ?>">
                                <button type="submit" class="text-red-500 font-black uppercase text-[10px] tracking-tighter hover:underline">Borrar</button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </section>
    </div>

    <script>
        function editTrivia(data) {
            document.getElementById('form-title').innerText = "EDITANDO PREGUNTA #" + data.id;
            document.getElementById('form-action').value = "edit";
            document.getElementById('trivia-id').value = data.id;
            document.getElementById('f-category').value = data.category;
            document.getElementById('f-question').value = data.question;
            document.getElementById('f-a').value = data.option_a;
            document.getElementById('f-b').value = data.option_b;
            document.getElementById('f-c').value = data.option_c;
            document.getElementById('f-correct').value = data.correct_option;
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function resetForm() {
            document.getElementById('form-title').innerText = "AÑADIR NUEVA PREGUNTA";
            document.getElementById('form-action').value = "add";
            document.getElementById('trivia-id').value = "";
            document.getElementById('f-category').value = "";
            document.getElementById('f-question').value = "";
            document.getElementById('f-a').value = "";
            document.getElementById('f-b').value = "";
            document.getElementById('f-c').value = "";
            document.getElementById('f-correct').value = "a";
        }
    </script>
</body>
</html>
