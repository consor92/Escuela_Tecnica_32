'use server';
import pool from '@/lib/db';

export async function getTeamSummary(teamId: number) {
  // 1. Obtener integrantes reales del equipo
  const [teamMembers]: any = await pool.execute(
    'SELECT id, first_name, last_name, external_id FROM users WHERE team_id = ?',
    [teamId]
  );

  // 2. Obtener tareas vinculadas a este equipo
  const [issues]: any = await pool.execute('SELECT * FROM jira_issues WHERE cell_id = ?', [teamId]);
  
  const totalIssues = issues.length;
  const finalized = issues.filter((i: any) => i.status === 'Finalizado').length;
  
  // 3. Procesar carga por integrante REAL del sistema
  const workload = teamMembers.map((member: any) => {
    // Filtrar tareas que coincidan con el ID interno (m.id) O con el ID de Jira (m.external_id)
    const userIssues = issues.filter((i: any) => {
        if (!i.assignee_id) return false;
        return String(i.assignee_id) === String(member.id) || 
               (member.external_id && String(i.assignee_id) === String(member.external_id));
    });

    const done = userIssues.filter((i: any) => i.status === 'Finalizado').length;
    
    return {
      name: `${member.first_name} ${member.last_name}`,
      tasks: userIssues.length,
      done: done,
      time: userIssues.reduce((acc: number, i: any) => acc + (parseFloat(i.time_spent) || 0), 0).toFixed(1),
      progress: userIssues.length > 0 ? ((done / userIssues.length) * 100).toFixed(0) : 0
    };
  });

  // 4. Capturar tareas "Huérfanas" (No asignadas a nadie en el equipo)
  const unassignedTasks = issues.filter((i: any) => {
      if (!i.assignee_id) return true;
      return !teamMembers.some((m: any) => 
          String(i.assignee_id) === String(m.id) || 
          (m.external_id && String(i.assignee_id) === String(m.external_id))
      );
  });

  // 5. Hitos (Epicas)
  const milestones = issues.filter((i: any) => i.parent_summary || i.issue_type === 'Epic')
    .reduce((acc: any, i: any) => {
      const parent = i.parent_summary || i.summary;
      if (!acc[parent]) acc[parent] = { total: 0, done: 0 };
      acc[parent].total += 1;
      if (i.status === 'Finalizado') acc[parent].done += 1;
      return acc;
    }, {});

  const priorityDistribution = issues.reduce((acc: any, i: any) => {
    const p = i.priority || 'N/A';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  return {
    totalIssues,
    finalized,
    unassignedCount: unassignedTasks.length,
    efficiency: totalIssues > 0 ? ((finalized / totalIssues) * 100).toFixed(1) : 0,
    workload,
    milestones,
    priorityDistribution,
    totalTimeSpent: issues.reduce((acc: number, i: any) => acc + (parseFloat(i.time_spent) || 0), 0).toFixed(2),
    totalVulnerabilities: issues.reduce((acc: number, i: any) => acc + (parseInt(i.vulnerability_count) || 0), 0)
  };
}
