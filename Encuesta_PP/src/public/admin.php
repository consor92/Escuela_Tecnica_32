<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role_id'] != 1) {
    header('Location: index.php');
    exit;
}

// Endpoint para datos de gráficas
if (isset($_GET['action']) && $_GET['action'] === 'get_team_stats') {
    $team_id = $_GET['team_id'];
    $stmt = $pdo->prepare("
        SELECT 
            u.id as user_id, 
            u.first_name, 
            u.last_name,
            p.label as period_label,
            AVG((e.score_teamwork + e.score_development + e.score_class_work) / 3) as avg_score,
            (SELECT AVG((score_sm_leadership + score_sm_facilitation + score_sm_support) / 3) FROM evaluations WHERE evaluatee_id = u.id AND period_id = p.id AND is_sm_eval = 1) as sm_score
        FROM users u
        CROSS JOIN (SELECT * FROM evaluation_periods WHERE start_date <= CURDATE() ORDER BY start_date ASC) p
        LEFT JOIN evaluations e ON u.id = e.evaluatee_id AND e.period_id = p.id
        WHERE u.team_id = ?
        GROUP BY u.id, p.id
        ORDER BY p.start_date ASC, u.id ASC
    ");
    $stmt->execute([$team_id]);
    $results = $stmt->fetchAll();
    header('Content-Type: application/json');
    echo json_encode($results);
    exit;
}

$success = '';
$error = '';

// Crear equipo
if (isset($_POST['create_team'])) {
    $name = $_POST['team_name'];
    $stmt = $pdo->prepare("INSERT INTO teams (name) VALUES (?)");
    $stmt->execute([$name]);
    $success = "Equipo creado.";
}

// Asignar equipo
if (isset($_POST['assign_team'])) {
    $user_id = $_POST['user_id'];
    $team_id = $_POST['team_id'];
    $stmt = $pdo->prepare("UPDATE users SET team_id = ? WHERE id = ?");
    $stmt->execute([$team_id, $user_id]);
    $success = "Alumno asignado al equipo.";
}

// Quitar de equipo
if (isset($_POST['remove_from_team'])) {
    $user_id = $_POST['user_id'];
    $stmt = $pdo->prepare("UPDATE users SET team_id = NULL WHERE id = ?");
    $stmt->execute([$user_id]);
    $success = "Alumno removido del equipo.";
}

// Eliminar equipo
if (isset($_POST['delete_team'])) {
    $team_id = $_POST['team_id'];
    $stmt = $pdo->prepare("UPDATE users SET team_id = NULL WHERE team_id = ?");
    $stmt->execute([$team_id]);
    $stmt = $pdo->prepare("DELETE FROM teams WHERE id = ?");
    $stmt->execute([$team_id]);
    $success = "Equipo eliminado.";
}

// Asignar Scrum Master
if (isset($_POST['assign_sm'])) {
    $team_id = $_POST['team_id'];
    $user_id = $_POST['user_id'];
    $bimestre = $_POST['bimestre'];
    $stmt = $pdo->prepare("DELETE FROM scrum_masters WHERE team_id = ? AND bimestre = ?");
    $stmt->execute([$team_id, $bimestre]);
    $stmt = $pdo->prepare("INSERT INTO scrum_masters (team_id, user_id, bimestre) VALUES (?, ?, ?)");
    $stmt->execute([$team_id, $user_id, $bimestre]);
    $success = "Scrum Master asignado.";
}

// Actualizar estado de encuestas
if (isset($_POST['action']) && $_POST['action'] === 'toggle_eval') {
    $enabled = isset($_POST['toggle_eval']) ? 1 : 0;
    $stmt = $pdo->prepare("UPDATE settings SET val = ? WHERE key_name = 'evaluations_enabled'");
    $stmt->execute([$enabled]);
    $success = "Estado de encuestas actualizado.";
}

// Obtener estado de encuestas
$eval_enabled = (bool)$pdo->query("SELECT val FROM settings WHERE key_name = 'evaluations_enabled'")->fetchColumn();

// Actualizar periodo activo
if (isset($_POST['update_period'])) {
    $pdo->query("UPDATE evaluation_periods SET is_active = 0");
    $stmt = $pdo->prepare("UPDATE evaluation_periods SET is_active = 1 WHERE id = ?");
    $stmt->execute([$_POST['period_id']]);
    $success = "Periodo activo actualizado.";
}

// Obtener periodo actual (Manual override > Fecha actual)
$stmt = $pdo->query("SELECT * FROM evaluation_periods WHERE is_active = 1 LIMIT 1");
$current_period = $stmt->fetch();
if (!$current_period) {
    $stmt = $pdo->query("SELECT * FROM evaluation_periods WHERE CURDATE() BETWEEN start_date AND end_date LIMIT 1");
    $current_period = $stmt->fetch();
}

// Obtener equipos y sus promedios
$teams_data = [];
$all_teams = $pdo->query("SELECT * FROM teams")->fetchAll();
foreach ($all_teams as $t) {
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, email FROM users WHERE team_id = ?");
    $stmt->execute([$t['id']]);
    $t['members'] = $stmt->fetchAll();
    
    $stmt = $pdo->prepare("SELECT sm.*, u.first_name, u.last_name FROM scrum_masters sm JOIN users u ON sm.user_id = u.id WHERE sm.team_id = ?");
    $stmt->execute([$t['id']]);
    $t['sm_assignments'] = $stmt->fetchAll();

    $stmt = $pdo->prepare("
        SELECT AVG((score_teamwork + score_development + score_class_work) / 3) 
        FROM evaluations e 
        JOIN users u ON e.evaluatee_id = u.id 
        WHERE u.team_id = ?
    ");
    $stmt->execute([$t['id']]);
    $avg_team_score = $stmt->fetchColumn();
    $t['avg_score'] = $avg_team_score ? ($avg_team_score / 4) * 10 : 0;
    
    $teams_data[] = $t;
}

// Obtener alumnos sin equipo
$unassigned = $pdo->query("SELECT * FROM users WHERE role_id = 2 AND team_id IS NULL")->fetchAll();

// Lógica de reportes
$report_stmt = $pdo->query("
    SELECT 
        u.id, u.first_name, u.last_name, t.name as team_name,
        AVG(e.score_teamwork) as avg_teamwork,
        AVG(e.score_development) as avg_dev,
        AVG(e.score_class_work) as avg_class,
        (SELECT AVG((score_sm_leadership + score_sm_facilitation + score_sm_support) / 3) FROM evaluations WHERE evaluatee_id = u.id AND is_sm_eval = 1) as avg_sm,
        (SELECT GROUP_CONCAT(bimestre) FROM scrum_masters WHERE user_id = u.id) as sm_bimestres
    FROM users u
    LEFT JOIN teams t ON u.team_id = t.id
    LEFT JOIN evaluations e ON u.id = e.evaluatee_id
    WHERE u.role_id = 2
    GROUP BY u.id
    ORDER BY t.name, u.last_name
");
$reports = $report_stmt->fetchAll();

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Docente - Scrum</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css"/>
    <script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        function toggleTheme(e) {
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
        document.addEventListener('DOMContentLoaded', () => {
            const currentTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'dark') {
                const cb = document.querySelector('#checkbox');
                if (cb) cb.checked = true;
            }
        });
    </script>
</head>
<body>
    <header>
        <div><strong>Panel Docente</strong> <span class="tag tag-docente">Gestión</span></div>
        <div style="display: flex; align-items: center; gap: 20px;">
            <div class="theme-switch-wrapper">
                <label class="theme-switch" for="checkbox">
                    <input type="checkbox" id="checkbox" onchange="toggleTheme(event)" />
                    <div class="slider"></div>
                </label>
            </div>
            <a href="logout.php" class="btn" style="color: white;">Salir</a>
        </div>
    </header>

    <main>
        <?php if ($success): ?> <div class="alert alert-success"><?php echo $success; ?></div> <?php endif; ?>
        <?php if ($error): ?> <div class="alert alert-error"><?php echo $error; ?></div> <?php endif; ?>

        <h2 class="section-title">⚙️ Control de Encuestas</h2>
        <div class="card">
            <form method="POST" style="display: flex; gap: 10px; align-items: center;">
                <input type="checkbox" name="toggle_eval" <?php echo $eval_enabled ? 'checked' : ''; ?> onchange="this.form.submit()" style="width: 20px; height: 20px; cursor: pointer;">
                <span style="font-weight: 600;">Habilitar encuestas para alumnos</span>
                <input type="hidden" name="action" value="toggle_eval">
            </form>
        </div>

        <h2 class="section-title">⚙️ Gestión de Periodos</h2>
        <div class="card">
            <form method="POST" style="display: flex; gap: 10px; align-items: flex-end;">
                <div class="form-group" style="margin: 0; flex: 1;">
                    <label>Seleccionar Periodo Activo</label>
                    <select name="period_id">
                        <?php 
                        $periods = $pdo->query("SELECT * FROM evaluation_periods ORDER BY start_date ASC")->fetchAll();
                        if (empty($periods)) {
                            echo '<option value="">No hay periodos configurados</option>';
                        }
                        foreach ($periods as $p): ?>
                            <option value="<?php echo htmlspecialchars((string)$p['id']); ?>" <?php echo $p['is_active'] ? 'selected' : ''; ?>>
                                <?php echo htmlspecialchars((string)$p['label']); ?> <?php echo $p['is_active'] ? '(Activo)' : ''; ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <button type="submit" name="update_period" class="btn btn-primary">Guardar Periodo Activo</button>
            </form>
        </div>

        <h2 class="section-title">👥 Equipos</h2>
        <div class="grid" style="grid-template-columns: 1fr 2fr;">
            <div class="card">
                <h3>Asignar Alumno</h3>
                <form method="POST">
                    <div class="form-group">
                        <select name="user_id" id="student-select">
                            <option value="">Alumno...</option>
                            <?php foreach ($unassigned as $u): ?>
                                <option value="<?php echo $u['id']; ?>"><?php echo htmlspecialchars((string)($u['first_name'] . ' ' . $u['last_name'])); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <select name="team_id">
                            <?php foreach ($all_teams as $t): ?>
                                <option value="<?php echo $t['id']; ?>"><?php echo htmlspecialchars((string)$t['name']); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <button type="submit" name="assign_team" class="btn btn-primary" style="width: 100%;">Asignar</button>
                </form>
                <hr style="margin: 2rem 0; border: none; border-top: 1px solid var(--border-color);">
                <h3>Nuevo Equipo</h3>
                <form method="POST">
                    <div class="form-group"><input type="text" name="team_name" placeholder="Nombre Equipo" required></div>
                    <button type="submit" name="create_team" class="btn btn-primary" style="width: 100%;">Crear</button>
                </form>
            </div>

            <div class="grid">
                <?php foreach ($teams_data as $t): ?>
                    <div class="card team-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 10px;">
                            <div>
                                <h3 style="margin: 0;"><?php echo htmlspecialchars((string)$t['name']); ?></h3>
                                <span style="font-size: 0.8rem; color: var(--primary-color); font-weight: bold;">
                                    Promedio: <?php echo number_format((float)($t['avg_score'] ?? 0), 1); ?> / 10
                                </span>
                            </div>
                            <form method="POST" onsubmit="return confirm('¿Eliminar?');" style="margin: 0;">
                                <input type="hidden" name="team_id" value="<?php echo $t['id']; ?>">
                                <button type="submit" name="delete_team" class="btn" style="background: none; color: #c53030; padding: 0;">🗑️</button>
                            </form>
                        </div>
                        <div class="member-list">
                            <?php foreach ($t['members'] as $m): ?>
                                <div class="member-item" style="display: flex; justify-content: space-between; padding: 5px 0;">
                                    <span><?php echo htmlspecialchars((string)($m['first_name'] . ' ' . $m['last_name'])); ?></span>
                                    <form method="POST" style="margin: 0;">
                                        <input type="hidden" name="user_id" value="<?php echo $m['id']; ?>">
                                        <button type="submit" name="remove_from_team" class="btn" style="padding: 2px 5px; font-size: 0.7rem;">✕</button>
                                    </form>
                                </div>
                            <?php endforeach; ?>
                        </div>
                        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed var(--border-color);">
                            <form method="POST" style="display: flex; gap: 5px;">
                                <input type="hidden" name="team_id" value="<?php echo $t['id']; ?>">
                                <select name="user_id" style="font-size: 0.7rem;">
                                    <?php foreach ($t['members'] as $m): ?>
                                        <option value="<?php echo $m['id']; ?>"><?php echo htmlspecialchars((string)$m['first_name']); ?></option>
                                    <?php endforeach; ?>
                                </select>
                                <select name="bimestre" style="font-size: 0.7rem; width: 60px;">
                                    <option value="1">B1</option><option value="2">B2</option><option value="3">B3</option><option value="4">B4</option>
                                </select>
                                <button type="submit" name="assign_sm" class="btn btn-primary" style="padding: 2px 5px; font-size: 0.7rem;">OK</button>
                            </form>
                            <div style="margin-top: 5px;">
                                <?php foreach ($t['sm_assignments'] as $sm): ?>
                                    <span class="tag" style="font-size: 0.6rem; margin-right: 2px;">B<?php echo $sm['bimestre']; ?>: <?php echo htmlspecialchars((string)$sm['first_name']); ?></span>
                                <?php endforeach; ?>
                            </div>
                        </div>
                        <button onclick="viewChart(<?php echo $t['id']; ?>, '<?php echo addslashes((string)$t['name']); ?>')" class="btn" style="width: 100%; margin-top: 10px; background: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); font-size: 0.75rem;">📊 Evolución del Equipo</button>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>

        <h2 class="section-title">📊 Reportes</h2>
        <div class="card" style="padding: 0; overflow: hidden;">
            <table>
                <thead>
                    <tr><th>Alumno</th><th>Equipo</th><th>T.E</th><th>Dev</th><th>Clase</th><th>Nota Gral</th><th>Nota SM</th></tr>
                </thead>
                <tbody>
                    <?php foreach ($reports as $r): 
                        $pb = ($r['avg_teamwork'] + $r['avg_dev'] + $r['avg_class']) / 3;
                        $nf = $pb ? ($pb / 4) * 10 : 0;
                        $nsm = $r['avg_sm'] ? ($r['avg_sm'] / 4) * 10 : 0;
                    ?>
                        <tr>
                            <td><strong><?php echo htmlspecialchars((string)($r['first_name'] . ' ' . $r['last_name'])); ?></strong><?php if ($r['sm_bimestres']): ?><br><small>SM: <?php echo htmlspecialchars((string)$r['sm_bimestres']); ?></small><?php endif; ?></td>
                            <td><?php echo htmlspecialchars((string)($r['team_name'] ?: '-')); ?></td>
                            <td><?php echo number_format((float)$r['avg_teamwork'], 1); ?></td>
                            <td><?php echo number_format((float)$r['avg_dev'], 1); ?></td>
                            <td><?php echo number_format((float)$r['avg_class'], 1); ?></td>
                            <td style="background: rgba(74, 144, 226, 0.1);"><strong><?php echo number_format((float)$nf, 1); ?></strong></td>
                            <td style="background: rgba(80, 227, 194, 0.1);"><strong><?php echo $r['avg_sm'] ? number_format((float)$nsm, 1) : '-'; ?></strong></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </main>

    <!-- Modal para Gráficas -->
    <div id="chartModal" class="modal">
        <div class="modal-content">
            <header style="background: var(--primary-color); color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <h3 id="modalTitle" style="margin: 0;"></h3>
                <button onclick="closeModal()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </header>
            <div style="padding: 2rem; background: var(--card-bg);">
                <canvas id="performanceChart" style="max-height: 400px;"></canvas>
                <div id="chartLegend" style="margin-top: 1.5rem; font-size: 0.85rem; color: var(--text-muted); padding: 1rem; border-radius: 8px; background: rgba(0,0,0,0.02); border-left: 4px solid var(--accent-color);">
                    <p style="margin: 0;">💡 <strong>Indicador Scrum Master:</strong> Los puntos resaltados con un borde negro y un círculo exterior indican que el alumno fue <strong>Scrum Master</strong> en ese periodo.</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let myChart = null;

        async function viewChart(teamId, teamName) {
            document.getElementById('modalTitle').innerText = 'Evolución: ' + teamName;
            document.getElementById('chartModal').style.display = 'block';
            
            const response = await fetch(`admin.php?action=get_team_stats&team_id=${teamId}`);
            const rawData = await response.json();
            
            // Organizar datos por alumno
            const periods = [...new Set(rawData.map(d => d.period_label))];
            const students = {};
            
            rawData.forEach(d => {
                const name = `${d.first_name} ${d.last_name}`;
                if (!students[name]) students[name] = { label: name, data: [], sm: [] };
                students[name].data.push(d.avg_score ? (parseFloat(d.avg_score) / 4 * 10).toFixed(1) : null);
                students[name].sm.push(d.sm_score ? parseFloat(d.sm_score) : null);
            });

            const datasets = Object.values(students).map((s, idx) => {
                const colors = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565', '#ecc94b', '#38b2ac'];
                const color = colors[idx % colors.length];
                return {
                    label: s.label,
                    data: s.data,
                    borderColor: color,
                    backgroundColor: color,
                    tension: 0.3,
                    pointRadius: s.sm.map(v => v !== null ? 9 : 4),
                    pointHoverRadius: s.sm.map(v => v !== null ? 11 : 6),
                    pointBorderWidth: s.sm.map(v => v !== null ? 4 : 1),
                    pointBorderColor: s.sm.map(v => {
                        if (v === null) return color;
                        if (v >= 3.5) return '#2f855a'; // Excelente/Bien (Verde)
                        if (v >= 2.5) return '#b7791f'; // Regular (Naranja)
                        return '#c53030'; // Mal (Rojo)
                    }),
                    pointBackgroundColor: s.sm.map(v => v !== null ? '#fff' : color)
                };
            });

            const ctx = document.getElementById('performanceChart').getContext('2d');
            if (myChart) myChart.destroy();
            
            myChart = new Chart(ctx, {
                type: 'line',
                data: { labels: periods, datasets: datasets },
                options: {
                    responsive: true,
                    scales: {
                        y: { min: 0, max: 10, title: { display: true, text: 'Nota (0-10)' } },
                        x: { title: { display: true, text: 'Periodos Bisemanales' } }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                afterLabel: function(context) {
                                    const smVal = students[context.dataset.label].sm[context.dataIndex];
                                    if (smVal !== null) {
                                        const noteSm = (smVal / 4 * 10).toFixed(1);
                                        let status = 'Mal';
                                        if (smVal >= 3.5) status = 'Bien';
                                        else if (smVal >= 2.5) status = 'Regular';
                                        return `[Scrum Master] Desempeño: ${status} (${noteSm}/10)`;
                                    }
                                    return '';
                                }
                            }
                        }
                    }
                }
            });
        }

        function closeModal() {
            document.getElementById('chartModal').style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == document.getElementById('chartModal')) closeModal();
        }

        document.addEventListener('DOMContentLoaded', function() {
            new Choices('#student-select', { searchEnabled: true, itemSelectText: '' });
        });
    </script>
</body>
</html>
