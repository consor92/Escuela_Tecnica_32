'use server';
import pool from '@/lib/db';

export async function getTeamSummary(teamId: number, bimestre?: number) {
  // 1. Obtener integrantes reales del equipo
  const [teamMembers]: any = await pool.execute(
    'SELECT id, first_name, last_name, external_id FROM users WHERE team_id = ?',
    [teamId]
  );

  // 2. Obtener tareas vinculadas a este equipo
  let query = 'SELECT * FROM jira_issues WHERE cell_id = ?';
  const params: any[] = [teamId];

  if (bimestre && bimestre >= 1 && bimestre <= 4) {
      query = `
        SELECT ji.* FROM jira_issues ji
        WHERE ji.cell_id = ? 
        AND (
            EXISTS (
                SELECT 1 FROM scrum_bimestres_config sbc
                WHERE sbc.bimestre = ? 
                AND DATE(ji.updated_at) BETWEEN sbc.start_date AND sbc.end_date
            )
        )
      `;
      params.push(bimestre);
  }

  const [issues]: any = await pool.execute(query, params);
  
  const totalIssues = issues.length;
  const totalSP = issues.reduce((acc: number, i: any) => acc + (parseFloat(i.story_points) || 0), 0);
  
  // Identificación por Tipo de Incidencia
  const tasks = issues.filter((i: any) => !String(i.issue_type).toLowerCase().includes('sub'));
  const subtasks = issues.filter((i: any) => String(i.issue_type).toLowerCase().includes('sub'));

  const finalizedTasks = tasks.filter((i: any) => i.status === 'Finalizado').length;
  const finalizedSubtasks = subtasks.filter((i: any) => i.status === 'Finalizado').length;

  const finalizedSP = issues.filter((i: any) => i.status === 'Finalizado')
    .reduce((acc: number, i: any) => acc + (parseFloat(i.story_points) || 0), 0);

  // Procesar HITOS (Epics)
  const milestoneMap: Record<string, { total: number, done: number }> = {};
  let unassignedHitoCount = 0;

  issues.forEach((i: any) => {
      const epic = i.epic || null;
      if (!epic) {
          unassignedHitoCount++;
          return;
      }
      
      if (!milestoneMap[epic]) milestoneMap[epic] = { total: 0, done: 0 };
      milestoneMap[epic].total++;
      if (i.status === 'Finalizado') milestoneMap[epic].done++;
  });

  const milestones = Object.entries(milestoneMap).map(([name, stats]) => ({
      name,
      total: stats.total,
      done: stats.done,
      progress: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  })).sort((a, b) => b.progress - a.progress);

  // Filtrado por bimestre: Solo hitos con tareas en este periodo y NO mostrar "Sin Hito"
  // (Nota: unassignedHitoCount ya excluye los nulos del mapa, así que solo filtramos si es bimestre)
  if (bimestre) {
      // En bimestre ya vienen filtradas las issues por fecha, 
      // así que el mapa solo contiene hitos que tuvieron actividad.
      // No necesitamos hacer nada extra más que asegurar que la UI no muestre el contador de sin hito.
  }

  // 3. Procesar carga por integrante REAL del sistema
  const workload = teamMembers.map((member: any) => {
    const userIssues = issues.filter((i: any) => {
        const isInternalIdMatch = String(i.assignee_id) === String(member.id);
        const isExternalIdMatch = member.external_id && (
            String(i.assignee_id) === String(member.external_id) ||
            String(i.original_assignee_name).toLowerCase() === String(member.external_id).toLowerCase()
        );
        return isInternalIdMatch || isExternalIdMatch;
    });

    const userTasks = userIssues.filter((i: any) => !String(i.issue_type).toLowerCase().includes('sub'));
    const userSubtasks = userIssues.filter((i: any) => String(i.issue_type).toLowerCase().includes('sub'));

    const done = userTasks.filter((i: any) => i.status === 'Finalizado').length;
    const subtasksDone = userSubtasks.filter((i: any) => i.status === 'Finalizado').length;

    const userSP = userIssues.reduce((acc: number, i: any) => acc + (parseFloat(i.story_points) || 0), 0);
    const userDoneSP = userIssues.filter((i: any) => i.status === 'Finalizado')
      .reduce((acc: number, i: any) => acc + (parseFloat(i.story_points) || 0), 0);
    
    const debtCount = userIssues.filter((i: any) => i.carry_over === 1).length;

    return {
      name: `${member.first_name} ${member.last_name}`,
      tasks: userTasks.length,
      subtasks: userSubtasks.length,
      done: done,
      subtasksDone: subtasksDone,
      sp: userSP,
      doneSP: userDoneSP,
      debt: debtCount,
      time: userIssues.reduce((acc: number, i: any) => acc + (parseFloat(i.time_spent) || 0), 0).toFixed(1),
      progress: userTasks.length > 0 ? ((done / userTasks.length) * 100).toFixed(0) : 0,
      spProgress: userSP > 0 ? ((userDoneSP / userSP) * 100).toFixed(0) : 0
    };
  });

  const totalDebt = issues.filter((i: any) => i.carry_over === 1).length;

  // 6. Distribución de Prioridades
  const priorityDistribution = issues.reduce((acc: any, i: any) => {
    const priority = i.priority || 'Sin Prioridad';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  // 7. Capturar tareas "Huérfanas" (No asignadas a nadie en el equipo)
  const unassignedTasks = issues.filter((i: any) => {
      if (!i.assignee_id) return true;
      return !teamMembers.some((m: any) => 
          String(i.assignee_id) === String(m.id) || 
          (m.external_id && (
              String(i.assignee_id) === String(m.external_id) ||
              String(i.original_assignee_name).toLowerCase() === String(m.external_id).toLowerCase()
          ))
      );
  });

  // 8. Desglose por SPRINT y Análisis de Balance
  const sprintMap: Record<string, any> = {};
  
  issues.forEach((i: any) => {
      if (!i.sprint) return;
      const sprintList = i.sprint.split(',').map((s: string) => s.trim());
      
      sprintList.forEach((sName: string) => {
          if (!sprintMap[sName]) {
              sprintMap[sName] = {
                  name: sName,
                  totalTasks: 0,
                  totalSubtasks: 0,
                  members: teamMembers.map((m: any) => ({
                      id: m.id,
                      name: `${m.first_name} ${m.last_name}`,
                      tasks: 0,
                      subtasks: 0,
                      weightedScore: 0,
                      overloaded: false,
                      underloaded: false
                  }))
              };
          }
          
          const isSubtask = String(i.issue_type).toLowerCase().includes('sub');
          if (isSubtask) sprintMap[sName].totalSubtasks++;
          else sprintMap[sName].totalTasks++;
          
          // Asignar al miembro correspondiente
          const memberIndex = sprintMap[sName].members.findIndex((m: any) => {
              const isInternalIdMatch = String(i.assignee_id) === String(m.id);
              const member = teamMembers.find((tm: any) => tm.id === m.id);
              const isExternalIdMatch = member && member.external_id && (
                  String(i.assignee_id) === String(member.external_id) ||
                  String(i.original_assignee_name).toLowerCase() === String(member.external_id).toLowerCase()
              );
              return isInternalIdMatch || isExternalIdMatch;
          });
          
          if (memberIndex !== -1) {
              if (isSubtask) sprintMap[sName].members[memberIndex].subtasks++;
              else sprintMap[sName].members[memberIndex].tasks++;
              
              // Calcular peso por prioridad
              const p = String(i.priority).toLowerCase();
              let weight = 1;
              if (p.includes('high') || p.includes('alta')) weight = 5;
              else if (p.includes('medium') || p.includes('media')) weight = 3;
              
              sprintMap[sName].members[memberIndex].weightedScore += weight;
          }
      });
  });

  // Calcular balance por Sprint
  const sprints = Object.values(sprintMap).map((s: any) => {
      const activeMembers = s.members.filter((m: any) => m.weightedScore > 0);
      const totalScore = s.members.reduce((acc: number, m: any) => acc + m.weightedScore, 0);
      const averageScore = activeMembers.length > 0 ? totalScore / s.members.length : 0;
      
      s.members = s.members.map((m: any) => {
          if (averageScore > 0) {
              const ratio = m.weightedScore / averageScore;
              if (ratio > 1.3) m.overloaded = true;
              if (ratio < 0.7 && m.weightedScore > 0) m.underloaded = true;
              if (m.weightedScore === 0) m.empty = true;
          }
          return m;
      });
      
      return s;
  }).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

  // 9. Datos para BURNDOWN (Bimestre o Anual)
  let burndownData: any = null;
  
  // Obtener fechas para el rango del burndown
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (bimestre) {
      const [configRows]: any = await pool.execute('SELECT start_date, end_date FROM scrum_bimestres_config WHERE bimestre = ?', [bimestre]);
      if (configRows.length > 0) {
          startDate = new Date(configRows[0].start_date);
          endDate = new Date(configRows[0].end_date);
      }
  } else {
      // Para ANUAL, tomamos desde el inicio del B1 hasta el fin del B4
      const [allConfig]: any = await pool.execute('SELECT MIN(start_date) as start, MAX(end_date) as end FROM scrum_bimestres_config');
      if (allConfig[0].start && allConfig[0].end) {
          startDate = new Date(allConfig[0].start);
          endDate = new Date(allConfig[0].end);
      }
  }

  if (startDate && endDate) {
      const labels = [];
      const actual = [];
      const ideal = [];
      
      const totalCount = issues.length;
      const currentDate = new Date(startDate);
      
      // Generar puntos diarios (o semanales si el rango es muy largo, pero mantendremos diario para consistencia)
      // Si es anual, limitamos a un punto cada 3 días para no saturar el gráfico
      const step = bimestre ? 1 : 3;

      while (currentDate <= endDate) {
          const dStr = currentDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
          labels.push(dStr);
          
          const doneByThen = issues.filter((i: any) => 
              i.status === 'Finalizado' && 
              i.updated_at && 
              new Date(i.updated_at).setHours(0,0,0,0) <= currentDate.setHours(0,0,0,0)
          ).length;
          
          actual.push(totalCount - doneByThen);
          
          const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const currentDay = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
          const idealVal = totalCount - (totalCount * (currentDay / totalDays));
          ideal.push(idealVal < 0 ? 0 : parseFloat(idealVal.toFixed(2)));

          currentDate.setDate(currentDate.getDate() + step);
      }
      burndownData = { labels, actual, ideal };
  }

  return {
    totalTasks: tasks.length,
    finalizedTasks,
    totalSubtasks: subtasks.length,
    finalizedSubtasks,
    totalSP,
    finalizedSP,
    totalDebt,
    unassignedCount: unassignedTasks.length,
    efficiency: tasks.length > 0 ? ((finalizedTasks / tasks.length) * 100).toFixed(1) : 0,
    spEfficiency: totalSP > 0 ? ((finalizedSP / totalSP) * 100).toFixed(1) : 0,
    workload,
    milestones,
    unassignedHitoCount,
    priorityDistribution,
    sprints,
    burndownData,
    teamMembers,
    totalTimeSpent: issues.reduce((acc: number, i: any) => acc + (parseFloat(i.time_spent) || 0), 0).toFixed(2),
    totalVulnerabilities: issues.reduce((acc: number, i: any) => acc + (parseInt(i.vulnerability_count) || 0), 0)
  };
}
