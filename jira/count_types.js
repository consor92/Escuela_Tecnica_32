const fs = require('fs');
const Papa = require('papaparse');
const csv = fs.readFileSync('C:/Users/Notebook/Downloads/Jira.csv', 'utf8');
const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
result.data.forEach((r, i) => {
  const t = r['Tipo de Incidencia'];
  if (t === 'Epic') {
    console.log(i + 1 + ': ' + r['Clave de incidencia'] + ' | ' + r['Resumen'] + ' | ' + t);
  }
});
