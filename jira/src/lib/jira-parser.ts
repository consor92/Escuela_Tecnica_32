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

function parseSpanishDate(dateStr: any): Date | null {
  if (!dateStr) return null;
  const str = String(dateStr).trim();
  if (str === '') return null;
  
  const months: { [key: string]: number } = {
    'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
  };

  const parts = str.toLowerCase().split(/[\s/:]+/);
  if (parts.length < 3) return null;

  const day = parseInt(parts[0]);
  let month = months[parts[1]];
  
  // Soporte para meses numéricos
  if (month === undefined) {
      const m = parseInt(parts[1]);
      if (!isNaN(m)) month = m - 1;
  }

  let year = parseInt(parts[2]);
  if (year < 100) year += 2000; 

  let hour = parseInt(parts[3] || '0');
  const minute = parseInt(parts[4] || '0');
  const ampm = parts[5];

  if (ampm === 'pm' && hour < 12) hour += 12;
  if (ampm === 'am' && hour === 12) hour = 0;

  if (isNaN(day) || month === undefined || isNaN(year)) return null;

  const date = new Date(year, month, day, hour, minute);
  return isNaN(date.getTime()) ? null : date;
}

export function parseJiraCSV(csvContent: string): any[] {
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return results.data.map((row: any) => {
    // 1. Manejo de múltiples columnas "Sprint"
    // PapaParse antepone un índice si hay duplicados, o los une.
    // Buscamos todas las propiedades que contengan "Sprint"
    const sprintValues: string[] = [];
    Object.keys(row).forEach(key => {
        if (key.includes('Sprint') && row[key]) {
            sprintValues.push(String(row[key]));
        }
    });
    const sprintRaw = sprintValues.join(', ');
    const isCarryOver = sprintValues.length > 1;

    const rawAssigneeId = row['ID de la persona asignada'] || row['ID asignado'] || null;
    let normalizedAssigneeId: string | null = null;
    
    if (rawAssigneeId) {
        const parts = rawAssigneeId.toString().split(':');
        normalizedAssigneeId = parts[0];
    }
    
    // Vulnerabilidad puede venir en varias columnas según la cabecera
    const vulnerability = row['Campo personalizado (Vulnerability)'] || row['Vulnerability'] || 0;
    
    // Story points
    const storyPoints = parseFloat(
        row['Campo personalizado (Story point estimate)'] || 
        row['Estimación de puntos de historia'] || 
        row['Puntos de historia'] || 
        0
    );

    return {
      issueKey: row['Clave de incidencia'] || row['Key'],
      parentKey: row['Clave principal'] || row['Principal'] || row['Parent'] || row['Parent summary'] || row['Resumen principal'] || null,
      epic: row['Vínculo de las épicas'] || row['Epic Link'] || row['Épica'] || row['Epic Name'] || null,
      summary: row['Resumen'] || row['Summary'],
      type: row['Tipo de Incidencia'] || row['Issue Type'],
      status: row['Estado'] || row['Status'],
      priority: row['Prioridad'] || row['Priority'],
      assigneeId: normalizedAssigneeId,
      assigneeName: row['Persona asignada'] || row['Assignee'],
      createdAt: parseSpanishDate(row['Creada'] || row['Creado'] || row['Created']),
      updatedAt: parseSpanishDate(row['Actualizada'] || row['Actualizado'] || row['Updated']),
      resolvedAt: parseSpanishDate(row['Resuelta'] || row['Resuelto'] || row['Resolved']),
      dueDate: parseSpanishDate(row['Fecha de vencimiento'] || row['Due Date']),
      originalEstimate: parseFloat(row['Estimación original'] || row['Original Estimate']) || 0,
      timeSpent: parseFloat(row['Tiempo Trabajado'] || row['Time Spent'] || row['Σ Tiempo empleado']) || 0,
      vulnerability: vulnerability ? 1 : 0,
      storyPoints: storyPoints,
      sprint: sprintRaw,
      isCarryOver: isCarryOver ? 1 : 0
    };
  });
}
