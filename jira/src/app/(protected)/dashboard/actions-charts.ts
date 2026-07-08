'use server';

import pool from '@/lib/db';

export async function getBimestres() {
  const [rows]: any = await pool.execute(
    'SELECT bimestre, start_date, end_date FROM scrum_bimestres_config ORDER BY bimestre'
  );
  return rows;
}

export async function getBimestreBurndown(teamId: number, bimestre: number) {
  const [configs]: any = await pool.execute(
    'SELECT start_date, end_date FROM scrum_bimestres_config WHERE bimestre = ?',
    [bimestre]
  );
  if (configs.length === 0) return [];
  const { start_date, end_date } = configs[0];

  const [issues]: any = await pool.execute(
    `SELECT issue_type, status, updated_at, created_at
     FROM jira_issues
     WHERE cell_id = ? AND created_at BETWEEN ? AND ?`,
    [teamId, start_date, end_date]
  );

  // Misma lógica que el admin summary.ts: excluir subtareas, usar updated_at
  const mainTasks = issues.filter((i: any) => !String(i.issue_type).toLowerCase().includes('sub'));
  const totalCount = mainTasks.length;
  if (totalCount === 0) return [];

  const periodStart = new Date(start_date);
  periodStart.setHours(0, 0, 0, 0);
  const periodEnd = new Date(end_date);
  periodEnd.setHours(0, 0, 0, 0);
  const totalDays = Math.max(1, (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

  const data: { date: string; remaining: number; ideal: number }[] = [];
  const currentDate = new Date(periodStart);

  while (currentDate <= periodEnd) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayEnd = new Date(currentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const doneByThen = mainTasks.filter((i: any) =>
      String(i.status).toLowerCase().startsWith('finaliz') &&
      i.updated_at &&
      new Date(i.updated_at).getTime() <= dayEnd.getTime()
    ).length;

    const remaining = totalCount - doneByThen;
    const currentDay = (currentDate.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24);
    const ideal = Math.max(0, totalCount - (totalCount * (currentDay / totalDays)));

    data.push({ date: dateStr, remaining, ideal: parseFloat(ideal.toFixed(2)) });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return data;
}

export async function getTeamTaskDistribution(teamId: number, bimestre: number) {
  const [configs]: any = await pool.execute(
    'SELECT start_date, end_date FROM scrum_bimestres_config WHERE bimestre = ?',
    [bimestre]
  );
  if (configs.length === 0) return [];
  const { start_date, end_date } = configs[0];

  const [rows]: any = await pool.execute(
    `SELECT u.first_name, u.last_name, COUNT(*) as total
     FROM jira_issues ji
     JOIN users u ON u.id = ji.assignee_id
     WHERE ji.cell_id = ? AND ji.created_at BETWEEN ? AND ?
     GROUP BY ji.assignee_id
     ORDER BY total DESC`,
    [teamId, start_date, end_date]
  );
  return rows.map((r: any) => ({ name: `${r.first_name} ${r.last_name}`, total: Number(r.total) }));
}

export async function getTeamTaskDistributionByPriority(teamId: number, bimestre: number) {
  const [configs]: any = await pool.execute(
    'SELECT start_date, end_date FROM scrum_bimestres_config WHERE bimestre = ?',
    [bimestre]
  );
  if (configs.length === 0) return [];
  const { start_date, end_date } = configs[0];

  const [byPriority]: any = await pool.execute(
    `SELECT priority, COUNT(*) as total
     FROM jira_issues
     WHERE cell_id = ? AND created_at BETWEEN ? AND ?
     GROUP BY priority
     ORDER BY total DESC`,
    [teamId, start_date, end_date]
  );
  return byPriority.map((r: any) => ({ priority: r.priority || 'Sin prioridad', total: Number(r.total) }));
}

export async function getTeamTaskDistributionByStatus(teamId: number, bimestre: number) {
  const [configs]: any = await pool.execute(
    'SELECT start_date, end_date FROM scrum_bimestres_config WHERE bimestre = ?',
    [bimestre]
  );
  if (configs.length === 0) return [];
  const { start_date, end_date } = configs[0];

  const [byStatus]: any = await pool.execute(
    `SELECT status, COUNT(*) as total
     FROM jira_issues
     WHERE cell_id = ? AND created_at BETWEEN ? AND ?
     GROUP BY status
     ORDER BY total DESC`,
    [teamId, start_date, end_date]
  );
  return byStatus.map((r: any) => ({ status: r.status || 'Sin estado', total: Number(r.total) }));
}

export async function getAnnualTeamBurndown(teamId: number, year: number) {
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const [issues]: any = await pool.execute(
    `SELECT issue_type, status, updated_at, created_at
     FROM jira_issues
     WHERE cell_id = ? AND created_at BETWEEN ? AND ?`,
    [teamId, yearStart, yearEnd]
  );

  const mainTasks = issues.filter((i: any) => !String(i.issue_type).toLowerCase().includes('sub'));
  const totalCount = mainTasks.length;
  if (totalCount === 0) return [];

  const data: { date: string; remaining: number; ideal: number }[] = [];
  const start = new Date(yearStart);
  const end = new Date(yearEnd);
  const totalWeeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)));

  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = new Date(start);
    weekStart.setDate(weekStart.getDate() + w * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const doneByThen = mainTasks.filter((i: any) =>
      String(i.status).toLowerCase().startsWith('finaliz') &&
      i.updated_at &&
      new Date(i.updated_at).getTime() <= weekEnd.getTime()
    ).length;

    const remaining = totalCount - doneByThen;
    const ideal = Math.max(0, totalCount - (totalCount * (w / totalWeeks)));

    data.push({
      date: weekStart.toISOString().split('T')[0],
      remaining,
      ideal: parseFloat(ideal.toFixed(2)),
    });
  }

  return data;
}

export async function getTeamMilestones(teamId: number, bimestre: number) {
  const [configs]: any = await pool.execute(
    'SELECT start_date, end_date FROM scrum_bimestres_config WHERE bimestre = ?',
    [bimestre]
  );
  if (configs.length === 0) return [];
  const { start_date, end_date } = configs[0];

  const [issues]: any = await pool.execute(
    `SELECT issue_key, parent_key, epic, issue_type, status, summary, priority, original_assignee_name
     FROM jira_issues
     WHERE cell_id = ? AND created_at BETWEEN ? AND ?`,
    [teamId, start_date, end_date]
  );

  // Identificar épicas
  const epicKeys = new Set<string>();
  const epicKeyToName: Record<string, string> = {};
  issues.forEach((i: any) => {
    if (String(i.issue_type).toLowerCase().includes('epic')) {
      epicKeys.add(i.issue_key);
      epicKeyToName[i.issue_key] = i.summary || i.issue_key;
    }
  });

  const epicSummaryToKey: Record<string, string> = {};
  Object.entries(epicKeyToName).forEach(([key, name]) => {
    epicSummaryToKey[name.toLowerCase().trim()] = key;
  });

  function findEpicForIssue(issue: any): string | null {
    if (issue.epic) return epicKeyToName[issue.epic] || issue.epic;
    if (issue.parent_key) {
      if (epicKeys.has(issue.parent_key)) return epicKeyToName[issue.parent_key];
      const normalizedParent = String(issue.parent_key).toLowerCase().trim();
      if (epicSummaryToKey[normalizedParent]) return epicKeyToName[epicSummaryToKey[normalizedParent]];
    }
    if (epicKeys.has(issue.issue_key)) return issue.summary || issue.issue_key;
    return null;
  }

  const milestoneMap: Record<string, { total: number; done: number }> = {};
  const milestoneIssues: Record<string, any[]> = {};

  issues.forEach((i: any) => {
    const epic = findEpicForIssue(i);
    if (!epic) return;
    if (!milestoneMap[epic]) milestoneMap[epic] = { total: 0, done: 0 };
    milestoneMap[epic].total++;
    const finalized = String(i.status).toLowerCase().startsWith('finaliz');
    if (finalized) milestoneMap[epic].done++;
    if (!milestoneIssues[epic]) milestoneIssues[epic] = [];
    milestoneIssues[epic].push({
      key: i.issue_key,
      summary: i.summary,
      type: i.issue_type,
      status: i.status,
      priority: i.priority,
      assignee: i.original_assignee_name || null,
      finalized,
    });
  });

  return Object.entries(milestoneMap).map(([name, stats]) => ({
    name,
    total: stats.total,
    done: stats.done,
    progress: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0,
    issues: milestoneIssues[name] || [],
  })).sort((a, b) => b.progress - a.progress);
}

function isFinalized(s: string) { return String(s).toLowerCase().startsWith('finaliz'); }

function getTaskWeight(p: string): number {
  const s = String(p).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (s.includes('alta') || s.includes('high') || s.includes('critic') || s.includes('critical')) return 5;
  if (s.includes('media') || s.includes('medium')) return 3;
  return 1;
}

export async function getMyIndividualMetrics(userId: number, teamId: number, bimestre: number) {
  const [configs]: any = await pool.execute(
    'SELECT start_date, end_date FROM scrum_bimestres_config WHERE bimestre = ?', [bimestre]
  );
  if (configs.length === 0) return null;
  const { start_date, end_date } = configs[0];

  const [issuesRaw]: any = await pool.execute(
    `SELECT issue_key, status, priority, created_at, updated_at, due_date,
            vulnerability_count, carry_over, sprint
     FROM jira_issues
     WHERE cell_id = ? AND assignee_id = ? AND DATE(updated_at) BETWEEN ? AND ?`,
    [teamId, userId, start_date, end_date]
  );

  const issues = issuesRaw.map((i: any) => ({
    issueKey: i.issue_key,
    status: i.status,
    priority: i.priority,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
    dueDate: i.due_date,
    vulnerabilityCount: i.vulnerability_count,
    carryOver: i.carry_over ? 1 : 0,
    sprint: i.sprint,
  }));

  const totalTasks = issues.length;
  const finished = issues.filter((i: any) => isFinalized(i.status));
  const finishedCount = finished.length;
  const expired = issues.filter((i: any) => !isFinalized(i.status) && i.dueDate && new Date(i.dueDate) < new Date());

  const detalles: { concepto: string; puntos: number }[] = [];
  let score = 0;

  if (totalTasks > 0) {
    score = (finishedCount / totalTasks) * 100;
    detalles.push({ concepto: `Base (${finishedCount}/${totalTasks} completadas)`, puntos: score });
  }

  finished.forEach((i: any) => {
    if (i.priority === 'Alta' || i.priority === 'Crítica') {
      score += 5;
      detalles.push({ concepto: `Bono tarea ${i.priority}`, puntos: 5 });
    }
    if (i.priority === 'Baja') {
      score -= 2;
      detalles.push({ concepto: `Penalidad tarea Baja`, puntos: -2 });
    }
  });

  issues.forEach((i: any) => {
    if (!isFinalized(i.status) && i.dueDate && new Date(i.dueDate) < new Date()) {
      score -= 10;
      detalles.push({ concepto: 'Tarea vencida sin finalizar', puntos: -10 });
    }
    if (i.vulnerabilityCount > 0) {
      const p = -8 * i.vulnerabilityCount;
      score += p;
      detalles.push({ concepto: `Vulnerabilidad (${i.vulnerabilityCount})`, puntos: p });
    }
    if (i.carryOver >= 1) {
      score -= 12;
      detalles.push({ concepto: 'Carry-over', puntos: -12 });
    }
  });

  return {
    totalTasks,
    finishedCount,
    expiredCount: expired.length,
    scoreFinal: Math.min(100, Math.max(0, score)),
    detalles,
  };
}
