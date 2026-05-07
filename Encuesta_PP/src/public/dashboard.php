<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role_id'] != 2) {
    header('Location: index.php');
    exit;
}

$user_id = $_SESSION['user_id'];
$success = '';
$error = '';

// Prioridad: Periodo marcado como is_active = 1
$stmt = $pdo->prepare("SELECT * FROM evaluation_periods WHERE is_active = 1 LIMIT 1");
$stmt->execute();
$current_period = $stmt->fetch();

// Si no hay ninguno activo manualmente, buscar por fecha actual
if (!$current_period) {
    $stmt = $pdo->prepare("SELECT * FROM evaluation_periods WHERE CURDATE() BETWEEN start_date AND end_date LIMIT 1");
    $stmt->execute();
    $current_period = $stmt->fetch();
}

// Si sigue sin haber (periodos terminados o no empezados), buscar el más cercano
if (!$current_period) {
    $stmt = $pdo->query("SELECT * FROM evaluation_periods ORDER BY ABS(DATEDIFF(CURDATE(), start_date)) LIMIT 1");
    $current_period = $stmt->fetch();
}

$stmt = $pdo->prepare("SELECT u.*, t.name as team_name FROM users u LEFT JOIN teams t ON u.team_id = t.id WHERE u.id = ?");
$stmt->execute([$user_id]);
$user_info = $stmt->fetch();

// Check if evaluations are globally enabled
$eval_enabled = (bool)$pdo->query("SELECT val FROM settings WHERE key_name = 'evaluations_enabled'")->fetchColumn();

$team_members = [];
if ($user_info['team_id']) {
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, username FROM users WHERE team_id = ?");
    $stmt->execute([$user_info['team_id']]);
    $team_members = $stmt->fetchAll();
}

$stmt = $pdo->prepare("SELECT user_id FROM scrum_masters WHERE team_id = ? AND bimestre = ?");
$stmt->execute([$user_info['team_id'], $current_period['bimestre']]);
$official_sm_id = $stmt->fetchColumn();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['evaluate'])) {
    $target_id = $_POST['target_id'];
    
    // Promedio de sub-preguntas para cada categoría
    $tw_scores = $_POST['tw'] ?? [];
    $dev_scores = $_POST['dev'] ?? [];
    $cw_scores = $_POST['cw'] ?? [];
    
    if (count($tw_scores) < 3 || count($dev_scores) < 3 || count($cw_scores) < 3) {
        $error = "Por favor, complete todas las calificaciones obligatorias.";
    } else {
        $teamwork = (array_sum($tw_scores) / 3);
        $development = (array_sum($dev_scores) / 3);
        $class_work = (array_sum($cw_scores) / 3);
        
        $is_sm = isset($_POST['is_sm']) ? 1 : 0;
        $sm_leadership = null;
        $sm_facilitation = null;
        $sm_support = null;

        if ($is_sm) {
            $sm_l = $_POST['sm_l'] ?? [];
            $sm_f = $_POST['sm_f'] ?? [];
            $sm_s = $_POST['sm_s'] ?? [];
            
            if (count($sm_l) < 2 || count($sm_f) < 2 || count($sm_s) < 1) {
                $error = "Por favor, complete todas las calificaciones de Scrum Master.";
            } else {
                $sm_leadership = (array_sum($sm_l) / 2);
                $sm_facilitation = (array_sum($sm_f) / 2);
                $sm_support = (array_sum($sm_s) / 1);
            }
        }

        if (!$error) {
            $comments = $_POST['comments'] ?? '';

            $check = $pdo->prepare("SELECT id FROM evaluations WHERE period_id = ? AND evaluator_id = ? AND evaluatee_id = ?");
            $check->execute([$current_period['id'], $user_id, $target_id]);
            
            if ($check->fetch()) {
                $error = "Ya has evaluado a este compañero.";
            } else {
                $stmt = $pdo->prepare("INSERT INTO evaluations (
                    period_id, evaluator_id, evaluatee_id, 
                    score_teamwork, score_development, score_class_work, 
                    is_sm_eval, score_sm_leadership, score_sm_facilitation, score_sm_support, 
                    comments
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $current_period['id'], $user_id, $target_id, 
                    $teamwork, $development, $class_work, 
                    $is_sm, $sm_leadership, $sm_facilitation, $sm_support, 
                    $comments
                ]);
                $success = "Evaluación guardada correctamente.";
                
                // Recargar para pasar al siguiente miembro
                header("Refresh:1");
            }
        }
    }
}

if (!$eval_enabled) {
    echo '<div class="card" style="text-align: center; padding: 4rem 2rem;">
            <h1>🔒</h1>
            <h2>Encuestas Cerradas</h2>
            <p>El periodo de evaluación actual está cerrado.</p>
            <div style="margin-top: 2rem;"><a href="logout.php" class="btn">Cerrar Sesión</a></div>
        </div>';
    exit;
}

$eval_done = [];
$stmt = $pdo->prepare("SELECT evaluatee_id FROM evaluations WHERE period_id = ? AND evaluator_id = ?");
$stmt->execute([$current_period['id'], $user_id]);
while ($row = $stmt->fetch()) {
    $eval_done[] = $row['evaluatee_id'];
}

$pending_members = [];
foreach ($team_members as $m) {
    if (!in_array($m['id'], $eval_done)) {
        $pending_members[] = $m;
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Evaluación Scrum Detallada</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .question-group { margin-bottom: 2rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 1.5rem; text-align: left; }
        .question-text { font-weight: 600; margin-bottom: 1rem; display: block; color: var(--text-color); }
        .wizard-header { margin-bottom: 2rem; text-align: center; }
        .progress-indicator { font-size: 0.9rem; color: var(--text-muted); margin-top: 10px; }
        .criteria-header { color: var(--primary-color); border-left: 4px solid var(--primary-color); padding-left: 10px; margin: 2rem 0 1.5rem 0; text-align: left; }
    </style>
</head>
<body>
    <header>
        <div><strong><?php echo htmlspecialchars((string)($user_info['first_name'] ?? '')); ?></strong> <span class="tag tag-alumno"><?php echo htmlspecialchars((string)($user_info['team_name'] ?? '')); ?></span></div>
        <a href="logout.php" class="btn" style="color: white;">Salir</a>
    </header>

    <main>
        <?php if ($success): ?> <div class="alert alert-success"><?php echo $success; ?></div> <?php endif; ?>
        <?php if ($error): ?> <div class="alert alert-error"><?php echo $error; ?></div> <?php endif; ?>

        <?php if (!$user_info['team_id']): ?>
            <div class="card" style="text-align: center; padding: 4rem 2rem;">
                <h1 style="font-size: 4rem; margin-bottom: 1rem;">⚠️</h1>
                <h2>Equipo no asignado</h2>
                <p>Aún no has sido asignado a un equipo. Por favor, contacta a tu docente.</p>
                <div style="margin-top: 2rem;"><a href="logout.php" class="btn">Cerrar Sesión</a></div>
            </div>
        <?php elseif (empty($pending_members)): ?>
            <div class="card" style="text-align: center; padding: 4rem 2rem;">
                <h1 style="font-size: 4rem; margin-bottom: 1rem;">🎉</h1>
                <h2>¡Evaluación Completada!</h2>
                <p>Has calificado a todos los miembros de tu equipo para este periodo.</p>
                <div style="margin-top: 2rem;"><a href="logout.php" class="btn btn-primary">Cerrar Sesión</a></div>
            </div>
        <?php else: ?>
            <div class="wizard-container">
                <div class="wizard-header">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: <?php echo (count($eval_done) / count($team_members)) * 100; ?>%"></div>
                    </div>
                    <div class="progress-indicator">Evaluado: <?php echo count($eval_done); ?> de <?php echo count($team_members); ?> miembros</div>
                </div>

                <div class="card question-card">
                    <div id="eval-summary" style="display:none; text-align: left; padding: 2rem;">
                        <h2 style="text-align: center;">Resumen de tu Calificación</h2>
                        <div id="summary-content"></div>
                        <div style="margin-top: 2rem; display: flex; gap: 10px;">
                            <button type="button" class="btn" onclick="hideSummary()" style="flex:1; background: var(--border-color);">Corregir</button>
                            <button type="submit" name="evaluate" form="eval-form" class="btn btn-primary" style="flex:2;">Confirmar y Guardar</button>
                        </div>
                    </div>

                    <form method="POST" id="eval-form">
                        <?php 
                        $current_target = $pending_members[0]; 
                        $is_self = ($current_target['id'] == $user_id);
                        $is_sm_assigned = ($current_target['id'] == $official_sm_id);
                        ?>
                        <input type="hidden" name="target_id" value="<?php echo $current_target['id']; ?>">

                        <div style="text-align: center; margin-bottom: 2rem;">
                            <h2 style="margin: 0;"><?php echo $is_self ? '⭐ Mi Autoevaluación' : '👥 Calificando a: ' . htmlspecialchars((string)($current_target['first_name'] . ' ' . $current_target['last_name'])); ?></h2>
                            <?php if ($is_sm_assigned): ?> 
                                <div style="margin-top: 10px;"><span class="tag" style="background: #ebf8ff; color: #2b6cb0; border: 1px solid #bee3f8;">Scrum Master Oficial</span></div>
                            <?php endif; ?>
                        </div>

                        <!-- SECCIÓN 1: TRABAJO EN EQUIPO -->
                        <h3 class="criteria-header">1. Trabajo en Equipo</h3>
                        <div class="question-group">
                            <span class="question-text">¿Colabora activamente con el resto de sus compañeros?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'tw1', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="tw[]" id="tw1" required>

                            <span class="question-text">¿Mantiene una comunicación fluida y respetuosa?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'tw2', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="tw[]" id="tw2" required>

                            <span class="question-text">¿Ayuda a resolver conflictos o dudas del grupo?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4; $i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'tw3', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="tw[]" id="tw3" required>
                        </div>

                        <!-- SECCIÓN 2: DESARROLLO -->
                        <h3 class="criteria-header">2. Desarrollo y Calidad</h3>
                        <div class="question-group">
                            <span class="question-text">¿Las tareas entregadas cumplen con los requisitos técnicos?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'dev1', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="dev[]" id="dev1" required>

                            <span class="question-text">¿Cumple con los tiempos de entrega pactados?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'dev2', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="dev[]" id="dev2" required>

                            <span class="question-text">¿Se esfuerza por mejorar la calidad de sus resultados?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4; $i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'dev3', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="dev[]" id="dev3" required>
                        </div>

                        <!-- SECCIÓN 3: CLASE -->
                        <h3 class="criteria-header">3. Trabajo en Clase</h3>
                        <div class="question-group">
                            <span class="question-text">¿Participa activamente en las dinámicas y debates?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'cw1', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="cw[]" id="cw1" required>

                            <span class="question-text">¿Mantiene el enfoque y evita distracciones?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'cw2', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="cw[]" id="cw2" required>

                            <span class="question-text">¿Es puntual y asiste regularmente?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4; $i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'cw3', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="cw[]" id="cw3" required>
                        </div>

                        <!-- SECCIÓN 4: SCRUM MASTER -->
                        <div class="form-group sm-toggle-container" style="background: rgba(74, 144, 226, 0.1); border: 2px dashed var(--primary-color); padding: 1.5rem; border-radius: 12px; margin: 3rem 0;">
                            <label class="toggle-label" style="justify-content: center; font-size: 1.1rem; color: var(--primary-color);">
                                <input type="checkbox" name="is_sm" id="sm-toggle" onchange="document.getElementById('sm-section').style.display = this.checked ? 'block' : 'none'" <?php echo $is_sm_assigned ? 'checked' : ''; ?>>
                                <span>¿Evaluar desempeño como <strong>Scrum Master</strong>?</span>
                            </label>
                        </div>

                        <div id="sm-section" style="display: <?php echo $is_sm_assigned ? 'block' : 'none'; ?>;" class="sm-evaluation-box">
                            <h3 class="criteria-header">Gestión Scrum</h3>
                            <span class="question-text">¿Ayuda a eliminar impedimentos y guía al equipo?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'sm_l1', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="sm_l[]" id="sm_l1">

                            <span class="question-text">¿Lidera con el ejemplo y motiva al equipo?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'sm_l2', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="sm_l[]" id="sm_l2">

                            <span class="question-text">¿Lleva adelante las ceremonias eficientemente?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'sm_f1', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="sm_f[]" id="sm_f1">

                            <span class="question-text">¿Mantiene el tablero y los artefactos al día?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'sm_f2', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="sm_f[]" id="sm_f2">

                            <span class="question-text">¿Brinda apoyo constante y soporte al grupo?</span>
                            <div class="rating-group"><?php for($i=1;$i<=4;$i++): ?><button type="button" class="rating-btn" onclick="selectScore(this, 'sm_s1', <?php echo $i; ?>)"><?php echo $i; ?></button><?php endfor; ?></div>
                            <input type="hidden" name="sm_s[]" id="sm_s1">
                        </div>

                        <div class="form-group" style="margin-top: 2rem;">
                            <label>Comentarios / Aclaraciones adicionales (Opcional)</label>
                            <textarea name="comments" rows="3" id="comments-box" placeholder="Si deseas explicar alguna de tus calificaciones, hazlo aquí..."></textarea>
                        </div>

                        <button type="button" onclick="showSummary()" class="btn btn-primary btn-submit-eval" style="margin-top: 2rem; width: 100%; padding: 1.5rem; font-size: 1.2rem;">Revisar y Guardar</button>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </main>
    <script>
        function selectScore(btn, inputId, value) {
            document.getElementById(inputId).value = value;
            btn.parentElement.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        }

        function showSummary() {
            const form = document.getElementById('eval-form');
            if (!form.checkValidity()) {
                alert("Por favor, selecciona una puntuación para todas las preguntas obligatorias.");
                return;
            }

            let html = '<ul style="list-style: none; padding: 0;">';
            // Inputs visibles o relevantes para el resumen
            const labels = { 'tw': 'Trabajo en Equipo', 'dev': 'Desarrollo', 'cw': 'Clase', 'sm_l': 'SM Liderazgo', 'sm_f': 'SM Facilitación', 'sm_s': 'SM Soporte' };

            document.querySelectorAll('input[type="hidden"]').forEach(input => {
                if (input.value && input.name.match(/\[\]/)) {
                    const baseName = input.name.replace('[]', '');
                    html += `<li><strong>${labels[baseName] || baseName}:</strong> ${input.value}</li>`;
                }
            });
            html += `<li><strong>Comentarios:</strong> ${document.getElementById('comments-box').value || 'Sin comentarios'}</li></ul>`;

            document.getElementById('summary-content').innerHTML = html;
            form.style.display = 'none';
            document.getElementById('eval-summary').style.display = 'block';
        }

        function hideSummary() {
            document.getElementById('eval-form').style.display = 'block';
            document.getElementById('eval-summary').style.display = 'none';
        }
    </script>
</body>
</html>
