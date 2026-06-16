'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveEvaluation(data: any) {
  try {
    const { 
      evaluatorId, evaluateeId, periodId, 
      tw_avg, dev_avg, cw_avg, 
      isSM, sm_l_avg, sm_f_avg, sm_s_avg, 
      comments 
    } = data;

    await pool.execute(`
      INSERT INTO evaluations (
        period_id, evaluator_id, evaluatee_id, 
        score_teamwork, score_development, score_class_work,
        is_sm_eval, score_sm_leadership, score_sm_facilitation, score_sm_support,
        comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      periodId, evaluatorId, evaluateeId,
      tw_avg, dev_avg, cw_avg,
      isSM ? 1 : 0, sm_l_avg || null, sm_f_avg || null, sm_s_avg || null,
      comments || ''
    ]);

    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error saving evaluation:', error);
    throw new Error('No se pudo guardar la evaluación.');
  }
  
  redirect('/dashboard');
}
