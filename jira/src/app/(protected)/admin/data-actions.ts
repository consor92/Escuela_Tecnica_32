'use server';

import pool from '@/lib/db';

export async function getTeamStats(teamId: number) {
  const [rows]: any = await pool.execute(`
    SELECT 
        u.first_name, u.last_name, p.label as p_label, 
        AVG((e.score_teamwork + e.score_development + e.score_class_work) / 3) as score_gen,
        AVG(e.score_teamwork) as score_tw,
        AVG(e.score_development) as score_dev,
        AVG(e.score_class_work) as score_cw,
        AVG((e.score_sm_leadership + e.score_sm_facilitation + e.score_sm_support) / 3) as score_sm,
        (SELECT score FROM teacher_evaluations WHERE user_id = u.id AND period_id = p.id LIMIT 1) as score_prof,
        GROUP_CONCAT(CONCAT('• ', e.comments) SEPARATOR '\n') as comments
    FROM users u 
    CROSS JOIN (SELECT * FROM evaluation_periods ORDER BY start_date ASC) p 
    LEFT JOIN evaluations e ON u.id = e.evaluatee_id AND e.period_id = p.id 
    WHERE u.team_id = ? 
    GROUP BY u.id, p.id 
    ORDER BY p.start_date ASC
  `, [teamId]);
  return rows;
}

export async function getTeacherEvals(periodId: number, teamId: number) {
  const [rows]: any = await pool.execute(`
    SELECT user_id, score, comments 
    FROM teacher_evaluations 
    WHERE period_id = ? AND user_id IN (SELECT id FROM users WHERE team_id = ?)
  `, [periodId, teamId]);
  
  const evals: any = {};
  rows.forEach((r: any) => {
    evals[r.user_id] = { score: r.score, comments: r.comments };
  });
  return evals;
}

export async function getTeamComments(teamId: number) {
  const [rows]: any = await pool.execute(`
    SELECT 
        er.first_name as eval_fn, er.last_name as eval_ln,
        ee.first_name as target_fn, ee.last_name as target_ln,
        p.label as p_label, e.comments
    FROM evaluations e
    JOIN users er ON e.evaluator_id = er.id
    JOIN users ee ON e.evaluatee_id = ee.id
    JOIN evaluation_periods p ON e.period_id = p.id
    WHERE ee.team_id = ? AND e.comments IS NOT NULL AND e.comments != ''
    ORDER BY p.start_date DESC, ee.last_name ASC
  `, [teamId]);
  return rows;
}
