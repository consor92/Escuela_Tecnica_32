'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { parseJiraCSV } from '@/lib/jira-parser';
import { calculateGrades } from '@/lib/metrics';
import { findUserIdInTeam } from './user-finder';

export async function importJiraCSV(cellId: number, csvContent: string) {
  const issues = parseJiraCSV(csvContent);
  let nuevos = 0;
  let actualizados = 0;

  // Obtener alumnos del equipo para la vinculación difusa
  const [teamMembers]: any = await pool.execute(
    "SELECT id, first_name, last_name, external_id FROM users WHERE team_id = ?",
    [cellId]
  );
  
  for (const issue of issues) {
    let userId = null;
    let foundByName = false;

    // 1. PRIORIDAD: Intentar vincular por NOMBRE (Persona asignada)
    if (issue.assigneeName) {
        userId = await findUserIdInTeam(issue.assigneeName, teamMembers);
        if (userId) foundByName = true;
    }

    // 2. RESPALDO: Si no hubo match por nombre, intentar por ID directo (external_id)
    if (!userId && issue.assigneeId) {
        const matchedUser = teamMembers.find((m: any) => m.external_id == issue.assigneeId);
        userId = matchedUser ? matchedUser.id : null;
    }
    
    // 3. Auto-aprendizaje de ID si vinculamos por nombre pero no tenía el ID guardado
    if (foundByName && userId && issue.assigneeId) {
        await pool.execute('UPDATE users SET external_id = ? WHERE id = ? AND (external_id IS NULL OR external_id = "" OR external_id = "0")', [issue.assigneeId, userId]);
    }
    
    const [existing]: any = await pool.execute('SELECT * FROM jira_issues WHERE issue_key = ?', [issue.issueKey]);
    
    if (existing.length > 0) {
      await pool.execute(
        `UPDATE jira_issues SET 
          summary = ?, status = ?, priority = ?, updated_at = ?,
          resolved_at = ?, time_spent = ?, vulnerability_count = ?, assignee_id = ?,
          parent_key = ?, epic = ?, story_points = ?, sprint = ?, original_assignee_name = ?,
          carry_over = ?
         WHERE issue_key = ?`,
        [
          issue.summary ?? null, 
          issue.status ?? null, 
          issue.priority ?? null, 
          issue.updatedAt ?? null, 
          issue.resolvedAt ?? null, 
          issue.timeSpent ?? 0, 
          issue.vulnerability ?? 0, 
          userId ?? null, 
          issue.parentKey ?? null, 
          issue.epic ?? null, 
          issue.storyPoints ?? 0, 
          issue.sprint ?? null, 
          issue.assigneeName ?? null, 
          issue.isCarryOver ? 1 : 0, 
          issue.issueKey
        ]
      );
      actualizados++;
    } else {
      await pool.execute(
        `INSERT INTO jira_issues (
          issue_key, parent_key, epic, summary, issue_type, status, priority, 
          assignee_id, created_at, updated_at, resolved_at, due_date,
          original_estimate, time_spent, vulnerability_count, cell_id,
          story_points, sprint, original_assignee_name, carry_over
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          issue.issueKey, 
          issue.parentKey ?? null, 
          issue.epic ?? null, 
          issue.summary ?? null, 
          issue.type ?? null, 
          issue.status ?? null, 
          issue.priority ?? null,
          userId ?? null, 
          issue.createdAt ?? null, 
          issue.updatedAt ?? null, 
          issue.resolvedAt ?? null, 
          issue.dueDate ?? null,
          issue.originalEstimate ?? 0, 
          issue.timeSpent ?? 0, 
          issue.vulnerability ?? 0, 
          cellId,
          issue.storyPoints ?? 0, 
          issue.sprint ?? null, 
          issue.assigneeName ?? null, 
          issue.isCarryOver ? 1 : 0
        ]
      );
      nuevos++;
    }
  }
  revalidatePath('/admin/scrum-eval');
  return { nuevos, actualizados };
}

export async function saveCeremony(data: any) {
  const { cellId, periodId, type, scheduledAt, blocks, agreements, attendance, createdBy } = data;
  
  const [result]: any = await pool.execute(
    'INSERT INTO scrum_ceremonies (cell_id, period_id, type, scheduled_at, blocks, agreements, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [cellId, periodId, type, scheduledAt, blocks, agreements, createdBy]
  );
  
  const ceremonyId = result.insertId;
  
  for (const userId of attendance) {
    await pool.execute(
      'INSERT INTO scrum_attendance (ceremony_id, user_id, attended) VALUES (?, ?, 1)',
      [ceremonyId, userId]
    );
  }
  
  revalidatePath('/scrum/ceremonies');
}

export async function saveFieldNotebookScore(userId: number, periodId: number, score: number) {
  await pool.execute(
    `INSERT INTO teacher_evaluations (user_id, period_id, field_notebook_score, score) 
     VALUES (?, ?, ?, 0) 
     ON DUPLICATE KEY UPDATE field_notebook_score = VALUES(field_notebook_score)`,
    [userId, periodId, score]
  );
  revalidatePath('/admin/scrum-eval');
  return { success: true };
}

export async function saveCeremonyRecord(data: any) {
  const { cellId, periodId, type, attendance } = data;
  const [result]: any = await pool.execute(
    'INSERT INTO scrum_ceremonies (team_id, period_id, type, date) VALUES (?, ?, ?, NOW())',
    [cellId, periodId, type]
  );
  const ceremonyId = result.insertId;
  for (const userId of attendance) {
    await pool.execute(
      'INSERT INTO scrum_attendance (ceremony_id, user_id, attended) VALUES (?, ?, 1)',
      [ceremonyId, userId]
    );
  }
  revalidatePath('/admin/scrum-eval');
  return { success: true };
}

export async function processGrades(cellId: number, bimestre: number) {
  // 1. Obtener miembros del equipo
  const [membersRaw]: any = await pool.execute(
    'SELECT id as userId, "DEV" as role FROM users WHERE team_id = ?',
    [cellId]
  );

  // 2. Obtener config del bimestre
  const [config]: any = await pool.execute(
    'SELECT start_date, end_date FROM scrum_bimestres_config WHERE bimestre = ?',
    [bimestre]
  );
  if (config.length === 0) throw new Error('Configuración de bimestre no encontrada');
  const { start_date, end_date } = config[0];

  // 3. Obtener Coevaluaciones, Notas Docentes y Carpeta
  const members = [];
  for (const m of membersRaw) {
    // Promedio de coevaluación (de la tabla evaluations)
    const [coeval]: any = await pool.execute(
      'SELECT AVG((score_teamwork + score_development + score_class_work) / 3) * 10 as avgCoeval FROM evaluations WHERE evaluatee_id = ? AND period_id = ?',
      [m.userId, bimestre]
    );
    
    // Nota Docente y Carpeta (de teacher_evaluations)
    const [teacher]: any = await pool.execute(
      'SELECT score * 10 as tScore, field_notebook_score * 10 as fScore FROM teacher_evaluations WHERE user_id = ? AND period_id = ?',
      [m.userId, bimestre]
    );

    members.push({
      ...m,
      coevalScore: coeval[0]?.avgCoeval || 0,
      teacherScore: teacher[0]?.tScore || 0,
      fieldNotebookScore: teacher[0]?.fScore || 0
    });
  }

  // 4. Obtener issues de Jira
  const [issuesRaw]: any = await pool.execute(
    `SELECT * FROM jira_issues 
     WHERE cell_id = ? 
     AND DATE(updated_at) BETWEEN ? AND ?`,
    [cellId, start_date, end_date]
  );
  
  const issues = issuesRaw.map((i: any) => ({
    issueKey: i.issue_key,
    summary: i.summary,
    issueType: i.issue_type,
    status: i.status,
    priority: i.priority,
    assigneeId: i.assignee_id,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
    resolvedAt: i.resolved_at,
    dueDate: i.due_date,
    originalEstimate: i.original_estimate,
    timeSpent: i.time_spent,
    vulnerabilityCount: i.vulnerability_count,
    carryOverCount: i.carry_over ? 1 : 0,
    reopenedCount: 0,
  }));

  // 5. Obtener Ceremonias y Asistencia real
  const [ceremoniesRaw]: any = await pool.execute(
    'SELECT id, type FROM scrum_ceremonies WHERE team_id = ? AND period_id = ?',
    [cellId, bimestre]
  );

  const ceremonies = [];
  for (const c of ceremoniesRaw) {
    const [attendance]: any = await pool.execute(
      'SELECT user_id as userId, attended FROM scrum_attendance WHERE ceremony_id = ?',
      [c.id]
    );
    ceremonies.push({ id: c.id, type: c.type, attendance });
  }

  // 6. Calcular notas al 100%
  const results = calculateGrades({
    cellId,
    members,
    issues,
    ceremonies,
    backlogTotal: issues.length
  });

  // 7. Guardar en final_grades
  for (const userId in results.individualResults) {
    const res = results.individualResults[userId];
    await pool.execute(
      `INSERT INTO final_grades (user_id, cell_id, period_id, individual_score, group_score, final_score, metrics_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         individual_score = VALUES(individual_score), 
         group_score = VALUES(group_score),
         final_score = VALUES(final_score), 
         metrics_json = VALUES(metrics_json)`,
      [
        userId, cellId, bimestre, res.jiraBase, results.groupScore, res.finalScore, JSON.stringify({
          jira: res.jiraBase,
          asistencia: res.attendanceBase,
          coevaluacion: res.coevalBase,
          docente: res.teacherBase,
          carpeta: res.notebookBase,
          detalles: res.details
        })
      ]
    );
  }

  revalidatePath('/admin/reports');
  return results;
}

export async function togglePracticeEnablement(date: string, academicLevelId: number, enabled: boolean, enabledBy: number) {
  await pool.execute(
    'INSERT INTO practices_enablement (date, academic_level_id, enabled, enabled_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE enabled = VALUES(enabled), enabled_by = VALUES(enabled_by)',
    [date, academicLevelId, enabled ? 1 : 0, enabledBy]
  );
  revalidatePath('/admin/practicas');
}

export async function savePracticeLog(userId: number, companyId: number, date: string, hours: number, log: string) {
  await pool.execute(
    'INSERT INTO practices_logs (user_id, company_id, date, hours_worked, log_entry) VALUES (?, ?, ?, ?, ?)',
    [userId, companyId, date, hours, log]
  );
  revalidatePath('/practicas/bitacora');
  return { success: true };
}

export async function getPeriods() {
  const [rows]: any = await pool.execute('SELECT bimestre as id, bimestre as label, start_date, end_date, bimestre FROM scrum_bimestres_config ORDER BY bimestre ASC');
  return rows;
}

export async function updatePeriodDates(id: number, startDate: string, endDate: string) {
  await pool.execute(
    'UPDATE scrum_bimestres_config SET start_date = ?, end_date = ? WHERE bimestre = ?',
    [startDate, endDate, id]
  );
  revalidatePath('/admin/scrum-eval');
  return { success: true };
}
