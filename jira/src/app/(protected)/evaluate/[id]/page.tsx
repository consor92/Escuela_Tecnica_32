import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import EvaluationWizard from '@/components/EvaluationWizard';

export default async function EvaluatePage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const evaluateeId = params.id;
  const evaluatorId = session.user.id;

  const [users]: any = await pool.execute(`
    SELECT u.*, t.name as team_name 
    FROM users u 
    JOIN teams t ON u.team_id = t.id 
    WHERE u.id = ?
  `, [evaluateeId]);
  const evaluatee = users[0];

  if (!evaluatee) redirect('/dashboard');

  const [periods]: any = await pool.execute(`
    SELECT * FROM evaluation_periods 
    WHERE is_active = 1 
    OR (CURDATE() BETWEEN start_date AND end_date)
    ORDER BY is_active DESC, ABS(DATEDIFF(CURDATE(), start_date)) ASC
    LIMIT 1
  `);
  const currentPeriod = periods[0];

  if (!currentPeriod) redirect('/dashboard');

  const [done]: any = await pool.execute(
    'SELECT id FROM evaluations WHERE period_id = ? AND evaluator_id = ? AND evaluatee_id = ?',
    [currentPeriod.id, evaluatorId, evaluateeId]
  );
  if (done.length > 0) redirect('/dashboard');

  const [sm]: any = await pool.execute(
    'SELECT id FROM scrum_masters WHERE user_id = ? AND bimestre = ?',
    [evaluateeId, currentPeriod.bimestre]
  );
  const isSM = sm.length > 0;

  // Fetch all teammates for progress tracking
  const [teamMembers]: any = await pool.execute(`
    SELECT id, first_name, last_name FROM users WHERE team_id = ? AND id != ? ORDER BY first_name
  `, [evaluatee.team_id, evaluatorId]);

  // Fetch already evaluated teammate IDs
  const [evaluatedRows]: any = await pool.execute(
    'SELECT evaluatee_id FROM evaluations WHERE period_id = ? AND evaluator_id = ?',
    [currentPeriod.id, evaluatorId]
  );
  const evaluatedIds = evaluatedRows.map((r: any) => r.evaluatee_id);

  return (
    <div className="evaluation-container" style={{ padding: '20px' }}>
      <div className="card">
        <h2>Evaluando a {evaluatee.first_name} {evaluatee.last_name}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Periodo: {currentPeriod.label}</p>

        <EvaluationWizard
          evaluatorId={evaluatorId}
          evaluateeId={evaluateeId}
          periodId={currentPeriod.id}
          isSM={isSM}
          teamMembers={teamMembers}
          evaluatedIds={evaluatedIds}
        />
      </div>
    </div>
  );
}
