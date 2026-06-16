import Papa from 'papaparse';

export interface JiraCSVRow {
  'Resumen': string;
  'Clave de incidencia': string;
  'ID de la incidencia': string;
  'Tipo de Incidencia': string;
  'Estado': string;
  'Prioridad': string;
  'Persona asignada': string;
  'ID de la persona asignada'?: string;
  'ID asignado'?: string;
  'Creada': string;
  'Actualizada': string;
  'Resuelta': string;
  'Fecha de vencimiento': string;
  'Estimación original': string;
  'Tiempo Trabajado': string;
  'Campo personalizado (Vulnerability)'?: string;
  [key: string]: any;
}

function parseSpanishDate(dateStr: string | null): Date | null {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return null;
  
  const months: { [key: string]: number } = {
    'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
  };

  const parts = dateStr.toLowerCase().split(/[\s/:]+/);
  if (parts.length < 3) return null;

  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  let year = parseInt(parts[2]);
  if (year < 100) year += 2026; 

  let hour = parseInt(parts[3] || '0');
  const minute = parseInt(parts[4] || '0');
  const ampm = parts[5];

  if (ampm === 'pm' && hour < 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;

  if (isNaN(day) || month === undefined || isNaN(year)) return null;

  return new Date(year, month, day, hour, minute);
}

export function parseJiraCSV(csvContent: string): any[] {
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return results.data.map((row: any) => {
    const rawAssigneeId = row['ID de la persona asignada'] || row['ID asignado'] || null;
    let normalizedAssigneeId = null;
    
    if (rawAssigneeId) {
        const parts = rawAssigneeId.toString().split(':');
        normalizedAssigneeId = parseInt(parts[0]);
    }
    
    const vulnerability = row['Campo personalizado (Vulnerability)'] || 0;

    return {
      issueKey: row['Clave de incidencia'],
      summary: row['Resumen'],
      type: row['Tipo de Incidencia'],
      status: row['Estado'],
      priority: row['Prioridad'],
      assigneeId: normalizedAssigneeId,
      createdAt: parseSpanishDate(row['Creada']),
      updatedAt: parseSpanishDate(row['Actualizada']),
      resolvedAt: parseSpanishDate(row['Resuelta']),
      dueDate: parseSpanishDate(row['Fecha de vencimiento']),
      originalEstimate: parseFloat(row['Estimación original']) || 0,
      timeSpent: parseFloat(row['Tiempo Trabajado']) || 0,
      vulnerability: vulnerability ? 1 : 0,
      parentSummary: row['Parent summary'],
    };
  });
}
