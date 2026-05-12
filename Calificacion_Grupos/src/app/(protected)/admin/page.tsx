import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await getSession();
  if (session?.user.role_id !== 1) {
    redirect('/dashboard');
  }

  // 1. Configuración General
  const [settings]: any = await pool.execute("SELECT val FROM settings WHERE key_name = 'evaluations_enabled'");
  const evalEnabled = settings[0]?.val === 1;

  const [periods]: any = await pool.execute("SELECT * FROM evaluation_periods ORDER BY start_date ASC");
  const [currentPeriods]: any = await pool.execute("SELECT * FROM evaluation_periods WHERE is_active = 1 LIMIT 1");
  const currentPeriod = currentPeriods[0] || periods.find((p: any) => {
    const now = new Date();
    return now >= new Date(p.start_date) && now <= new Date(p.end_date);
  }) || periods[0];

  const [academicOptions]: any = await pool.execute("SELECT * FROM academic_options");

  // 2. Equipos y sus miembros (FILTRAR USUARIOS SIN NOMBRE)
  const [allTeams]: any = await pool.execute("SELECT * FROM teams ORDER BY name ASC");
  const teamsData = [];

  for (const team of allTeams) {
    const [members]: any = await pool.execute(
      "SELECT id, first_name, last_name, year_div, school_year FROM users WHERE team_id = ? AND first_name IS NOT NULL AND first_name != ''",
      [team.id]
    );
    
    // Scrum Masters por bimestre
    const [sms]: any = await pool.execute(
      "SELECT bimestre, user_id FROM scrum_masters WHERE team_id = ?",
      [team.id]
    );
    const smsMap: any = {};
    sms.forEach((s: any) => smsMap[s.bimestre] = s.user_id);

    teamsData.push({
      ...team,
      members,
      sms: smsMap
    });
  }

  // 3. Alumnos sin asignar (FILTRAR USUARIOS SIN NOMBRE)
  const [unassignedUsers]: any = await pool.execute(
    "SELECT id, first_name, last_name FROM users WHERE role_id = 2 AND team_id IS NULL AND first_name IS NOT NULL AND first_name != '' ORDER BY last_name ASC"
  );

  // 4. Reporte General (FILTRAR USUARIOS SIN NOMBRE)
  const [reports]: any = await pool.execute(`
    SELECT 
        u.id, u.first_name, u.last_name, u.year_div, u.school_year, t.name as team_name,
        AVG(e.score_teamwork) as avg_tw, AVG(e.score_development) as avg_dv, AVG(e.score_class_work) as avg_cw,
        (SELECT AVG((score_sm_leadership + score_sm_facilitation + score_sm_support) / 3) FROM evaluations WHERE evaluatee_id = u.id AND is_sm_eval = 1) as avg_sm,
        (SELECT score FROM teacher_evaluations WHERE user_id = u.id AND period_id = ? LIMIT 1) as avg_teacher
    FROM users u
    LEFT JOIN teams t ON u.team_id = t.id
    LEFT JOIN evaluations e ON u.id = e.evaluatee_id
    WHERE u.role_id = 2 AND u.first_name IS NOT NULL AND u.first_name != ''
    GROUP BY u.id
    ORDER BY t.name, u.last_name
  `, [currentPeriod?.id || 0]);

  const initialData = {
    evalEnabled,
    currentPeriod,
    periods,
    academicOptions,
    unassignedUsers,
    teamsData,
    reports
  };

  return <AdminClient initialData={initialData} />;
}
