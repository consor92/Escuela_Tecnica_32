const mysql = require('mysql2/promise');
const fs = require('fs');
const Papa = require('papaparse');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'scrum_eval', waitForConnections: true });
  const [dbRows] = await pool.execute('SELECT issue_key, issue_type FROM jira_issues WHERE cell_id=6');
  const db = {};
  dbRows.forEach(r => { db[r.issue_key] = r.issue_type; });

  const csv = fs.readFileSync('C:/Users/Notebook/Downloads/Jira.csv', 'utf8');
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
  
  console.log('All mismatches (CSV type vs DB type):');
  result.data.forEach(r => {
    const key = r['Clave de incidencia'];
    const csvType = r['Tipo de Incidencia'];
    const dbType = db[key];
    if (csvType !== dbType) {
      console.log(key + ' | CSV: ' + csvType + ' | DB: ' + dbType);
    }
  });
  await pool.end();
})();
