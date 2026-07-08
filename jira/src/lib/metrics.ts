/**
 * Motor de Métricas y Calificación Dinámica (0 a 100 puntos)
 * Basado en las especificaciones de scrum-eval
 */

export interface JiraIssue {
  issueKey: string;
  summary: string;
  issueType: string;
  status: string;
  priority: string;
  assigneeId: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  dueDate: Date | null;
  originalEstimate: number;
  timeSpent: number;
  vulnerabilityCount: number;
  carryOverCount: number;
  reopenedCount: number;
  parentSummary?: string;
  isWatcher?: boolean;
}

export interface AttendanceRecord {
  userId: number;
  attended: boolean;
}

export interface Ceremony {
  id: number;
  type: string;
  attendance: AttendanceRecord[];
}

export interface CellData {
  cellId: number;
  members: {
    userId: number;
    role: 'DEV' | 'PO' | 'SM';
    coevalScore?: number; // 0-100
    teacherScore?: number; // 0-100
    fieldNotebookScore?: number; // 0-100
  }[];
  issues: JiraIssue[];
  ceremonies: Ceremony[];
  backlogTotal: number;
}

export function calculateGrades(data: CellData) {
  const { members, issues, ceremonies, backlogTotal } = data;
  const results: any = {};

  // --- A. Calificación de la Célula (30%) ---
  const finishedIssues = issues.filter(i => i.status === 'Finalizado');
  const finishedCount = finishedIssues.length;
  
  const targetFinished = backlogTotal * 0.2;
  let groupBaseScore = 100;
  if (finishedCount < targetFinished) {
    groupBaseScore = (finishedCount / targetFinished) * 100;
  }

  const tasksPerMember: { [key: number]: number } = {};
  members.forEach(m => (tasksPerMember[m.userId] = 0));
  finishedIssues.forEach(i => {
    if (tasksPerMember[i.assigneeId] !== undefined) {
      tasksPerMember[i.assigneeId]++;
    }
  });

  let balancePenalty = 0;
  const totalFinished = finishedIssues.length;
  if (totalFinished > 0) {
    for (const userId in tasksPerMember) {
      const share = tasksPerMember[userId] / totalFinished;
      if (share >= 0.35) {
        balancePenalty = 15;
        break;
      }
    }
  }

  const groupFinalScore = Math.max(0, groupBaseScore - balancePenalty);

  // --- B, C, D. Calificación Individual (70%) ---
  members.forEach(member => {
    let score = 0;
    const metricsDetalle: string[] = [];
    const memberIssues = issues.filter(i => i.assigneeId === member.userId);
    const memberFinished = memberIssues.filter(i => i.status === 'Finalizado');

    // 1. Jira / Desempeño Técnico (40% para DEV, 15% para PO/SM)
    if (member.role === 'DEV') {
      if (memberIssues.length > 0) {
        score = (memberFinished.length / memberIssues.length) * 100;
      }
      memberFinished.forEach(i => {
        if (i.priority === 'Alta' || i.priority === 'Crítica') score += 5;
        if (i.priority === 'Baja') score -= 2;
      });
      memberIssues.forEach(i => {
        if (i.status !== 'Finalizado' && i.dueDate && i.dueDate < new Date()) {
          score -= 10;
          metricsDetalle.push('Tarea pendiente expirada: -10');
        }
        if (i.vulnerabilityCount > 0) {
          score -= 8 * i.vulnerabilityCount;
          metricsDetalle.push(`Vulnerabilidad detectada: -${8 * i.vulnerabilityCount}`);
        }
        if (i.carryOverCount >= 2) {
          score -= 12;
          metricsDetalle.push('Carry-over consecutivo: -12');
        }
        if (i.reopenedCount > 0) {
          score -= 7 * i.reopenedCount;
          metricsDetalle.push('Tarea reabierta: -7');
        }
      });
    } else {
      score = 85; // PO/SM base
    }

    const jiraPart = Math.min(100, Math.max(0, score));

    // 2. Asistencia (Parte del 30% restante)
    let attendanceScore = 100;
    if (ceremonies.length > 0) {
      const absences = ceremonies.filter(c => 
        !c.attendance.find(a => a.userId === member.userId)?.attended
      ).length;
      attendanceScore = Math.max(0, 100 - (absences * 25));
      if (absences > 0) metricsDetalle.push(`Ausentismo: -${absences * 25}% en nota asistencia`);
    }

    // 3. Otros pilares del 30%
    const coevalScore = member.coevalScore || 0;
    const teacherScore = member.teacherScore || 0;
    const notebookScore = member.fieldNotebookScore || 0;

    results[member.userId] = {
      role: member.role,
      jiraBase: jiraPart,
      attendanceBase: attendanceScore,
      coevalBase: coevalScore,
      teacherBase: teacherScore,
      notebookBase: notebookScore,
      groupPart: groupFinalScore,
      details: metricsDetalle
    };
  });

  // Cálculo final ponderado al 100%
  members.forEach(member => {
    const res = results[member.userId];
    
    // Ponderación Sugerida:
    // 30% Grupal (Jira/Equipo)
    // 40% Individual Jira (Productividad/Calidad)
    // 30% Proceso (10% Asistencia, 10% Docente + Carpeta, 10% Coevaluación)
    
    const individualJiraWeight = (member.role === 'DEV' ? 0.4 : 0.15);
    const processPart = (res.attendanceBase * 0.1) + (res.teacherBase * 0.075) + (res.notebookBase * 0.05) + (res.coevalBase * 0.075);
    
    res.finalScore = (res.jiraBase * individualJiraWeight) + (res.groupPart * 0.3) + processPart;
  });

  return {
    groupScore: groupFinalScore,
    individualResults: results
  };
}
