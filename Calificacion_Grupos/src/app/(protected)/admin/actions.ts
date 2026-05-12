'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import md5 from 'md5';

export async function createTeam(name: string) {
  await pool.execute('INSERT INTO teams (name) VALUES (?)', [name]);
  revalidatePath('/admin');
}

export async function deleteTeam(teamId: number) {
  // 1. Obtener IDs de los alumnos del equipo
  const [users]: any = await pool.execute('SELECT id FROM users WHERE team_id = ?', [teamId]);
  const userIds = users.map((u: any) => u.id);

  if (userIds.length > 0) {
    const placeholders = userIds.map(() => '?').join(',');
    // 2. Borrar evaluaciones donde sean evaluadores o evaluados
    await pool.execute(`DELETE FROM evaluations WHERE evaluator_id IN (${placeholders}) OR evaluatee_id IN (${placeholders})`, [...userIds, ...userIds]);
    // 3. Borrar evaluaciones docentes
    await pool.execute(`DELETE FROM teacher_evaluations WHERE user_id IN (${placeholders})`, userIds);
    // 4. Borrar asignaciones de Scrum Master
    await pool.execute('DELETE FROM scrum_masters WHERE team_id = ?', [teamId]);
  }

  // 5. Finalmente borrar el equipo y desvincular usuarios
  await pool.execute('UPDATE users SET team_id = NULL WHERE team_id = ?', [teamId]);
  await pool.execute('DELETE FROM teams WHERE id = ?', [teamId]);
  revalidatePath('/admin');
}

export async function renameTeam(teamId: number, newName: string) {
  await pool.execute('UPDATE teams SET name = ? WHERE id = ?', [newName, teamId]);
  revalidatePath('/admin');
}

export async function assignUserToTeam(userId: number, teamId: number | null) {
  await pool.execute('UPDATE users SET team_id = ? WHERE id = ?', [teamId, userId]);
  revalidatePath('/admin');
}

export async function toggleEvaluations(enabled: boolean) {
  await pool.execute('UPDATE settings SET val = ? WHERE key_name = "evaluations_enabled"', [enabled ? 1 : 0]);
  revalidatePath('/admin');
}

export async function setActivePeriod(periodId: number) {
  await pool.execute('UPDATE evaluation_periods SET is_active = 0');
  await pool.execute('UPDATE evaluation_periods SET is_active = 1 WHERE id = ?', [periodId]);
  revalidatePath('/admin');
}

export async function addAcademicOption(type: string, value: string) {
  await pool.execute('INSERT INTO academic_options (type, value) VALUES (?, ?)', [type, value]);
  revalidatePath('/admin');
}

export async function deleteAcademicOption(id: number) {
  await pool.execute('DELETE FROM academic_options WHERE id = ?', [id]);
  revalidatePath('/admin');
}

export async function assignScrumMaster(teamId: number, userId: number | null, bimestre: number) {
  await pool.execute('DELETE FROM scrum_masters WHERE team_id = ? AND bimestre = ?', [teamId, bimestre]);
  if (userId) {
    await pool.execute('INSERT INTO scrum_masters (team_id, user_id, bimestre) VALUES (?, ?, ?)', [teamId, userId, bimestre]);
  }
  revalidatePath('/admin');
}

export async function updateTeamAcademicInfo(teamId: number, schoolYear: string, yearDiv: string) {
  await pool.execute(
    'UPDATE users SET school_year = ?, year_div = ? WHERE team_id = ?',
    [schoolYear, yearDiv, teamId]
  );
  revalidatePath('/admin');
}

export async function forcePasswordReset(userId: number, newPassword: string) {
  const hash = md5(newPassword);
  await pool.execute('UPDATE users SET password_md5 = ? WHERE id = ?', [hash, userId]);
  revalidatePath('/admin');
  return { success: true };
}

export async function saveTeacherEvaluations(periodId: number, evaluations: any[]) {
  for (const eval_item of evaluations) {
    const { userId, score, comments } = eval_item;
    if (score !== undefined && score !== null && score !== '') {
      await pool.execute(
        'INSERT INTO teacher_evaluations (period_id, user_id, score, comments) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score), comments = VALUES(comments)',
        [periodId, userId, score, comments || '']
      );
    }
  }
  revalidatePath('/admin');
}
