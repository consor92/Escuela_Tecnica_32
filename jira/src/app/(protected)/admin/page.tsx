import { Box } from '@mantine/core';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

export default async function AdminPage({ searchParams }: any) {
  const session = await getSession();
  if (session?.user.role_id !== 1) {
    redirect('/dashboard');
  }

  // 1. Configuración General de Periodos
  const [periods]: any = await pool.execute("SELECT * FROM evaluation_periods ORDER BY start_date ASC");
  const [activePeriods]: any = await pool.execute("SELECT * FROM evaluation_periods WHERE is_active = 1 LIMIT 1");
  
  // El periodo seleccionado viene de la URL (searchParams) o es el activo por defecto
  const selectedPeriodId = searchParams.period ? parseInt(searchParams.period) : (activePeriods[0]?.id || periods[0]?.id);
  const currentPeriod = periods.find((p: any) => p.id === selectedPeriodId) || periods[0];

  // Determinar los 4 periodos del bimestre FIJO basado en el seleccionado
  // Bloques: 1-4 (B1), 5-8 (B2), 9-12 (B3), 13-16 (B4), 17-18...
  const bimesterNumber = Math.ceil(currentPeriod.id / 4);
  const startId = (bimesterNumber - 1) * 4 + 1;
  const endId = bimesterNumber * 4;
  const bimestralPeriodIds = periods
    .filter((p: any) => p.id >= startId && p.id <= endId)
    .map((p: any) => p.id);

  const [settings]: any = await pool.execute("SELECT val FROM settings WHERE key_name = 'evaluations_enabled'");
  const evalEnabled = settings[0]?.val === 1;

  const [academicOptions]: any = await pool.execute("SELECT * FROM academic_options");

  // 2. Equipos y sus miembros
  const [allTeams]: any = await pool.execute("SELECT * FROM teams ORDER BY name ASC");
  const teamsData = [];

  for (const team of allTeams) {
    const [members]: any = await pool.execute(
      "SELECT id, first_name, last_name, year_div, school_year, external_id FROM users WHERE team_id = ? AND first_name IS NOT NULL AND first_name != ''",
      [team.id]
    );
    
    // Scrum Masters por bimestre
    const [sms]: any = await pool.execute(
      "SELECT bimestre, user_id FROM scrum_masters WHERE team_id = ?",
      [team.id]
    );
    const smsMap: any = {};
    sms.forEach((s: any) => smsMap[s.bimestre] = s.user_id);

    // Notas actuales de los miembros (Promedio Bimestral basado en el periodo seleccionado)
    const membersWithScores = await Promise.all(members.map(async (m: any) => {
      const [scores]: any = await pool.execute(`
        SELECT 
          AVG((e.score_teamwork + e.score_development + e.score_class_work) / 3 / 4 * 10) as co_avg,
          (SELECT AVG(score) FROM teacher_evaluations te 
           WHERE te.user_id = ? AND te.period_id IN (${bimestralPeriodIds.join(',') || '0'})
          ) as prof_avg,
          (
            SELECT COUNT(*) FROM (
              SELECT ep.id as p_id, u2.id as target_id
              FROM evaluation_periods ep
              JOIN users u2 ON u2.team_id = ? AND u2.id != ?
              WHERE ep.start_date <= CURDATE()
            ) as expected
            LEFT JOIN evaluations e2 ON e2.evaluator_id = ? AND e2.evaluatee_id = expected.target_id AND e2.period_id = expected.p_id
            WHERE e2.id IS NULL
          ) as pending_count
        FROM evaluations e
        WHERE e.evaluatee_id = ? AND e.period_id IN (${bimestralPeriodIds.join(',') || '0'})
      `, [m.id, team.id, m.id, m.id, m.id]);
      
      const coVal = parseFloat(scores[0]?.co_avg || 0);
      const profVal = parseFloat(scores[0]?.prof_avg || 0);
      const pendingCount = parseInt(scores[0]?.pending_count || 0);
      
      let finalScore = 0;
      if (coVal > 0 && profVal > 0) finalScore = (coVal + profVal) / 2;
      else if (coVal > 0) finalScore = coVal;
      else if (profVal > 0) finalScore = profVal;

      return { ...m, finalScore, bimestralCo: coVal, bimestralProf: profVal, pendingCount };
    }));

    teamsData.push({
      ...team,
      members: membersWithScores,
      sms: smsMap
    });
  }

  // 3. Alumnos sin asignar
  const [unassignedUsers]: any = await pool.execute(
    "SELECT id, first_name, last_name FROM users WHERE role_id = 2 AND team_id IS NULL AND first_name IS NOT NULL AND first_name != '' ORDER BY last_name ASC"
  );

  // 4. Reporte General (Sincronizado con el periodo seleccionado para notas individuales)
  const [reports]: any = await pool.execute(`
    SELECT 
        u.id, u.first_name, u.last_name, u.year_div, u.school_year, t.name as team_name,
        AVG(CASE WHEN e.period_id = ? THEN e.score_teamwork ELSE NULL END) as avg_tw,
        AVG(CASE WHEN e.period_id = ? THEN e.score_development ELSE NULL END) as avg_dv,
        AVG(CASE WHEN e.period_id = ? THEN e.score_class_work ELSE NULL END) as avg_cw,
        (SELECT AVG((score_sm_leadership + score_sm_facilitation + score_sm_support) / 3) FROM evaluations WHERE evaluatee_id = u.id AND is_sm_eval = 1 AND period_id = ?) as avg_sm,
        (SELECT score FROM teacher_evaluations WHERE user_id = u.id AND period_id = ? LIMIT 1) as avg_teacher,
        -- Nota Final (Bimestral basada en la selección)
        (
          SELECT (COALESCE(AVG((e3.score_teamwork + e3.score_development + e3.score_class_work) / 3 / 4 * 10), 0) + 
                  COALESCE((SELECT AVG(score) FROM teacher_evaluations te2 WHERE te2.user_id = u.id AND te2.period_id IN (${bimestralPeriodIds.join(',') || '0'})), 0)) / 
                  (CASE WHEN EXISTS(SELECT 1 FROM evaluations e4 WHERE e4.evaluatee_id = u.id AND e4.period_id IN (${bimestralPeriodIds.join(',') || '0'})) 
                        AND EXISTS(SELECT 1 FROM teacher_evaluations te3 WHERE te3.user_id = u.id AND te3.period_id IN (${bimestralPeriodIds.join(',') || '0'})) 
                   THEN 2 ELSE 1 END)
          FROM evaluations e3 WHERE e3.evaluatee_id = u.id AND e3.period_id IN (${bimestralPeriodIds.join(',') || '0'})
        ) as bimestral_final,
        -- Conteo de pendientes (Total acumulado hasta hoy)
        (
          SELECT COUNT(*)
          FROM evaluation_periods ep
          JOIN users u2 ON u2.id != u.id
          WHERE ep.start_date <= CURDATE()
            AND u2.team_id = u.team_id
            AND u.team_id IS NOT NULL
            AND NOT EXISTS (
              SELECT 1 FROM evaluations e2
              WHERE e2.evaluator_id = u.id
                AND e2.evaluatee_id = u2.id
                AND e2.period_id = ep.id
            )
        ) as pending_count
    FROM users u
    LEFT JOIN teams t ON u.team_id = t.id
    LEFT JOIN evaluations e ON u.id = e.evaluatee_id
    WHERE u.role_id = 2 AND u.first_name IS NOT NULL AND u.first_name != ''
    GROUP BY u.id
    ORDER BY t.name, u.last_name
  `, [currentPeriod.id, currentPeriod.id, currentPeriod.id, currentPeriod.id, currentPeriod.id]);

  // Adaptar el reporte para que la columna "Gral" use bimestral_final
  const finalReports = reports.map((r: any) => ({
    ...r,
    avg_general_bimestral: r.bimestral_final
  }));

  const initialData = {
    evalEnabled,
    currentPeriod,
    periods,
    academicOptions,
    unassignedUsers,
    teamsData,
    finalReports
  };

  return (
    <Box py="md" px="md" maw={1440} mx="auto">
      <AdminClient initialData={initialData} />
    </Box>
  );
}
