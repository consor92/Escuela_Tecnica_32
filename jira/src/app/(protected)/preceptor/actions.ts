'use server';
import pool from '@/lib/db';

export async function getMisCursos(userId: number) {
  const [rows]: any = await pool.execute(
    `SELECT c.*, e.nombre as especialidad_nombre
     FROM asis_docentes_curso dc
     JOIN asis_cursos c ON c.id = dc.curso_id
     JOIN asis_especialidades e ON e.id = c.especialidad_id
     WHERE dc.user_id = ? AND dc.rol = 'preceptor' AND c.activo = 1
      ORDER BY c.ciclo_lectivo DESC, c.anio DESC, c.nombre`,
    [userId]
  );
  return rows;
}

export async function getAlumnosCurso(cursoId: number) {
  const [rows]: any = await pool.execute(
    `SELECT ac.id as alumno_curso_id, u.id as user_id, u.first_name, u.last_name
     FROM asis_alumnos_curso ac
     JOIN users u ON u.id = ac.user_id
     WHERE ac.curso_id = ? AND ac.activo = 1
     ORDER BY u.last_name, u.first_name`,
    [cursoId]
  );
  return rows;
}

export async function getBimestres() {
  const [rows]: any = await pool.execute('SELECT * FROM scrum_bimestres_config ORDER BY bimestre');
  return rows;
}

export async function getResumenBimestre(cursoId: number, bimestre: number) {
  const [bim]: any = await pool.execute(
    'SELECT * FROM scrum_bimestres_config WHERE bimestre = ?', [bimestre]
  );
  if (bim.length === 0) return { error: 'Bimestre no encontrado' };
  const { start_date, end_date } = bim[0];

  const [alumnos]: any = await pool.execute(
    `SELECT ac.id as alumno_curso_id, u.id as user_id, u.first_name, u.last_name
     FROM asis_alumnos_curso ac
     JOIN users u ON u.id = ac.user_id
     WHERE ac.curso_id = ? AND ac.activo = 1
     ORDER BY u.last_name, u.first_name`,
    [cursoId]
  );

  const [horarios]: any = await pool.execute(
    'SELECT * FROM asis_horarios WHERE curso_id = ?', [cursoId]
  );
  if (horarios.length === 0) return { error: 'El curso no tiene horarios cargados' };

  const [noLaborables]: any = await pool.execute(
    'SELECT fecha FROM asis_dias_no_laborables WHERE (curso_id = ? OR aplica_todos = 1) AND fecha BETWEEN ? AND ?',
    [cursoId, start_date, end_date]
  );
  const noLabSet = new Set(noLaborables.map((d: any) => d.fecha.toISOString().split('T')[0]));

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

  const fechaInicio = new Date(start_date);
  const fechaFin = new Date(end_date);
  const diasHabiles: { fecha: string; dia_semana: number }[] = [];

  for (let d = new Date(fechaInicio); d <= fechaFin; d.setDate(d.getDate() + 1)) {
    const fechaStr = d.toISOString().split('T')[0];
    if (noLabSet.has(fechaStr) || ausenciaSet.has(fechaStr)) continue;
    const diaSem = d.getDay() === 0 ? 7 : d.getDay();
    for (const h of horarios) {
      if (h.dia_semana === diaSem) {
        diasHabiles.push({ fecha: fechaStr, dia_semana: diaSem });
        break;
      }
    }
  }

  const filas: any[] = [];
  for (const a of alumnos) {
    const [registros]: any = await pool.execute(
      "SELECT fecha, estado FROM asis_registros WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?",
      [a.alumno_curso_id, start_date, end_date]
    );
    const regMap = new Map(registros.map((r: any) => [r.fecha.toISOString().split('T')[0], r.estado]));

    const [faltas]: any = await pool.execute(
      'SELECT SUM(tipo_falta) as total FROM asis_faltas WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?',
      [a.alumno_curso_id, start_date, end_date]
    );

    let presentes = 0;
    let ausentes = 0;
    let tardias = 0;
    for (const dh of diasHabiles) {
      const estado = regMap.get(dh.fecha) || 'ausente';
      if (estado === 'presente') presentes++;
      else if (estado === 'ausente') ausentes++;
      else tardias++;
    }

    const total = diasHabiles.length;
    filas.push({
      user_id: a.user_id,
      first_name: a.first_name,
      last_name: a.last_name,
      presentes,
      ausentes,
      tardias,
      porcentaje: total > 0 ? parseFloat(((presentes / total) * 100).toFixed(1)) : 0,
      faltas_totales: parseFloat((faltas[0]?.total || 0).toFixed(2)),
    });
  }

  return { bimestre, start_date, end_date, dias_habiles: diasHabiles.length, alumnos: filas };
}

export async function getRegistrosDia(cursoId: number, fecha: string) {
  const [alumnos]: any = await pool.execute(
    `SELECT ac.id as alumno_curso_id, u.id as user_id, u.first_name, u.last_name
     FROM asis_alumnos_curso ac
     JOIN users u ON u.id = ac.user_id
     WHERE ac.curso_id = ? AND ac.activo = 1
     ORDER BY u.last_name, u.first_name`,
    [cursoId]
  );
  const [registros]: any = await pool.execute(
    `SELECT r.*, ac.user_id
     FROM asis_registros r
     JOIN asis_alumnos_curso ac ON ac.id = r.alumno_curso_id
     WHERE ac.curso_id = ? AND r.fecha = ?`,
    [cursoId, fecha]
  );
  const regDict: Record<number, any> = {};
  for (const r of registros) regDict[r.alumno_curso_id] = r;
  return alumnos.map((a: any) => ({
    ...a, estado: regDict[a.alumno_curso_id]?.estado || null,
    hora_ingreso: regDict[a.alumno_curso_id]?.hora_ingreso || null,
    hora_egreso: regDict[a.alumno_curso_id]?.hora_egreso || null,
    justificacion: regDict[a.alumno_curso_id]?.justificacion || null,
  }));
}
