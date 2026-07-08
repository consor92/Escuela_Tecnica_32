import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import dynamic from 'next/dynamic';

const ReferenteClient = dynamic(() => import('./ReferenteClient'), { ssr: false });

export default async function ReferentePage() {
  const session = await getSession();
  if (!session || session.user.role_id !== 5) redirect('/login');

  const [cursos]: any = await pool.execute(
    `SELECT c.*, e.nombre as especialidad_nombre
     FROM asis_cursos c
     JOIN asis_especialidades e ON e.id = c.especialidad_id
     WHERE c.activo = 1
     ORDER BY c.ciclo_lectivo DESC, c.anio DESC, c.nombre`
  );
  const [bimestres]: any = await pool.execute('SELECT * FROM scrum_bimestres_config ORDER BY bimestre');

  return <ReferenteClient cursos={cursos} bimestres={bimestres} />;
}
