import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';

const PreceptorClient = dynamic(() => import('./PreceptorClient'), { ssr: false });

export default async function PreceptorPage() {
  const session = await getSession();
  if (!session || (session.user.role_id !== 4 && session.user.role_id !== 1)) redirect('/login');

  const [rows]: any = await (pool.execute as any)(
    `SELECT c.*, e.nombre as especialidad_nombre
     FROM asis_docentes_curso dc
     JOIN asis_cursos c ON c.id = dc.curso_id
     JOIN asis_especialidades e ON e.id = c.especialidad_id
     WHERE dc.user_id = ? AND dc.rol = 'preceptor' AND c.activo = 1
     ORDER BY c.ciclo_lectivo DESC, c.anio DESC, c.nombre`,
    [session.user.id]
  );

  return <PreceptorClient cursos={rows} />;
}
