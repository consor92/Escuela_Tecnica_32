'use server';
import pool from '@/lib/db';

export async function getCursosAll() {
  const [rows]: any = await pool.execute(
    `SELECT c.*, e.nombre as especialidad_nombre
     FROM asis_cursos c
     JOIN asis_especialidades e ON e.id = c.especialidad_id
     WHERE c.activo = 1
     ORDER BY c.ciclo_lectivo DESC, c.anio DESC, c.nombre`
  );
  return rows;
}

export async function getBimestres() {
  const [rows]: any = await pool.execute('SELECT * FROM scrum_bimestres_config ORDER BY bimestre');
  return rows;
}

async function buildClassDays(cursoId, start_date, end_date) {
  const [horarios]: any = await pool.execute('SELECT * FROM asis_horarios WHERE curso_id = ?', [cursoId]);
  const [noLaborables]: any = await pool.execute('SELECT fecha FROM asis_dias_no_laborables WHERE (curso_id = ? OR aplica_todos = 1) AND fecha BETWEEN ? AND ?', [cursoId, start_date, end_date]);
  const feriados = noLaborables.map(d => d.fecha.toISOString().split('T')[0]);
  const [docCount]: any = await pool.execute("SELECT COUNT(*) as total FROM asis_docentes_curso WHERE curso_id = ? AND rol = 'docente'", [cursoId]);
  const totalDoc = docCount[0]?.total || 0;
  const [ausencias]: any = await pool.execute('SELECT fecha, COUNT(DISTINCT user_id) as ausentes FROM asis_ausencias_docente WHERE curso_id = ? AND fecha BETWEEN ? AND ? GROUP BY fecha', [cursoId, start_date, end_date]);
  const sinDocSet = new Set();
  for (const a of ausencias) { if (a.ausentes >= totalDoc) sinDocSet.add(a.fecha.toISOString().split('T')[0]); }
  const [eventos]: any = await pool.execute('SELECT fecha, horas_reloj, horas_catedra FROM asis_eventos_especiales WHERE curso_id = ? AND fecha BETWEEN ? AND ?', [cursoId, start_date, end_date]);
  const days = []; const start = new Date(start_date); const end = new Date(end_date);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const fs = d.toISOString().split('T')[0]; const ds = d.getDay() === 0 ? 7 : d.getDay();
    if (!horarios.some(h => h.dia_semana === ds)) continue;
    const ev = eventos.find(e => e.fecha.toISOString().split('T')[0] === fs);
    for (const h of horarios) { if (h.dia_semana === ds) days.push({ fecha: fs, diaSem: ds, hsReloj: ev ? Number(ev.horas_reloj) : Number(h.hs_reloj), hsCatedra: ev ? Number(ev.horas_catedra) : Number(h.hs_catedra), isEvento: !!ev }); }
  }
  const sinDocente = Array.from(sinDocSet); const totalClases = days.filter(d => !d.isEvento).length;
  return { days, feriados, sinDocente, totalClases, feriadosCount: feriados.length, sinDocenteCount: sinDocente.length };
}

export async function getResumenGlobalCurso(cursoId, bimestre) {
  const [bim]: any = await pool.execute('SELECT * FROM scrum_bimestres_config WHERE bimestre = ?', [bimestre]);
  if (bim.length === 0) return { error: 'Bimestre no encontrado' };
  const { start_date, end_date } = bim[0];
  const [alumnos]: any = await pool.execute('SELECT ac.id as alumno_curso_id, u.id as user_id, u.first_name, u.last_name FROM asis_alumnos_curso ac JOIN users u ON u.id = ac.user_id WHERE ac.curso_id = ? AND ac.activo = 1', [cursoId]);
  const { days, totalClases, sinDocenteCount, feriadosCount } = await buildClassDays(cursoId, start_date, end_date);
  const filas = []; let tp = 0, ta = 0, tt = 0, tf = 0, th = 0;
  for (const a of alumnos) {
    const [registros]: any = await pool.execute('SELECT fecha, estado FROM asis_registros WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?', [a.alumno_curso_id, start_date, end_date]);
    const regMap = new Map(registros.map(r => [r.fecha.toISOString().split('T')[0], r.estado]));
    const [faltas]: any = await pool.execute('SELECT COALESCE(SUM(tipo_falta),0) as total FROM asis_faltas WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?', [a.alumno_curso_id, start_date, end_date]);
    let p = 0, au = 0, t2 = 0, hs = 0;
    for (const day of days) { if (day.isEvento) continue; const est = regMap.get(day.fecha); if (est === 'presente') { p++; hs += day.hsReloj; } else if (est === 'ausente') au++; else if (est === 'tardia' || est === 'retiro_anticipado') { t2++; hs += day.hsReloj * 0.75; } }
    const faltaTotal = Number(faltas[0]?.total || 0); tp += p; ta += au; tt += t2; tf += faltaTotal; th += hs;
    filas.push({ alumno_curso_id: a.alumno_curso_id, user_id: a.user_id, first_name: a.first_name, last_name: a.last_name, presentes: p, ausentes: au, tardias: t2, horas: parseFloat(hs.toFixed(2)), faltas_totales: parseFloat(faltaTotal.toFixed(2)), porcentaje: totalClases > 0 ? parseFloat(((p / totalClases) * 100).toFixed(1)) : 0 });
  }
  const totalAlumnos = alumnos.length; const prom = totalAlumnos > 0 ? parseFloat(((tp / (totalClases * totalAlumnos)) * 100).toFixed(1)) : 0;
  return { bimestre, start_date, end_date, total_clases: totalClases, sin_docente: sinDocenteCount, feriados: feriadosCount, dias_habiles: days.length, total_alumnos: totalAlumnos, promedio_asistencia: prom, total_ausencias: ta, total_faltas: parseFloat(tf.toFixed(2)), total_horas: parseFloat(th.toFixed(2)), alumnos: filas };
}

export async function getDetalleAlumnoCompleto(cursoId, user_id, bimestre) {
  const [bim]: any = await pool.execute('SELECT * FROM scrum_bimestres_config WHERE bimestre = ?', [bimestre]);
  if (bim.length === 0) return { error: 'Bimestre no encontrado' };
  const { start_date, end_date } = bim[0];
  const [alumnoCurso]: any = await pool.execute('SELECT ac.id as alumno_curso_id FROM asis_alumnos_curso ac WHERE ac.curso_id = ? AND ac.user_id = ? AND ac.activo = 1', [cursoId, user_id]);
  if (alumnoCurso.length === 0) return { error: 'Alumno no encontrado en este curso' };
  const acId = alumnoCurso[0].alumno_curso_id;
  const [userData]: any = await pool.execute('SELECT id, first_name, last_name, email, dni, telefono, telefono_alternativo, fecha_nacimiento, direccion, cuil, nacionalidad, genero FROM users WHERE id = ?', [user_id]);
  const { days, feriados, sinDocente, totalClases } = await buildClassDays(cursoId, start_date, end_date);
  const [registros]: any = await pool.execute('SELECT fecha, estado, hora_ingreso, hora_egreso, justificacion FROM asis_registros WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ? ORDER BY fecha', [acId, start_date, end_date]);
  const regMap = new Map(registros.map(r => [r.fecha.toISOString().split('T')[0], r]));
  const [faltas]: any = await pool.execute('SELECT fecha, tipo_falta FROM asis_faltas WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?', [acId, start_date, end_date]);
  const faltaMap = new Map(faltas.map(r => [r.fecha.toISOString().split('T')[0], Number(r.tipo_falta)]));
  const dias = []; let hsAcum = 0, p = 0, au = 0, t = 0, faltaTotal = 0;
  for (const day of days) { const isFeriado = feriados.includes(day.fecha); const isSinDoc = sinDocente.includes(day.fecha); const reg = regMap.get(day.fecha); const est = reg?.estado; const faltaVal = faltaMap.get(day.fecha) || 0; faltaTotal += faltaVal; if (!day.isEvento) { if (est === 'presente') { p++; hsAcum += day.hsReloj; } else if (est === 'ausente') au++; else if (est === 'tardia' || est === 'retiro_anticipado') { t++; hsAcum += day.hsReloj * 0.75; } }
    dias.push({ fecha: day.fecha, diaSem: day.diaSem, isEvento: day.isEvento, isFeriado, isSinDoc, hsReloj: day.hsReloj, hsCatedra: day.hsCatedra, estado: est || (isFeriado ? 'feriado' : isSinDoc ? 'sin_docente' : ''), hora_ingreso: (reg?.hora_ingreso||'').substring(0,5), hora_egreso: (reg?.hora_egreso||'').substring(0,5), justificacion: reg?.justificacion||'', falta: parseFloat(faltaVal.toFixed(2)) });
  }
  return { user: userData[0] || null, total_clases: totalClases, presentes: p, ausentes: au, tardias: t, horas_acumuladas: parseFloat(hsAcum.toFixed(2)), faltas_totales: parseFloat(faltaTotal.toFixed(2)), dias };
}

export async function getResumenAnual(cursoId) {
  const [bimestres]: any = await pool.execute('SELECT * FROM scrum_bimestres_config ORDER BY bimestre');
  const [alumnos]: any = await pool.execute('SELECT ac.id as alumno_curso_id, u.id as user_id, u.first_name, u.last_name FROM asis_alumnos_curso ac JOIN users u ON u.id = ac.user_id WHERE ac.curso_id = ? AND ac.activo = 1', [cursoId]);
  const bimData = []; let anualClases = 0, anualSinDoc = 0, anualFeriados = 0;
  for (const b of bimestres) { const r = await getResumenGlobalCurso(cursoId, b.bimestre); if (r.error) continue; bimData.push(r); anualClases += r.total_clases || 0; anualSinDoc += r.sin_docente || 0; anualFeriados += r.feriados || 0; }
  const filas = []; let totalP = 0, toA = 0, toT = 0, toF = 0, toH = 0;
  for (const a of alumnos) {
    let p = 0, au = 0, t = 0, ft = 0, hs = 0;
    for (const b of bimestres) { const r = await getResumenGlobalCurso(cursoId, b.bimestre); if (r.error) continue; const al = r.alumnos.find(x => x.user_id === a.user_id); if (al) { p += al.presentes; au += al.ausentes; t += al.tardias; ft += al.faltas_totales; hs += al.horas || 0; } }
    totalP += p; toA += au; toT += t; toF += ft; toH += hs;
    filas.push({ alumno_curso_id: a.alumno_curso_id, user_id: a.user_id, first_name: a.first_name, last_name: a.last_name, presentes: p, ausentes: au, tardias: t, horas: parseFloat(hs.toFixed(2)), faltas_totales: parseFloat(ft.toFixed(2)), porcentaje: anualClases > 0 ? parseFloat(((p / anualClases) * 100).toFixed(1)) : 0 });
  }
  return { total_clases: anualClases, sin_docente: anualSinDoc, feriados: anualFeriados, total_alumnos: alumnos.length, promedio_asistencia: (alumnos.length > 0 && anualClases > 0) ? parseFloat(((totalP / (anualClases * alumnos.length)) * 100).toFixed(1)) : 0, total_horas: parseFloat(toH.toFixed(2)), bimestres: bimData, alumnos: filas };
}

function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

export async function exportExcelGlobal() {
  const cursos = await getCursosAll(); const bimestres = await getBimestres();
  let h = '<html><head><meta charset="UTF-8"><style>th{background:#6366f1;color:#fff;padding:6px 10px}td{padding:4px 10px}tr:nth-child(even){background:#f5f5f5}.tot{background:#dbeafe;font-weight:700}</style></head><body><h2>Reporte Global de Asistencia</h2><table border="1" cellpadding="4" cellspacing="0">';
  for (const c of cursos) {
    h += '<tr style="background:#e0e7ff"><th colspan="10" style="text-align:left;color:#4338ca">' + esc(c.nombre) + ' - ' + esc(c.especialidad_nombre) + ' (' + c.anio + '/' + c.division + ')</th></tr>';
    h += '<tr><th>Bim</th><th>Alumnos</th><th>Clases</th><th>SinDoc</th><th>Fer</th><th>Dias</th><th>Asist%</th><th>Aus</th><th>Faltas</th><th>Hs</th></tr>';
    for (const b of bimestres) { const r = await getResumenGlobalCurso(c.id, b.bimestre); if (r.error) continue; h += '<tr><td>' + b.bimestre + '</td><td>' + r.total_alumnos + '</td><td>' + r.total_clases + '</td><td>' + r.sin_docente + '</td><td>' + r.feriados + '</td><td>' + r.dias_habiles + '</td><td>' + r.promedio_asistencia + '%</td><td>' + r.total_ausencias + '</td><td>' + r.total_faltas + '</td><td>' + r.total_horas + '</td></tr>'; }
  }
  h += '</table></body></html>'; return h;
}

export async function exportExcelCurso(cursoId, bimestre) {
  const r = await getResumenGlobalCurso(cursoId, bimestre);
  if (r.error) return '<p>Error: ' + r.error + '</p>';
  const [cursoInfo]: any = await pool.execute('SELECT c.*, e.nombre as esp FROM asis_cursos c JOIN asis_especialidades e ON e.id=c.especialidad_id WHERE c.id=?', [cursoId]);
  let h = '<html><head><meta charset="UTF-8"><style>th{background:#6366f1;color:#fff;padding:6px 10px}td{padding:4px 10px}tr:nth-child(even){background:#f5f5f5}</style></head><body>';
  h += '<h2>' + esc(cursoInfo[0]?.nombre || 'Curso') + ' - Bimestre ' + bimestre + '</h2>';
  h += '<p>Clases: ' + r.total_clases + ' | Sin docente: ' + r.sin_docente + ' | Feriados: ' + r.feriados + ' | Dias habiles: ' + r.dias_habiles + ' | Alumnos: ' + r.total_alumnos + ' | Asistencia: ' + r.promedio_asistencia + '% | Horas: ' + r.total_horas + '</p>';
  h += '<table border="1" cellpadding="4" cellspacing="0"><tr><th>#</th><th>Apellido</th><th>Nombre</th><th>Presentes</th><th>Ausentes</th><th>Tardias</th><th>Horas</th><th>Faltas</th><th>% Asist</th></tr>';
  r.alumnos.forEach((a, i) => { h += '<tr><td>' + (i+1) + '</td><td>' + esc(a.last_name) + '</td><td>' + esc(a.first_name) + '</td><td>' + a.presentes + '</td><td>' + a.ausentes + '</td><td>' + a.tardias + '</td><td>' + a.horas + '</td><td>' + a.faltas_totales + '</td><td>' + a.porcentaje + '%</td></tr>'; });
  h += '</table></body></html>'; return h;
}

