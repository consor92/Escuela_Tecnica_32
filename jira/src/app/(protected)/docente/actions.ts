'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMisCursos(userId: number) {
  const [rows]: any = await pool.execute(
    `SELECT c.*, e.nombre as especialidad_nombre
     FROM asis_docentes_curso dc
     JOIN asis_cursos c ON c.id = dc.curso_id
     JOIN asis_especialidades e ON e.id = c.especialidad_id
     WHERE dc.user_id = ? AND dc.rol = 'docente' AND c.activo = 1
      ORDER BY c.ciclo_lectivo DESC, c.anio DESC, c.nombre`,
    [userId]
  );
  return rows;
}

export async function getAlumnosCurso(cursoId: number) {
  const [rows]: any = await pool.execute(
    `SELECT ac.*, u.first_name, u.last_name, u.email
     FROM asis_alumnos_curso ac
     JOIN users u ON u.id = ac.user_id
     WHERE ac.curso_id = ? AND ac.activo = 1
     ORDER BY u.last_name, u.first_name`,
    [cursoId]
  );
  return rows;
}

export async function getRegistrosDia(cursoId: number, fecha: string) {
  const [rows]: any = await pool.execute(
    `SELECT r.*, ac.user_id
     FROM asis_registros r
     JOIN asis_alumnos_curso ac ON ac.id = r.alumno_curso_id
     WHERE ac.curso_id = ? AND r.fecha = ?`,
    [cursoId, fecha]
  );
  return rows;
}

export async function getHorariosDia(cursoId: number, diaSemana: number) {
  const [rows]: any = await pool.execute(
    'SELECT * FROM asis_horarios WHERE curso_id = ? AND dia_semana = ?',
    [cursoId, diaSemana]
  );
  return rows;
}

export async function getParametro(clave: string) {
  const [rows]: any = await pool.execute('SELECT valor FROM asis_parametros WHERE clave = ?', [clave]);
  return rows[0]?.valor || '1.00';
}

export async function guardarAsistencia(data: {
  cursoId: number;
  fecha: string;
  registros: { alumno_curso_id: number; estado: string; hora_ingreso?: string; hora_egreso?: string; justificacion?: string }[];
}) {
  const { fecha, registros } = data;

  const [paramFalta] = await Promise.all([
    getParametro('falta_completa'),
  ]);
  const faltaCompleta = parseFloat(paramFalta);

  for (const r of registros) {
    const estado = r.estado;
    let tipoFalta = 0;
    if (estado === 'ausente') {
      if (!r.justificacion) tipoFalta = faltaCompleta;
    } else if (estado === 'tardia') tipoFalta = parseFloat(await getParametro('falta_tardia')) || 0.5;
    else if (estado === 'retiro_anticipado') tipoFalta = parseFloat(await getParametro('falta_retiro')) || 0.25;

    const [exist]: any = await pool.execute(
      'SELECT id FROM asis_registros WHERE alumno_curso_id = ? AND fecha = ?',
      [r.alumno_curso_id, fecha]
    );

    if (exist.length > 0) {
      await pool.execute(
        'UPDATE asis_registros SET estado = ?, hora_ingreso = ?, hora_egreso = ?, justificacion = ?, correccion_manual = 1 WHERE id = ?',
        [estado, r.hora_ingreso || null, r.hora_egreso || null, r.justificacion || null, exist[0].id]
      );
    } else {
      await pool.execute(
        'INSERT INTO asis_registros (alumno_curso_id, fecha, estado, hora_ingreso, hora_egreso, justificacion, correccion_manual, created_by) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
        [r.alumno_curso_id, fecha, estado, r.hora_ingreso || null, r.hora_egreso || null, r.justificacion || null, r.alumno_curso_id]
      );
    }

    if (tipoFalta > 0) {
      const [faltaExist]: any = await pool.execute(
        'SELECT id FROM asis_faltas WHERE alumno_curso_id = ? AND fecha = ?',
        [r.alumno_curso_id, fecha]
      );
      if (faltaExist.length > 0) {
        await pool.execute('UPDATE asis_faltas SET tipo_falta = ? WHERE id = ?', [tipoFalta, faltaExist[0].id]);
      } else {
        await pool.execute(
          'INSERT INTO asis_faltas (alumno_curso_id, fecha, tipo_falta) VALUES (?, ?, ?)',
          [r.alumno_curso_id, fecha, tipoFalta]
        );
      }
    } else {
      await pool.execute('DELETE FROM asis_faltas WHERE alumno_curso_id = ? AND fecha = ?', [r.alumno_curso_id, fecha]);
    }

    // Notify student
    const [alumnoData]: any = await pool.execute(
      'SELECT user_id FROM asis_alumnos_curso WHERE id = ?',
      [r.alumno_curso_id]
    );
    if (alumnoData[0]) {
      const estadoLabels: Record<string, string> = { presente: 'Presente', ausente: 'Ausente', tardia: 'Tardía', retiro_anticipado: 'Retiro anticipado' };
      await pool.execute(
        'INSERT INTO asis_notificaciones (user_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)',
        [alumnoData[0].user_id, 'Asistencia registrada', `Tu asistencia del ${fecha} fue registrada como ${estadoLabels[estado] || estado}`, 'info']
      );
    }
  }

  // Check faltas limits for each student
  const uniqueIds = Array.from(new Set(registros.map(r => r.alumno_curso_id)));
  for (const acId of uniqueIds) {
    const [bimestreRow]: any = await pool.execute(
      'SELECT bimestre, start_date, end_date FROM scrum_bimestres_config WHERE ? BETWEEN start_date AND end_date',
      [fecha]
    );
    if (!bimestreRow[0]) continue;
    const { bimestre, start_date, end_date } = bimestreRow[0];
    const [faltasBim]: any = await pool.execute(
      'SELECT COALESCE(SUM(tipo_falta), 0) as total FROM asis_faltas WHERE alumno_curso_id = ? AND fecha BETWEEN ? AND ?',
      [acId, start_date, end_date]
    );
    const [faltasAnual]: any = await pool.execute(
      'SELECT COALESCE(SUM(tipo_falta), 0) as total FROM asis_faltas f JOIN scrum_bimestres_config sc ON f.fecha BETWEEN sc.start_date AND sc.end_date WHERE f.alumno_curso_id = ? AND sc.start_date >= ?',
      [acId, `${new Date(fecha).getFullYear()}-01-01`]
    );
    const bimTotal = Number(faltasBim[0]?.total || 0);
    const anualTotal = Number(faltasAnual[0]?.total || 0);
    if (bimTotal >= 4) {
      const [ud]: any = await pool.execute('SELECT user_id FROM asis_alumnos_curso WHERE id = ?', [acId]);
      if (ud[0]) await pool.execute(
        'INSERT INTO asis_notificaciones (user_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)',
        [ud[0].user_id, '⚠️ Límite de faltas cercano', `Llevás ${bimTotal.toFixed(2)} faltas en el bimestre ${bimestre}. El límite es 5.`, 'advertencia']
      );
    }
    if (anualTotal >= 16) {
      const [ud]: any = await pool.execute('SELECT user_id FROM asis_alumnos_curso WHERE id = ?', [acId]);
      if (ud[0]) await pool.execute(
        'INSERT INTO asis_notificaciones (user_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)',
        [ud[0].user_id, '⚠️ Límite anual de faltas cercano', `Llevás ${anualTotal.toFixed(2)} faltas en el año. El límite es 20.`, 'alerta']
      );
    }
  }

  revalidatePath('/docente');
  return { success: true, count: registros.length };
}

export async function enviarNotificacion(cursoId: number, mensaje: string) {
  const [alumnos]: any = await pool.execute(
    `SELECT ac.user_id FROM asis_alumnos_curso ac WHERE ac.curso_id = ? AND ac.activo = 1`,
    [cursoId]
  );
  for (const a of alumnos) {
    await pool.execute(
      'INSERT INTO asis_notificaciones (user_id, titulo, mensaje, tipo) VALUES (?, ?, ?, ?)',
      [a.user_id, 'Novedad del curso', mensaje, 'info']
    );
  }
  return { success: true, count: alumnos.length };
}

export async function getNotificacionesEnviadas(cursoId: number) {
  const [rows]: any = await pool.execute(
    `SELECT DISTINCT n.titulo, n.mensaje, n.tipo, n.fecha
     FROM asis_notificaciones n
     JOIN asis_alumnos_curso ac ON ac.user_id = n.user_id
     WHERE ac.curso_id = ? AND n.titulo = 'Novedad del curso'
     ORDER BY n.fecha DESC LIMIT 20`,
    [cursoId]
  );
  return rows;
}
