import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StudentEvolutionChart from '@/components/StudentEvolutionChart';

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

  return (
    <div className="dashboard-container">
      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #3182ce 100%)', color: 'white', border: 'none' }}>
        <h2 style={{ margin: 0 }}>Hola, {user.first_name} 👋</h2>
        <p style={{ opacity: 0.9, marginBottom: 0 }}>{user.team_name || 'Sin equipo'} • {user.school_year} - {user.year_div}</p>
      </div>

      {pendingDetailed.length > 0 && (
        <div className="alert alert-error" style={{ marginTop: '1.5rem', background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>⚠️ Tienes evaluaciones pendientes de periodos anteriores:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {pendingDetailed.map((p: any, i: number) => (
              <li key={i}>
                <strong>{p.p_label}</strong>: Falta evaluar a <strong>{p.first_name} {p.last_name}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', marginTop: '1.5rem' }}>
        {/* Lado Izquierdo: Evaluaciones */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Compañeros por Evaluar</h3>
            <span className="tag" style={{ background: 'var(--border-color)' }}>{currentPeriod?.label || 'S/P'}</span>
          </div>

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
        </div>

        {/* Lado Derecho: Mi Evolución */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Mi Curva de Progreso</h3>
          <StudentEvolutionChart stats={myStats} />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '15px', textAlign: 'center' }}>
            Esta gráfica muestra tu evolución general basada en las evaluaciones de tus pares. No se muestran valores numéricos para fomentar el enfoque en la mejora continua.
          </p>
        </div>
      </div>
    </div>
  );
}
