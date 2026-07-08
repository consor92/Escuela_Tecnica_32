'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getEspecialidades() {
  const [rows]: any = await pool.execute('SELECT * FROM asis_especialidades WHERE activo = 1 ORDER BY nombre');
  return rows;
}

export async function createEspecialidad(nombre: string) {
  await pool.execute('INSERT INTO asis_especialidades (nombre, activo) VALUES (?, 1)', [nombre]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function updateEspecialidad(id: number, nombre: string) {
  await pool.execute('UPDATE asis_especialidades SET nombre = ? WHERE id = ?', [nombre, id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function deleteEspecialidad(id: number) {
  await pool.execute('UPDATE asis_especialidades SET activo = 0 WHERE id = ?', [id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function getCursos() {
  const [rows]: any = await pool.execute(
    `SELECT c.*, e.nombre as especialidad_nombre
     FROM asis_cursos c
     JOIN asis_especialidades e ON e.id = c.especialidad_id
      WHERE c.activo = 1
      ORDER BY c.ciclo_lectivo DESC, c.anio DESC, c.nombre`
  );
  return rows;
}

function extractDivision(nombre: string, dbDivision: string): string {
  if (dbDivision) return dbDivision.toUpperCase().replace(/\s+/g, '');
  if (!nombre || nombre === '-Docente') return 'X';
  const parts = nombre.split('-');
  if (parts.length === 2 && /^\d{4}$/.test(parts[1])) {
    const afterGrade = parts[0].replace(/^\d+/, '');
    const m = afterGrade.match(/^[A-Za-z]+(\d+\w*)/);
    return m ? m[1].toUpperCase() : afterGrade.toUpperCase();
  }
  if (parts.length >= 2) {
    for (let i = 1; i < parts.length; i++) {
      if (parts[i] && !/^\d{4}$/.test(parts[i])) return parts[i].toUpperCase();
    }
  }
  return 'X';
}

function generarCodigoCurso(anio: number, division: string, turno: string, cicloLectivo: number, nombre?: string): string {
  const turnoAbr = turno.substring(0, 2).toUpperCase();
  const div = extractDivision(nombre || '', division);
  return anio + '-' + div + '-' + turnoAbr + '-' + cicloLectivo;
}

export async function createCurso(data: any) {
  const { nombre, descripcion, anio, especialidad_id, division, turno, ciclo_lectivo } = data;
  const cl = ciclo_lectivo || new Date().getFullYear();
  const code = generarCodigoCurso(anio, division, turno, cl, nombre);
  const [result]: any = await pool.execute(
    'INSERT INTO asis_cursos (nombre, descripcion, anio, especialidad_id, division, turno, ciclo_lectivo, codigo_automatricula, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
    [nombre, descripcion || '', anio, especialidad_id, division, turno, cl, code]
  );
  // Auto-asignar referentes al nuevo curso
  const [refs]: any = await pool.execute('SELECT id FROM users WHERE role_id = 5');
  for (const r of refs) {
    await pool.execute(
      'INSERT IGNORE INTO asis_docentes_curso (curso_id, user_id, rol) VALUES (?, ?, ?)',
      [result.insertId, r.id, 'preceptor']
    );
  }
  revalidatePath('/admin/config');
  return { success: true };
}

export async function updateCurso(id: number, data: any) {
  const { nombre, descripcion, anio, especialidad_id, division, turno, ciclo_lectivo } = data;
  const cl = ciclo_lectivo || new Date().getFullYear();
  const code = generarCodigoCurso(anio, division, turno, cl, nombre);
  await pool.execute(
    'UPDATE asis_cursos SET nombre = ?, descripcion = ?, anio = ?, especialidad_id = ?, division = ?, turno = ?, ciclo_lectivo = ?, codigo_automatricula = ? WHERE id = ?',
    [nombre, descripcion || '', anio, especialidad_id, division, turno, cl, code, id]
  );
  revalidatePath('/admin/config');
  return { success: true };
}



export async function deleteCurso(id: number) {
  await pool.execute('UPDATE asis_cursos SET activo = 0 WHERE id = ?', [id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function getDocentesCurso(cursoId: number) {
  const [rows]: any = await pool.execute(
    `SELECT dc.*, u.first_name, u.last_name, u.email
     FROM asis_docentes_curso dc
     JOIN users u ON u.id = dc.user_id
     WHERE dc.curso_id = ?
     ORDER BY u.last_name`,
    [cursoId]
  );
  return rows;
}

export async function assignDocente(cursoId: number, userId: number, rol: string, dias_semana: string | null = null) {
  await pool.execute(
    'INSERT IGNORE INTO asis_docentes_curso (curso_id, user_id, rol, dias_semana) VALUES (?, ?, ?, ?)',
    [cursoId, userId, rol, dias_semana]
  );
  revalidatePath('/admin/config');
  return { success: true };
}

export async function updateDocenteDias(id: number, dias_semana: string | null) {
  await pool.execute(
    'UPDATE asis_docentes_curso SET dias_semana = ? WHERE id = ?',
    [dias_semana, id]
  );
  revalidatePath('/admin/config');
  return { success: true };
}

export async function asignarReferentesACurso(cursoId: number) {
  const [refs]: any = await pool.execute('SELECT id FROM users WHERE role_id = 5');
  for (const r of refs) {
    await pool.execute(
      'INSERT IGNORE INTO asis_docentes_curso (curso_id, user_id, rol) VALUES (?, ?, ?)',
      [cursoId, r.id, 'preceptor']
    );
  }
  revalidatePath('/admin/config');
  return { success: true, count: refs.length };
}

export async function asignarReferentesATodosLosCursos() {
  const [cursos]: any = await pool.execute('SELECT id FROM asis_cursos WHERE activo = 1');
  const [refs]: any = await pool.execute('SELECT id FROM users WHERE role_id = 5');
  let total = 0;
  for (const c of cursos) {
    for (const r of refs) {
      await pool.execute(
        'INSERT IGNORE INTO asis_docentes_curso (curso_id, user_id, rol) VALUES (?, ?, ?)',
        [c.id, r.id, 'preceptor']
      );
      total++;
    }
  }
  revalidatePath('/admin/config');
  return { success: true, total };
}

export async function removeDocente(id: number) {
  await pool.execute('DELETE FROM asis_docentes_curso WHERE id = ?', [id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function getDocentesDisponibles() {
  const [rows]: any = await pool.execute(
    "SELECT id, first_name, last_name, email FROM users WHERE role_id IN (1, 3, 4, 5) ORDER BY last_name"
  );
  return rows;
}

export async function getHorarios(cursoId: number) {
  const [rows]: any = await pool.execute(
    'SELECT * FROM asis_horarios WHERE curso_id = ? ORDER BY dia_semana, hora_inicio',
    [cursoId]
  );
  return rows;
}

export async function createHorario(data: any) {
  const { curso_id, dia_semana, hora_inicio, hora_fin, hs_reloj, hs_catedra } = data;
  await pool.execute(
    'INSERT INTO asis_horarios (curso_id, dia_semana, hora_inicio, hora_fin, hs_reloj, hs_catedra) VALUES (?, ?, ?, ?, ?, ?)',
    [curso_id, dia_semana, hora_inicio, hora_fin, hs_reloj, hs_catedra]
  );
  revalidatePath('/admin/config');
  return { success: true };
}

export async function deleteHorario(id: number) {
  await pool.execute('DELETE FROM asis_horarios WHERE id = ?', [id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function getAlumnosCurso(cursoId: number) {
  const [rows]: any = await pool.execute(
    `SELECT ac.*, u.first_name, u.last_name, u.email
     FROM asis_alumnos_curso ac
     JOIN users u ON u.id = ac.user_id
     WHERE ac.curso_id = ?
     ORDER BY u.last_name`,
    [cursoId]
  );
  return rows;
}

export async function inscribirAlumno(cursoId: number, userId: number) {
  await pool.execute(
    'INSERT INTO asis_alumnos_curso (curso_id, user_id, fecha_inscripcion, activo) VALUES (?, ?, CURDATE(), 1)',
    [cursoId, userId]
  );
  revalidatePath('/admin/config');
  return { success: true };
}

export async function desinscribirAlumno(id: number) {
  const [alumno]: any = await pool.execute('SELECT id FROM asis_alumnos_curso WHERE id = ?', [id]);
  if (alumno.length > 0) {
    const alumnoCursoId = alumno[0].id;
    await pool.execute('DELETE FROM asis_registros WHERE alumno_curso_id = ?', [alumnoCursoId]);
    await pool.execute('DELETE FROM asis_faltas WHERE alumno_curso_id = ?', [alumnoCursoId]);
  }
  await pool.execute('DELETE FROM asis_alumnos_curso WHERE id = ?', [id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function moverAlumno(id: number, nuevoCursoId: number) {
  await pool.execute('UPDATE asis_alumnos_curso SET curso_id = ? WHERE id = ?', [nuevoCursoId, id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function getAlumnosDisponibles() {
  const [rows]: any = await pool.execute(
    "SELECT id, first_name, last_name, email FROM users WHERE role_id = 2 ORDER BY last_name"
  );
  return rows;
}

export async function getAlumnoDetalle(userId: number) {
  const [rows]: any = await pool.execute(
    `SELECT id, email, first_name, last_name, dni, telefono, telefono_alternativo,
            fecha_nacimiento, direccion, cuil, nacionalidad, genero,
            year_div, school_year, legacy_id
     FROM users WHERE id = ?`,
    [userId]
  );
  return rows[0] || null;
}

export async function getEventosEspeciales(cursoId: number) {
  const [rows]: any = await pool.execute(
    'SELECT * FROM asis_eventos_especiales WHERE curso_id = ? ORDER BY fecha',
    [cursoId]
  );
  return rows;
}

export async function createEventoEspecial(data: any) {
  const { curso_id, fecha, descripcion, horas_reloj, horas_catedra } = data;
  await pool.execute(
    'INSERT INTO asis_eventos_especiales (curso_id, fecha, descripcion, horas_reloj, horas_catedra) VALUES (?, ?, ?, ?, ?)',
    [curso_id, fecha, descripcion, horas_reloj, horas_catedra]
  );
  revalidatePath('/admin/config');
  return { success: true };
}

export async function deleteEventoEspecial(id: number) {
  await pool.execute('DELETE FROM asis_eventos_especiales WHERE id = ?', [id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function getAusenciasDocente(cursoId: number) {
  const [rows]: any = await pool.execute(
    `SELECT a.*, u.first_name, u.last_name
     FROM asis_ausencias_docente a
     LEFT JOIN users u ON u.id = a.user_id
     WHERE a.curso_id = ? ORDER BY a.fecha`,
    [cursoId]
  );
  return rows;
}

export async function createAusenciaDocente(cursoId: number, fecha: string, motivo: string, userId?: number) {
  await pool.execute(
    'INSERT INTO asis_ausencias_docente (curso_id, fecha, motivo, user_id) VALUES (?, ?, ?, ?)',
    [cursoId, fecha, motivo, userId || null]
  );
  revalidatePath('/admin/config');
  return { success: true };
}

export async function deleteAusenciaDocente(id: number) {
  await pool.execute('DELETE FROM asis_ausencias_docente WHERE id = ?', [id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function getDiasNoLaborables(cursoId?: number) {
  if (cursoId) {
    const [rows]: any = await pool.execute(
      'SELECT * FROM asis_dias_no_laborables WHERE curso_id = ? OR aplica_todos = 1 ORDER BY fecha',
      [cursoId]
    );
    return rows;
  }
  const [rows]: any = await pool.execute('SELECT * FROM asis_dias_no_laborables ORDER BY fecha');
  return rows;
}

export async function createDiaNoLaborable(data: any) {
  const { fecha, motivo, tipo, aplica_todos, curso_id } = data;
  await pool.execute(
    'INSERT INTO asis_dias_no_laborables (fecha, motivo, tipo, aplica_todos, curso_id) VALUES (?, ?, ?, ?, ?)',
    [fecha, motivo, tipo || 'feriado', aplica_todos !== undefined ? aplica_todos : 1, curso_id || null]
  );
  revalidatePath('/admin/config');
  return { success: true };
}

export async function deleteDiaNoLaborable(id: number) {
  await pool.execute('DELETE FROM asis_dias_no_laborables WHERE id = ?', [id]);
  revalidatePath('/admin/config');
  return { success: true };
}

export async function getBimestres() {
  const [rows]: any = await pool.execute('SELECT * FROM scrum_bimestres_config ORDER BY bimestre');
  return rows;
}

export async function calcularHoras(cursoId: number, bimestre: number) {
  const [bim]: any = await pool.execute(
    'SELECT * FROM scrum_bimestres_config WHERE bimestre = ?', [bimestre]
  );
  if (bim.length === 0) return { error: 'Bimestre no encontrado' };
  const { start_date, end_date } = bim[0];

  const [alumnos]: any = await pool.execute(
    `SELECT ac.id as alumno_curso_id, ac.user_id, u.first_name, u.last_name
     FROM asis_alumnos_curso ac
     JOIN users u ON u.id = ac.user_id
     WHERE ac.curso_id = ? AND ac.activo = 1`,
    [cursoId]
  );

  const [horarios]: any = await pool.execute(
    'SELECT * FROM asis_horarios WHERE curso_id = ?', [cursoId]
  );


  const [noLaborables]: any = await pool.execute(
    'SELECT fecha FROM asis_dias_no_laborables WHERE (curso_id = ? OR aplica_todos = 1) AND fecha BETWEEN ? AND ?',
    [cursoId, start_date, end_date]
  );
  const noLabSet = new Set(noLaborables.map((d: any) => d.fecha.toISOString().split('T')[0]));

  // Contar docentes del curso y ausencias por fecha
  const [docentesCount]: any = await pool.execute(
    "SELECT COUNT(*) as total FROM asis_docentes_curso WHERE curso_id = ? AND rol = 'docente'",
    [cursoId]
  );
  const totalDocentes = docentesCount[0]?.total || 0;
  const [ausencias]: any = await pool.execute(
    'SELECT fecha, COUNT(DISTINCT user_id) as ausentes FROM asis_ausencias_docente WHERE curso_id = ? AND fecha BETWEEN ? AND ? GROUP BY fecha',
    [cursoId, start_date, end_date]
  );
  const ausenciaSet = new Set<string>();
  for (const a of ausencias) {
    if (a.ausentes >= totalDocentes) {
      ausenciaSet.add(a.fecha.toISOString().split('T')[0]);
    }
  }

  const [eventos]: any = await pool.execute(
    'SELECT * FROM asis_eventos_especiales WHERE curso_id = ? AND fecha BETWEEN ? AND ?',
    [cursoId, start_date, end_date]
  );
  const eventoMap = new Map<string, { hs_reloj: number; hs_catedra: number }>(
    eventos.map((ev: any) => [
      ev.fecha.toISOString().split('T')[0],
      { hs_reloj: Number(ev.horas_reloj), hs_catedra: Number(ev.horas_catedra) }
    ])
  );

  const fechaInicio = new Date(start_date);
  const fechaFin = new Date(end_date);
  const diasHabiles: { fecha: string; dia_semana: number; hs_reloj: number; hs_catedra: number }[] = [];
  let diasSinClase: number = 0;

  for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
    const fechaStr = d.toISOString().split('T')[0];
    const diaSem = d.getDay() === 0 ? 7 : d.getDay();
    let esDiaClase = false;
    for (const h of horarios) {
      if (h.dia_semana === diaSem) { esDiaClase = true; break; }
    }
    if (!esDiaClase) continue;
    if (noLabSet.has(fechaStr) || ausenciaSet.has(fechaStr)) { diasSinClase++; continue; }
    for (const h of horarios) {
      if (h.dia_semana === diaSem) {
        const ev = eventoMap.get(fechaStr);
        diasHabiles.push({
          fecha: fechaStr,
          dia_semana: diaSem,
          hs_reloj: ev ? ev.hs_reloj : Number(h.hs_reloj),
          hs_catedra: ev ? ev.hs_catedra : Number(h.hs_catedra),
        });
      }
    }
  }

  const totalBimestreHsReloj = diasHabiles.reduce((sum: number, dh: any) => sum + Number(dh.hs_reloj), 0);
  const totalBimestreHsCatedra = diasHabiles.reduce((sum: number, dh: any) => sum + Number(dh.hs_catedra), 0);
  const diasSalidaDidactica = eventoMap.size;

  const resultados = [];
  for (const a of alumnos) {
    const [registros]: any = await pool.execute(
      "SELECT fecha, estado, hora_ingreso, hora_egreso FROM asis_registros WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?",
      [a.alumno_curso_id, start_date, end_date]
    );
    const regMap = new Map<string, any>(registros.map((r: any) => [r.fecha.toISOString().split('T')[0], r]));

    const [faltaRows]: any = await pool.execute(
      'SELECT fecha, tipo_falta FROM asis_faltas WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?',
      [a.alumno_curso_id, start_date, end_date]
    );
    const faltaMap = new Map<string, number>(faltaRows.map((r: any) => [r.fecha.toISOString().split('T')[0], Number(r.tipo_falta)]));

    const calcFactor = (estado: string | undefined): number => {
      if (estado === 'presente') return 1;
      if (estado === 'tardia' || estado === 'retiro_anticipado') return 0.75;
      return 0;
    };

    let horasReloj = 0;
    let horasCatedra = 0;
    let diasPresentes = 0;
    let diasTardias = 0;
    let diasRetiro = 0;
    let diasAusente = 0;
    let faltaTotal = 0;

    for (const dh of diasHabiles) {
      const reg = regMap.get(dh.fecha);
      const estado = reg?.estado;
      const faltaVal = faltaMap.get(dh.fecha) || 0;
      faltaTotal += faltaVal;
      const factor = calcFactor(estado);
      horasReloj += Number(dh.hs_reloj) * factor;
      horasCatedra += Number(dh.hs_catedra) * factor;

      if (estado === 'presente') diasPresentes++;
      else if (estado === 'tardia') diasTardias++;
      else if (estado === 'retiro_anticipado') diasRetiro++;
      else if (estado === 'ausente' || !estado) diasAusente++;
    }

    resultados.push({
      user_id: a.user_id,
      first_name: a.first_name,
      last_name: a.last_name,
      dias_presentes: diasPresentes,
      dias_tardias: diasTardias,
      dias_retiro: diasRetiro,
      dias_ausente: diasAusente,
      horas_reloj: parseFloat(horasReloj.toFixed(2)),
      horas_catedra: parseFloat(horasCatedra.toFixed(2)),
      faltas_totales: parseFloat(faltaTotal.toFixed(2)),
      porcentaje: totalBimestreHsCatedra > 0 ? parseFloat(((horasCatedra / totalBimestreHsCatedra) * 100).toFixed(1)) : 0,
    });
  }

  return {
    bimestre, start_date, end_date,
    dias_habiles: diasHabiles.length,
    dias_sin_clase: diasSinClase,
    dias_salida_didactica: diasSalidaDidactica,
    total_hs_reloj_bimestre: totalBimestreHsReloj,
    total_hs_catedra_bimestre: totalBimestreHsCatedra,
    alumnos: resultados,
  };
}

export async function importarLegacy() {
  const poolLegacy = (await import('@/lib/db-encuentro')).default;
  const resultados: any[] = [];
  let usuariosImportados = 0;
  let cursosImportados = 0;
  let registrosImportados = 0;

  try {
    // 1. Importar usuarios legacy
    const [legacyUsers]: any = await poolLegacy.execute('SELECT * FROM usuarios');
    for (const lu of legacyUsers) {
      const [exist]: any = await pool.execute(
        'SELECT id FROM users WHERE legacy_id = ? OR email = ?',
        [lu.id, lu.email]
      );
      if (exist.length > 0) {
        await pool.execute('UPDATE users SET legacy_id = ?, dni = ?, telefono = ?, telefono_alternativo = ?, fecha_nacimiento = ?, direccion = ?, cuil = ?, nacionalidad = ? WHERE id = ?',
          [lu.id, lu.dni || null, lu.telefono || null, lu.telefono_alternativo || null, lu.nacimiento || null, lu.direccion || null, lu.cuil || null, lu.nacionalidad || null, exist[0].id]);
        continue;
      }
      let roleId = 2;
      if (lu.rol === 1) roleId = 3;
      else if (lu.rol === 2) roleId = 5;
      await pool.execute(
        `INSERT INTO users (username, email, password_md5, role_id, first_name, last_name, legacy_id, dni, telefono, telefono_alternativo, fecha_nacimiento, direccion, cuil, nacionalidad)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [lu.usuario, lu.email, lu.pwd, roleId, lu.nombre, lu.apellido, lu.id, lu.dni || null, lu.telefono || null, lu.telefono_alternativo || null, lu.nacimiento || null, lu.direccion || null, lu.cuil || null, lu.nacionalidad || null]
      );
      usuariosImportados++;
    }
    resultados.push(`Usuarios importados/actualizados: ${usuariosImportados}`);

    // 2. Importar cursos legacy -> especialidades + cursos
    const [legacyCursos]: any = await poolLegacy.execute('SELECT * FROM curso ORDER BY anio, nombre_curso');
    for (const lc of legacyCursos) {
      let espId: number;
      const [espExist]: any = await pool.execute(
        'SELECT id FROM asis_especialidades WHERE nombre = ? AND activo = 1',
        ['Prácticas Profesionalizantes']
      );
      if (espExist.length > 0) {
        espId = espExist[0].id;
      } else {
        const [r] = await pool.execute("INSERT INTO asis_especialidades (nombre, activo) VALUES ('Prácticas Profesionalizantes', 1)");
        espId = (r as any).insertId;
      }

      const [cursoExist]: any = await pool.execute(
        'SELECT id FROM asis_cursos WHERE legacy_id = ?',
        [lc.id]
      );
      if (cursoExist.length > 0) continue;

      const nombre = lc.nombre_curso?.replace(/^PP/i, '').trim() || `Curso ${lc.id}`;
      await pool.execute(
        'INSERT INTO asis_cursos (nombre, descripcion, anio, especialidad_id, turno, legacy_id, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [nombre, lc.descripcion_curso || '', lc.anio || 2020, espId, lc.turno || 'mañana', lc.id]
      );
      cursosImportados++;
    }
    resultados.push(`Cursos importados: ${cursosImportados}`);

    // 3. Mapear legacy curso -> nuevo curso
    const [cursoMapRows]: any = await pool.execute('SELECT id, legacy_id FROM asis_cursos WHERE legacy_id IS NOT NULL');
    const cursoMap = new Map(cursoMapRows.map((c: any) => [c.legacy_id, c.id]));

    // 4. Mapear legacy usuario -> nuevo user
    const [userMapRows]: any = await pool.execute('SELECT id, legacy_id FROM users WHERE legacy_id IS NOT NULL');
    const userMap = new Map(userMapRows.map((u: any) => [u.legacy_id, u.id]));

    // 5. Inscribir alumnos legacy en cursos
    for (const lu of legacyUsers) {
      const legacyCursoId = lu.curso;
      const nuevoCursoId = cursoMap.get(legacyCursoId);
      const nuevoUserId = userMap.get(lu.id);
      if (!nuevoCursoId || !nuevoUserId) continue;
      const [insExist]: any = await (pool.execute as any)(
        'SELECT id FROM asis_alumnos_curso WHERE user_id = ? AND curso_id = ?',
        [nuevoUserId, nuevoCursoId]
      );
      if (insExist.length > 0) continue;
      await (pool.execute as any)(
        "INSERT INTO asis_alumnos_curso (curso_id, user_id, fecha_inscripcion, activo) VALUES (?, ?, CURDATE(), 1)",
        [nuevoCursoId, nuevoUserId]
      );
    }

    // 6. Importar registros de asistencia legacy
    const [legacyAsist]: any = await poolLegacy.execute(
      'SELECT a.*, u.curso as curso_id_legacy FROM asistencia a JOIN usuarios u ON u.id = a.usuario'
    );
    for (const la of legacyAsist) {
      const nuevoUserId = userMap.get(parseInt(la.usuario));
      const legacyCursoId = la.curso_id_legacy;
      const nuevoCursoId = cursoMap.get(legacyCursoId);
      if (!nuevoUserId || !nuevoCursoId) continue;
      const [alumnoCurso]: any = await (pool.execute as any)(
        'SELECT id FROM asis_alumnos_curso WHERE user_id = ? AND curso_id = ?',
        [nuevoUserId, nuevoCursoId]
      );
      if (alumnoCurso.length === 0) continue;
      const alumnoCursoId = alumnoCurso[0].id;
      const d = la.fecha;
      let fecha;
      if (d instanceof Date && !isNaN(d.getTime())) {
        fecha = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      } else if (typeof d === 'string') {
        fecha = d.slice(0, 10);
      } else continue;
      const [regExist]: any = await pool.execute(
        "SELECT id FROM asis_registros WHERE alumno_curso_id = ? AND fecha = ?",
        [alumnoCursoId, fecha]
      );
      if (regExist.length > 0) continue;
      await pool.execute(
        "INSERT INTO asis_registros (alumno_curso_id, fecha, estado, created_by) VALUES (?, ?, 'presente', ?)",
        [alumnoCursoId, fecha, nuevoUserId]
      );
      registrosImportados++;
    }
    resultados.push(`Registros de asistencia importados: ${registrosImportados}`);
    resultados.push('Importación completada exitosamente');
  } catch (error: any) {
    resultados.push(`Error: ${error.message}`);
  }
  return { resultados };
}

export async function getDetalleAlumnoBimestre(cursoId: number, userId: number, bimestre: number) {
  const [bim]: any = await pool.execute('SELECT * FROM scrum_bimestres_config WHERE bimestre = ?', [bimestre]);
  if (bim.length === 0) return { error: 'Bimestre no encontrado' };
  const { start_date, end_date } = bim[0];

  const [alumnoCurso]: any = await pool.execute(
    'SELECT id FROM asis_alumnos_curso WHERE curso_id = ? AND user_id = ? AND activo = 1',
    [cursoId, userId]
  );
  if (alumnoCurso.length === 0) return { error: 'Alumno no encontrado en este curso' };
  const alumnoCursoId = alumnoCurso[0].id;

  const [horarios]: any = await pool.execute('SELECT * FROM asis_horarios WHERE curso_id = ?', [cursoId]);
  const [noLaborables]: any = await pool.execute(
    'SELECT fecha FROM asis_dias_no_laborables WHERE (curso_id = ? OR aplica_todos = 1) AND fecha BETWEEN ? AND ?',
    [cursoId, start_date, end_date]
  );
  const noLabSet = new Set(noLaborables.map((d: any) => d.fecha.toISOString().split('T')[0]));

  const [registros]: any = await pool.execute(
    "SELECT fecha, estado, hora_ingreso, hora_egreso, justificacion FROM asis_registros WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ? ORDER BY fecha",
    [alumnoCursoId, start_date, end_date]
  );
  const regMap = new Map<string, any>(registros.map((r: any) => [r.fecha.toISOString().split('T')[0], r]));

  const [faltas]: any = await pool.execute(
    'SELECT fecha, tipo_falta FROM asis_faltas WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?',
    [alumnoCursoId, start_date, end_date]
  );
  const faltaMap = new Map<string, number>(faltas.map((r: any) => [r.fecha.toISOString().split('T')[0], Number(r.tipo_falta)]));

  const fechaInicio = new Date(start_date);
  const fechaFin = new Date(end_date);
  const dias: any[] = [];

  for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
    const fechaStr = d.toISOString().split('T')[0];
    const diaSem = d.getDay() === 0 ? 7 : d.getDay();
    const esDiaClase = horarios.some((h: any) => h.dia_semana === diaSem);
    if (!esDiaClase) continue;
    if (noLabSet.has(fechaStr)) {
      dias.push({ fecha: fechaStr, dia: diaSem, estado: 'no_laborable', hs_reloj: 0, hs_catedra: 0, justificacion: '', falta: 0 });
      continue;
    }
    const hsTotal = horarios.filter((h: any) => h.dia_semana === diaSem).reduce((s: number, h: any) => s + Number(h.hs_catedra), 0);
    const reg: any = regMap.get(fechaStr);
    const faltaVal = faltaMap.get(fechaStr) || 0;
    dias.push({
      fecha: fechaStr,
      dia: diaSem,
      estado: reg?.estado || 'ausente',
      hora_ingreso: reg?.hora_ingreso?.substring(0, 5) || '',
      hora_egreso: reg?.hora_egreso?.substring(0, 5) || '',
      justificacion: reg?.justificacion || '',
      falta: Number(faltaVal),
      hs_reloj: hsTotal,
    });
  }

  const totales = {
    presentes: dias.filter(d => d.estado === 'presente').length,
    tardias: dias.filter(d => d.estado === 'tardia').length,
    retiro: dias.filter(d => d.estado === 'retiro_anticipado').length,
    ausentes: dias.filter(d => d.estado === 'ausente').length,
    noLaborables: dias.filter(d => d.estado === 'no_laborable').length,
    faltas: dias.reduce((s, d) => s + d.falta, 0),
  };

  return { start_date, end_date, dias, totales };
}
