<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['user_id']) || $_SESSION['role_id'] != 1) {
    header('Location: index.php');
    exit;
}

// Acciones POST
$success = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['create_team'])) {
        $stmt = $pdo->prepare("INSERT INTO teams (name) VALUES (?)");
        $stmt->execute([$_POST['team_name']]);
        $success = "Equipo creado.";
    }
    if (isset($_POST['rename_team'])) {
        $stmt = $pdo->prepare("UPDATE teams SET name = ? WHERE id = ?");
        $stmt->execute([$_POST['new_name'], $_POST['team_id']]);
        $success = "Nombre actualizado.";
    }
    if (isset($_POST['delete_team'])) {
        $pdo->prepare("UPDATE users SET team_id = NULL WHERE team_id = ?")->execute([$_POST['team_id']]);
        $pdo->prepare("DELETE FROM teams WHERE id = ?")->execute([$_POST['team_id']]);
        $success = "Equipo eliminado.";
    }
    if (isset($_POST['assign_team'])) {
        $pdo->prepare("UPDATE users SET team_id = ? WHERE id = ?")->execute([$_POST['team_id'], $_POST['user_id']]);
        $success = "Alumno asignado.";
    }
    if (isset($_POST['remove_from_team'])) {
        $pdo->prepare("UPDATE users SET team_id = NULL WHERE id = ?")->execute([$_POST['user_id']]);
        $success = "Alumno removido.";
    }
    if (isset($_POST['action']) && $_POST['action'] === 'toggle_eval') {
        $enabled = isset($_POST['toggle_eval']) ? 1 : 0;
        $pdo->prepare("UPDATE settings SET val = ? WHERE key_name = 'evaluations_enabled'")->execute([$enabled]);
        $success = "Estado de encuestas cambiado.";
    }
    if (isset($_POST['update_period'])) {
        $pdo->query("UPDATE evaluation_periods SET is_active = 0");
        $pdo->prepare("UPDATE evaluation_periods SET is_active = 1 WHERE id = ?")->execute([$_POST['period_id']]);
        $success = "Periodo actualizado.";
    }
}

// Carga de Datos
$eval_enabled = (bool)$pdo->query("SELECT val FROM settings WHERE key_name = 'evaluations_enabled'")->fetchColumn();
$current_period = $pdo->query("SELECT * FROM evaluation_periods WHERE is_active = 1 LIMIT 1")->fetch() ?: $pdo->query("SELECT * FROM evaluation_periods WHERE CURDATE() BETWEEN start_date AND end_date LIMIT 1")->fetch();

$all_teams = $pdo->query("SELECT * FROM teams ORDER BY name ASC")->fetchAll();
$teams_data = [];
foreach ($all_teams as $t) {
    $stmt = $pdo->prepare("SELECT id, first_name, last_name, year_div FROM users WHERE team_id = ?");
    $stmt->execute([$t['id']]);
    $t['members'] = $stmt->fetchAll();
    $stmt = $pdo->prepare("SELECT AVG((score_teamwork + score_development + score_class_work) / 3) FROM evaluations e JOIN users u ON e.evaluatee_id = u.id WHERE u.team_id = ?");
    $stmt->execute([$t['id']]);
    $avg = $stmt->fetchColumn();
    $t['avg_score'] = $avg ? ($avg / 4) * 10 : 0;
    $teams_data[] = $t;
}

$unassigned = $pdo->query("SELECT * FROM users WHERE role_id = 2 AND team_id IS NULL ORDER BY last_name ASC")->fetchAll();

$reports = $pdo->query("
    SELECT 
        u.id, u.first_name, u.last_name, u.year_div, u.school_year, t.name as team_name,
        AVG(e.score_teamwork) as avg_tw, AVG(e.score_development) as avg_dv, AVG(e.score_class_work) as avg_cw,
        (SELECT AVG((score_sm_leadership + score_sm_facilitation + score_sm_support) / 3) FROM evaluations WHERE evaluatee_id = u.id AND is_sm_eval = 1) as avg_sm
    FROM users u
    LEFT JOIN teams t ON u.team_id = t.id
    LEFT JOIN evaluations e ON u.id = e.evaluatee_id
    WHERE u.role_id = 2
    GROUP BY u.id
    ORDER BY t.name, u.last_name
")->fetchAll();

// API Gráficas
if (isset($_GET['action']) && $_GET['action'] === 'get_team_stats') {
    $stmt = $pdo->prepare("SELECT u.first_name, u.last_name, p.label as p_label, AVG((e.score_teamwork + e.score_development + e.score_class_work) / 3) as score FROM users u CROSS JOIN (SELECT * FROM evaluation_periods WHERE start_date <= CURDATE() ORDER BY start_date ASC) p LEFT JOIN evaluations e ON u.id = e.evaluatee_id AND e.period_id = p.id WHERE u.team_id = ? GROUP BY u.id, p.id ORDER BY p.start_date ASC");
    $stmt->execute([$_GET['team_id']]);
    header('Content-Type: application/json');
    echo json_encode($stmt->fetchAll());
    exit;
}
?>
<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <title>Scrum Admin</title>
    <script>
        // Aplicar tema inmediatamente para evitar parpadeo blanco
        (function() {
            const theme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', theme);
        })();
    </script>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css"/>
    <script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <header>
        <div style="display:flex; align-items:center; gap:20px;">
            <strong>Panel Docente</strong>
            <label class="switch theme-toggle">
                <input type="checkbox" id="themeCheckbox" onchange="toggleTheme(event)">
                <span class="switch-slider"></span>
            </label>
        </div>
        <a href="logout.php" class="btn btn-primary">Salir</a>
    </header>

    <main>
        <?php if ($success): ?> <div class="alert alert-success"><?php echo $success; ?></div> <?php endif; ?>

        <div class="grid" style="grid-template-columns: 1fr 1.5fr;">
            <div class="card" style="display:flex; align-items:center; justify-content:space-around; text-align:center;">
                <div>
                    <h4 style="margin:0 0 10px 0;">Encuestas</h4>
                    <form method="POST"><label class="switch"><input type="checkbox" name="toggle_eval" <?php echo $eval_enabled?'checked':''; ?> onchange="this.form.submit()"><span class="switch-slider"></span></label><input type="hidden" name="action" value="toggle_eval"></form>
                    <small><?php echo $eval_enabled?'ACTIVAS':'CERRADAS'; ?></small>
                </div>
                <div style="border-left: 1px solid var(--border-color); padding-left: 20px; text-align:left;">
                    <h4 style="margin:0 0 10px 0;">Periodo Activo</h4>
                    <form method="POST" style="display:flex; gap:10px;">
                        <select name="period_id" style="width:180px;"><?php foreach($pdo->query("SELECT * FROM evaluation_periods ORDER BY start_date") as $p): ?><option value="<?php echo $p['id']; ?>" <?php echo ($current_period && $p['id']==$current_period['id'])?'selected':''; ?>><?php echo $p['label']; ?></option><?php endforeach; ?></select>
                        <button type="submit" name="update_period" class="btn btn-primary">Fijar</button>
                    </form>
                </div>
            </div>

            <div class="card">
                <h4 style="margin:0 0 15px 0;">Crear y Asignar</h4>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                    <form method="POST">
                        <label>Nuevo Equipo</label>
                        <div style="display:flex; gap:5px;"><input type="text" name="team_name" placeholder="Nombre..." required style="flex:1"><button type="submit" name="create_team" class="btn btn-primary">+</button></div>
                    </form>
                    <form method="POST">
                        <label>Asignar Alumno</label>
                        <select name="user_id" id="student-select">
                            <option value="">Buscar alumno...</option>
                            <?php foreach($unassigned as $u): ?><option value="<?php echo $u['id']; ?>"><?php echo $u['last_name'].', '.$u['first_name'].' ('.$u['year_div'].')'; ?></option><?php endforeach; ?>
                        </select>
                        <div style="display:flex; gap:5px; margin-top:10px;">
                            <select name="team_id" style="flex:1;"><?php foreach($all_teams as $t): ?><option value="<?php echo $t['id']; ?>"><?php echo $t['name']; ?></option><?php endforeach; ?></select>
                            <button type="submit" name="assign_team" class="btn btn-primary">OK</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <h2 style="margin: 2rem 0 1rem 0;">👥 Equipos (<?php echo count($all_teams); ?>)</h2>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:1.5rem;">
            <?php foreach($teams_data as $t): ?>
                <div class="card" style="margin:0; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:10px;">
                        <form method="POST" style="display:flex; gap:5px; flex:1;">
                            <input type="hidden" name="team_id" value="<?php echo $t['id']; ?>">
                            <input type="text" name="new_name" value="<?php echo htmlspecialchars($t['name']); ?>" style="font-weight:700; border:none; background:transparent; padding:0; width:100%; color:var(--primary-color);">
                            <button type="submit" name="rename_team" class="btn-icon" title="Guardar">💾</button>
                        </form>
                        <form method="POST" onsubmit="return confirm('¿Eliminar?');">
                            <input type="hidden" name="team_id" value="<?php echo $t['id']; ?>">
                            <button type="submit" name="delete_team" class="btn-icon" style="color:#e53e3e;">🗑️</button>
                        </form>
                    </div>
                    <div style="flex:1; max-height:200px; overflow-y:auto; margin-bottom:15px;">
                        <?php foreach($t['members'] as $m): ?>
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px dashed var(--border-color); font-size:0.9rem;">
                                <span><?php echo $m['last_name'].', '.$m['first_name']; ?></span>
                                <form method="POST"><input type="hidden" name="user_id" value="<?php echo $m['id']; ?>"><button type="submit" name="remove_from_team" class="btn-icon" style="color:var(--text-muted);">✕</button></form>
                            </div>
                        <?php endforeach; ?>
                    </div>
                    <button onclick="viewChart(<?php echo $t['id']; ?>, '<?php echo addslashes($t['name']); ?>')" class="btn btn-primary" style="width:100%; justify-content:center;">📊 Ver Evolución</button>
                </div>
            <?php endforeach; ?>
        </div>

        <h2 style="margin: 3rem 0 1rem 0;">📊 Reporte General</h2>
        <div class="card" style="padding:1rem;">
            <div style="display:flex; gap:15px; margin-bottom:20px;">
                <input type="text" id="reportSearch" placeholder="🔍 Buscar por nombre, equipo, año..." style="flex:1" onkeyup="filterReports()">
                <select id="teamFilter" onchange="filterReports()" style="width:250px;"><option value="">Todos los equipos</option><?php foreach($all_teams as $t): ?><option value="<?php echo $t['name']; ?>"><?php echo $t['name']; ?></option><?php endforeach; ?></select>
            </div>
            <div class="table-container">
                <table id="reportsTable">
                    <colgroup>
                        <col style="width: 25%;">
                        <col style="width: 15%;">
                        <col style="width: 12%;">
                        <col style="width: 10%;">
                        <col style="width: 10%;">
                        <col style="width: 10%;">
                        <col style="width: 10%;">
                        <col style="width: 8%;">
                    </colgroup>
                    <thead>
                        <tr>
                            <th class="sortable" onclick="sortTable(0)">Alumno</th>
                            <th class="sortable" onclick="sortTable(1)">Equipo</th>
                            <th class="sortable" onclick="sortTable(2)">Año/Div</th>
                            <th class="sortable" onclick="sortTable(3)">T.E</th>
                            <th class="sortable" onclick="sortTable(4)">Dev</th>
                            <th class="sortable" onclick="sortTable(5)">Clase</th>
                            <th class="sortable" onclick="sortTable(6)">Gral</th>
                            <th class="sortable" onclick="sortTable(7)">SM</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach($reports as $r): 
                            $v_tw = (float)($r['avg_tw']??0); $v_dv = (float)($r['avg_dv']??0); $v_cw = (float)($r['avg_cw']??0);
                            $nf = ($v_tw + $v_dv + $v_cw) / 3; $nota = $nf ? ($nf / 4) * 10 : 0;
                            $nsm = $r['avg_sm'] ? ($r['avg_sm'] / 4) * 10 : 0;
                        ?>
                            <tr>
                                <td><strong><?php echo $r['last_name'].', '.$r['first_name']; ?></strong></td>
                                <td><?php echo $r['team_name'] ?: '-'; ?></td>
                                <td><?php echo $r['year_div'] ?: '-'; ?></td>
                                <td><?php echo number_format($v_tw,1); ?></td>
                                <td><?php echo number_format($v_dv,1); ?></td>
                                <td><?php echo number_format($v_cw,1); ?></td>
                                <td style="background:rgba(74,144,226,0.1); font-weight:700;"><?php echo number_format($nota,1); ?></td>
                                <td style="background:rgba(80,227,194,0.1);"><?php echo $r['avg_sm']?number_format($nsm,1):'-'; ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </main>

    <div id="chartModal" class="modal">
        <div class="modal-content">
            <header style="background:var(--primary-color); color:white; padding:15px 25px; display:flex; justify-content:space-between; align-items:center;">
                <h3 id="modalTitle" style="margin:0;"></h3>
                <button onclick="closeModal()" style="background:none; border:none; color:white; font-size:2rem; cursor:pointer;">&times;</button>
            </header>
            <div style="padding:30px; height:450px;"><canvas id="performanceChart"></canvas></div>
        </div>
    </div>

    <script>
        function toggleTheme(e) { 
            const theme = e.target.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme); 
            localStorage.setItem('theme', theme); 
        }

        document.addEventListener('DOMContentLoaded', () => {
            const theme = localStorage.getItem('theme') || 'dark';
            if(document.querySelector('#themeCheckbox')) document.querySelector('#themeCheckbox').checked = (theme==='dark');
            new Choices('#student-select', { searchEnabled: true, itemSelectText: '', shouldSort: false });
        });

        function filterReports() {
            const s = document.getElementById('reportSearch').value.toLowerCase();
            const t = document.getElementById('teamFilter').value;
            document.querySelectorAll('#reportsTable tbody tr').forEach(row => {
                const text = row.innerText.toLowerCase();
                const team = row.cells[1].innerText;
                row.style.display = (text.includes(s) && (t==="" || team===t)) ? "" : "none";
            });
        }

        function sortTable(n) {
            const table = document.getElementById("reportsTable");
            let rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
            switching = true; dir = "asc";
            while (switching) {
                switching = false; rows = table.rows;
                for (i = 1; i < (rows.length - 1); i++) {
                    shouldSwitch = false;
                    x = rows[i].getElementsByTagName("TD")[n];
                    y = rows[i + 1].getElementsByTagName("TD")[n];
                    let xV = x.innerText.toLowerCase(), yV = y.innerText.toLowerCase();
                    if(!isNaN(parseFloat(xV)) && !isNaN(parseFloat(yV))) { xV = parseFloat(xV); yV = parseFloat(yV); }
                    if (dir == "asc") { if (xV > yV) { shouldSwitch = true; break; }
                    } else { if (xV < yV) { shouldSwitch = true; break; } }
                }
                if (shouldSwitch) { rows[i].parentNode.insertBefore(rows[i + 1], rows[i]); switching = true; switchcount++; }
                else if (switchcount == 0 && dir == "asc") { dir = "desc"; switching = true; }
            }
            document.querySelectorAll('th').forEach(th => th.classList.remove('sort-asc', 'sort-desc'));
            table.querySelectorAll('th')[n].classList.add(dir === 'asc' ? 'sort-asc' : 'sort-desc');
        }

        let myChart = null;
        async function viewChart(id, name) {
            document.getElementById('modalTitle').innerText = 'Evolución: ' + name;
            document.getElementById('chartModal').style.display = 'flex';
            const res = await fetch(`admin.php?action=get_team_stats&team_id=${id}`);
            const data = await res.json();
            const periods = [...new Set(data.map(d => d.p_label))];
            const students = {};
            data.forEach(d => {
                const n = d.first_name+' '+d.last_name;
                if(!students[n]) students[n] = { label: n, data: [] };
                students[n].data.push(d.score ? (parseFloat(d.score)/4*10).toFixed(1) : null);
            });
            const ctx = document.getElementById('performanceChart').getContext('2d');
            if(myChart) myChart.destroy();
            myChart = new Chart(ctx, { type: 'line', data: { labels: periods, datasets: Object.values(students).map((s,i) => ({ label: s.label, data: s.data, borderColor: ['#4a90e2','#48bb78','#ed8936','#9f7aea','#f56565'][i%5], tension: 0.3 })) }, options: { responsive: true, maintainAspectRatio: false } });
        }
        function closeModal() { document.getElementById('chartModal').style.display = 'none'; }
        window.onclick = e => { if(e.target == document.getElementById('chartModal')) closeModal(); }
    </script>
</body>
</html>
