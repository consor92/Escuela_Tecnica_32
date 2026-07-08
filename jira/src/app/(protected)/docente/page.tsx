import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const DocenteClient = dynamic(() => import('./DocenteClient'), { ssr: false });

export default async function DocentePage() {
  const session = await getSession();
  if (!session || (session.user.role_id !== 3 && session.user.role_id !== 1)) redirect('/login');

  const today = ((new Date().getDay() + 6) % 7) + 1;

  let rows: any;
  if (session.user.role_id === 1) {
    [rows] = await (pool.execute as any)(
      `SELECT c.*, e.nombre as especialidad_nombre
       FROM asis_cursos c
       JOIN asis_especialidades e ON e.id = c.especialidad_id
       WHERE c.activo = 1
       ORDER BY c.ciclo_lectivo DESC, c.anio DESC, c.nombre`
    );
  } else {
    [rows] = await (pool.execute as any)(
      `SELECT c.*, e.nombre as especialidad_nombre
       FROM asis_docentes_curso dc
       JOIN asis_cursos c ON c.id = dc.curso_id
       JOIN asis_especialidades e ON e.id = c.especialidad_id
       WHERE dc.user_id = ? AND dc.rol = 'docente' AND c.activo = 1
         AND (dc.dias_semana IS NULL OR FIND_IN_SET(?, dc.dias_semana) > 0)
       ORDER BY c.ciclo_lectivo DESC, c.anio DESC, c.nombre`,
      [session.user.id, String(today)]
    );
  }

  return <DocenteClient cursos={rows} />;
}
