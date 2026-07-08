import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardViews from '@/components/DashboardViews';
import {
  getBimestreBurndown,
  getTeamTaskDistribution,
  getTeamTaskDistributionByPriority,
  getTeamTaskDistributionByStatus,
  getTeamMilestones,
  getAnnualTeamBurndown,
  getBimestres,
} from './actions-charts';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role_id === 1) redirect('/admin');

  const userId = session.user.id;

  // Fetch user info and team
  const [users]: any = await pool.execute(`
    SELECT u.*, t.name as team_name 
    FROM users u 
    LEFT JOIN teams t ON u.team_id = t.id 
    WHERE u.id = ?
  `, [userId]);
  const user = users[0];

  if (!user.school_year || !user.year_div) redirect('/profile');

  // Fetch current evaluation period
  const [periods]: any = await pool.execute(`
    SELECT * FROM evaluation_periods 
    WHERE is_active = 1 
    OR (CURDATE() BETWEEN start_date AND end_date)
    ORDER BY is_active DESC, ABS(DATEDIFF(CURDATE(), start_date)) ASC
    LIMIT 1
  `);
  const currentPeriod = periods[0];

  // Fetch settings
  const [settings]: any = await pool.execute("SELECT val FROM settings WHERE key_name = 'evaluations_enabled'");
  const evalEnabled = settings[0]?.val === 1;

  // Fetch team members
  let teamMembers: any[] = [];
  if (user.team_id) {
    const [members]: any = await pool.execute(
      'SELECT id, first_name, last_name, username FROM users WHERE team_id = ? AND id != ? AND first_name IS NOT NULL AND first_name != ""',
      [user.team_id, userId]
    );
    teamMembers = members;
  }

  // Check evaluations already done in this period
  const [doneEvals]: any = await pool.execute(
    'SELECT evaluatee_id FROM evaluations WHERE evaluator_id = ? AND period_id = ?',
    [userId, currentPeriod?.id]
  );
  const doneIds = doneEvals.map((e: any) => e.evaluatee_id);

  // Fetch detailed pending evaluations
  const [pendingDetailed]: any = await pool.execute(`
    SELECT ep.label as p_label, u2.first_name, u2.last_name
    FROM evaluation_periods ep
    JOIN users u2 ON u2.team_id = ? AND u2.id != ?
    LEFT JOIN evaluations e2 ON e2.evaluator_id = ? AND e2.evaluatee_id = u2.id AND e2.period_id = ep.id
    WHERE ep.start_date <= CURDATE() AND e2.id IS NULL
    ORDER BY ep.start_date ASC
  `, [user.team_id, userId, userId]);

  // Fetch my evolution stats (anonymous)
  const [myStats]: any = await pool.execute(`
    SELECT 
        p.label as p_label, 
        AVG((e.score_teamwork + e.score_development + e.score_class_work) / 3) as score_gen
    FROM evaluation_periods p
    LEFT JOIN evaluations e ON e.period_id = p.id AND e.evaluatee_id = ?
    GROUP BY p.id
    ORDER BY p.start_date ASC
  `, [userId]);

  // Fetch attendance data for the student
  let attendanceData: any[] = [];
  let horarios: any[] = [];
  let allDatesExtra: Record<string, any> = {};
  if (user.team_id) {
    const [alumnoCurso]: any = await pool.execute(
      `SELECT ac.id, ac.curso_id, c.nombre as curso_nombre, c.division 
       FROM asis_alumnos_curso ac 
       JOIN asis_cursos c ON ac.curso_id = c.id 
       WHERE ac.user_id = ? AND ac.activo = 1`,
      [userId]
    );
    if (alumnoCurso[0]) {
      const [registros]: any = await pool.execute(
          `SELECT r.fecha, r.estado, r.justificacion, r.hora_ingreso, r.hora_egreso, sc.bimestre
          FROM asis_registros r
         LEFT JOIN scrum_bimestres_config sc ON r.fecha BETWEEN sc.start_date AND sc.end_date
         WHERE r.alumno_curso_id = ?
         ORDER BY r.fecha DESC`,
        [alumnoCurso[0].id]
      );
      attendanceData = registros;

      // Fetch non-working days and special events for the course
      const [diasNoLab]: any = await pool.execute(
        `SELECT fecha, motivo, tipo FROM asis_dias_no_laborables WHERE aplica_todos = 1 OR curso_id = ?`,
        [alumnoCurso[0].curso_id]
      );
      const [eventos]: any = await pool.execute(
        `SELECT fecha, descripcion, horas_reloj, horas_catedra FROM asis_eventos_especiales WHERE curso_id = ?`,
        [alumnoCurso[0].curso_id]
      );
      const [horariosRows]: any = await pool.execute(
        `SELECT dia_semana, hora_inicio, hora_fin, hs_reloj, hs_catedra FROM asis_horarios WHERE curso_id = ?`,
        [alumnoCurso[0].curso_id]
      );
      horarios = horariosRows;
      const [faltas]: any = await pool.execute(
        `SELECT fecha, tipo_falta, motivo FROM asis_faltas WHERE alumno_curso_id = ?`,
        [alumnoCurso[0].id]
      );

      // Merge into attendanceData (add extra info)
      const noLabMap: Record<string, string> = {};
      diasNoLab.forEach((d: any) => {
        const key = d.fecha instanceof Date ? d.fecha.toISOString().split('T')[0] : String(d.fecha).split('T')[0];
        noLabMap[key] = d.motivo;
      });
      const eventosMap: Record<string, { descripcion: string; hs_reloj: number; hs_catedra: number }> = {};
      eventos.forEach((e: any) => {
        const key = e.fecha instanceof Date ? e.fecha.toISOString().split('T')[0] : String(e.fecha).split('T')[0];
        eventosMap[key] = { descripcion: e.descripcion, hs_reloj: Number(e.horas_reloj), hs_catedra: Number(e.horas_catedra) };
      });
      const faltasMap: Record<string, { tipo: number; motivo: string }> = {};
      faltas.forEach((f: any) => {
        const key = f.fecha instanceof Date ? f.fecha.toISOString().split('T')[0] : String(f.fecha).split('T')[0];
        faltasMap[key] = { tipo: f.tipo_falta, motivo: f.motivo };
      });

      // Attach extra info to each attendance record
      attendanceData = registros.map((r: any) => {
        const d = r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha).split('T')[0];
        return {
          ...r,
          noLaborable: noLabMap[d] || null,
          evento: eventosMap[d] || null,
          falta: faltasMap[d] || null,
        };
      });

      // Build a lookup for all dates with extra info (including days without records)
      Object.keys(noLabMap).forEach(k => { allDatesExtra[k] = { ...(allDatesExtra[k] || {}), noLaborable: noLabMap[k] }; });
      Object.keys(eventosMap).forEach(k => { allDatesExtra[k] = { ...(allDatesExtra[k] || {}), evento: eventosMap[k] }; });
      Object.keys(faltasMap).forEach(k => { allDatesExtra[k] = { ...(allDatesExtra[k] || {}), falta: faltasMap[k] }; });
      // Mark attendance records
      attendanceData.forEach((r: any) => {
        const d = r.fecha instanceof Date ? r.fecha.toISOString().split('T')[0] : String(r.fecha).split('T')[0];
        allDatesExtra[d] = { ...(allDatesExtra[d] || {}), estado: r.estado, justificacion: r.justificacion, hora_ingreso: r.hora_ingreso, hora_egreso: r.hora_egreso };
      });
    }
  }

  // Fetch notifications for the student
  const [notificaciones]: any = await pool.execute(
    `SELECT id, titulo, mensaje, tipo, leida, fecha 
     FROM asis_notificaciones 
     WHERE user_id = ? 
     ORDER BY fecha DESC LIMIT 20`,
    [userId]
  );

  // Fetch all evaluation periods for the accordion
  const [allPeriods]: any = await pool.execute(
    `SELECT * FROM evaluation_periods ORDER BY start_date ASC`
  );

  // Fetch jira project metrics for the student
  let projectMetrics = null;
  if (user.team_id) {
    const [jiraData]: any = await pool.execute(
      `SELECT ji.issue_type, ji.status, ji.priority, ji.sprint,
              COUNT(*) as total,
              SUM(CASE WHEN ji.status LIKE '%Finaliz%' THEN 1 ELSE 0 END) as finished
       FROM jira_issues ji
       WHERE ji.cell_id = ?
       GROUP BY ji.issue_type`,
      [user.team_id]
    );
    projectMetrics = jiraData;
  }

  // Determine current bimestre
  const [bimestreConfigs]: any = await pool.execute(
    'SELECT bimestre, start_date, end_date FROM scrum_bimestres_config WHERE ? BETWEEN start_date AND end_date LIMIT 1',
    [new Date().toISOString().split('T')[0]]
  );
  const currentBimestre = bimestreConfigs.length > 0 ? bimestreConfigs[0].bimestre : 2;

  // Fetch all bimestres config
  const allBimestres = await getBimestres();

  // Fetch milestones for all bimestres (annual view)
  let burndownData: any[] = [];
  let distByUser: any[] = [];
  let distByPriority: any[] = [];
  let distByStatus: any[] = [];
  let annualBurndown: any[] = [];
  let milestonesByBimestre: { bimestre: number; label: string; milestones: any[] }[] = [];
  if (user.team_id) {
    burndownData = await getBimestreBurndown(user.team_id, currentBimestre);
    distByUser = await getTeamTaskDistribution(user.team_id, currentBimestre);
    distByPriority = await getTeamTaskDistributionByPriority(user.team_id, currentBimestre);
    distByStatus = await getTeamTaskDistributionByStatus(user.team_id, currentBimestre);
    annualBurndown = await getAnnualTeamBurndown(user.team_id, new Date().getFullYear());

    for (const b of allBimestres) {
      const ms = await getTeamMilestones(user.team_id, b.bimestre);
      milestonesByBimestre.push({ bimestre: b.bimestre, label: `Bimestre ${b.bimestre}`, milestones: ms });
    }
  }

  const renderEvalContent = () => {
    return (
      <>
        {!evalEnabled ? (
          <div className="alert" style={{ background: 'rgba(255,193,7,0.1)', color: '#856404', border: '1px solid #ffeeba' }}>
            Las evaluaciones están cerradas actualmente.
          </div>
        ) : !currentPeriod ? (
          <div className="alert alert-error">No hay un periodo de evaluación activo.</div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
            {teamMembers.map((member: any) => {
              const isDone = doneIds.includes(member.id);
              return (
                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>{member.first_name} {member.last_name}</h4>
                    <small style={{ color: 'var(--text-muted)' }}>@{member.username}</small>
                  </div>
                  {isDone ? (
                    <span style={{ color: '#38a169', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>✓ Completado</span>
                  ) : (
                    <a href={`/evaluate/${member.id}`} className="btn btn-primary" style={{ padding: '8px 20px' }}>Evaluar</a>
                  )}
                </div>
              );
            })}
            {teamMembers.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tienes compañeros asignados.</p>}
          </div>
        )}
      </>
    );
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #3182ce 100%)', color: 'white', border: 'none' }}>
        <h2 style={{ margin: 0 }}>Hola, {user.first_name} 👋</h2>
        <p style={{ opacity: 0.9, marginBottom: 0 }}>{user.team_name || 'Sin equipo'} • {user.school_year} - {user.year_div}</p>
      </div>

      <DashboardViews
        evalContent={renderEvalContent()}
        stats={myStats}
        isScrumMaster={false}
        reassignContent={null}
        milestones={milestonesByBimestre}
        burndown={burndownData}
        distByUser={distByUser}
        distByPriority={distByPriority}
        distByStatus={distByStatus}
        annualBurndown={annualBurndown}
        teamId={user.team_id}
        bimestre={currentBimestre}
        individualMetrics={null}
        attendanceData={attendanceData}
        horarios={horarios}
        allDatesExtra={allDatesExtra}
        bimestres={allBimestres}
        evaluationPeriods={allPeriods}
        currentPeriodLabel={currentPeriod?.label}
        projectMetrics={projectMetrics}
        pendingDetailed={pendingDetailed}
      />
    </div>
  );
}
