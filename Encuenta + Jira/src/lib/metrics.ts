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
  }[];
  issues: JiraIssue[];
  ceremonies: Ceremony[];
  backlogTotal: number; // Volumen total original del Product Backlog
}

export function calculateGrades(data: CellData) {
  const { members, issues, ceremonies, backlogTotal } = data;
  const results: any = {};

  // --- A. Calificación de la Célula (30%) ---
  const finishedIssues = issues.filter(i => i.status === 'Finalizado');
  const finishedCount = finishedIssues.length;
  
  // 1. Meta Bimestral Obligatoria (20% del backlog)
  const targetFinished = backlogTotal * 0.2;
  let groupBaseScore = 100;
  if (finishedCount < targetFinished) {
    groupBaseScore = (finishedCount / targetFinished) * 100;
  }

  // 2. Índice de Balanceo (Anti-Héroe) - Coeficiente de Gini simplificado o dispersión
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
        balancePenalty = 15; // Alerta de Desbalanceo
        break;
      }
    }
  }

  const groupFinalScore = Math.max(0, groupBaseScore - balancePenalty);

  // --- B, C, D. Calificación Individual ---
  members.forEach(member => {
    let score = 0;
    const metricsDetalle: string[] = [];
    const memberIssues = issues.filter(i => i.assigneeId === member.userId);
    const memberFinished = memberIssues.filter(i => i.status === 'Finalizado');

    if (member.role === 'DEV') {
      // Nota base por tareas finalizadas
      if (memberIssues.length > 0) {
        score = (memberFinished.length / memberIssues.length) * 100;
      }

      // Multiplicador por Prioridad
      memberFinished.forEach(i => {
        if (i.priority === 'Alta' || i.priority === 'Crítica') score += 5; // Simulación de multiplicador
        if (i.priority === 'Baja') score -= 2;
      });

      // Castigos
      memberIssues.forEach(i => {
        // Tareas Pendientes expiradas
        if (i.status !== 'Finalizado' && i.dueDate && i.dueDate < new Date()) {
          score -= 10;
          metricsDetalle.push('Tarea pendiente expirada: -10');
        }
        // Deuda Técnica
        if (i.vulnerabilityCount > 0) {
          score -= 8 * i.vulnerabilityCount;
          metricsDetalle.push(`Vulnerabilidad detectada: -${8 * i.vulnerabilityCount}`);
        }
        // Carry-over
        if (i.carryOverCount >= 2) {
          score -= 12;
          metricsDetalle.push('Carry-over consecutivo: -12');
        }
        // Reopened
        if (i.reopenedCount > 0) {
          score -= 7 * i.reopenedCount;
          metricsDetalle.push('Tarea reabierta: -7');
        }
        // Trabajo de Pánico (80% en últimas 24h) - Simplificado
        if (i.resolvedAt) {
          // Lógica de fecha real aquí
        }
      });

      // Ausentismo
      const absences = ceremonies.filter(c => 
        !c.attendance.find(a => a.userId === member.userId)?.attended
      ).length;
      score -= absences * 10;
      if (absences > 0) metricsDetalle.push(`Ausentismo: -${absences * 10}`);

    } else if (member.role === 'PO') {
      // Lógica PO: Salud del Backlog y Épicas
      score = 85; // Simulación base
      // ... cálculos reales basados en campos Description, acceptance criteria, etc.
    } else if (member.role === 'SM') {
      // Lógica SM: Velocidad de desbloqueo, Predictibilidad
      score = 90; // Simulación base
      // ... cálculos reales
    }

    results[member.userId] = {
      role: member.role,
      individualBase: Math.min(100, Math.max(0, score)),
      groupPart: groupFinalScore * 0.3,
      finalScore: 0, // Se calculará abajo
      details: metricsDetalle
    };
  });

  // Cálculo final ponderado
  members.forEach(member => {
    const res = results[member.userId];
    let weightIndividual = 0.4;
    if (member.role === 'PO' || member.role === 'SM') weightIndividual = 0.15;
    
    res.finalScore = (res.individualBase * weightIndividual) + (groupFinalScore * 0.3);
    // Nota: El 30% es grupo, el resto es individual/rol.
    // Para DEV: 40% individual + 30% grupo + 30% (otros factores o base)
    // Ajustamos a la especificación: 30% Grupo, 40% DEV, 15% PO, 15% SM.
  });

  return {
    groupScore: groupFinalScore,
    individualResults: results
  };
}
