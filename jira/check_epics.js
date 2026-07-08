const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'scrum_eval', waitForConnections: true });
  // Get all issue keys with their type for cell_id=6
  const [all] = await pool.execute('SELECT issue_key, issue_type FROM jira_issues WHERE cell_id=6 ORDER BY issue_key');
  // Count by type
  const types = {};
  all.forEach(r => { types[r.issue_type] = (types[r.issue_type] || 0) + 1; });
  console.log('DB counts:', JSON.stringify(types));
  console.log('Total:', all.length);

  // Now compare with CSV: get Epic keys from CSV
  const fs = require('fs');
  const Papa = require('papaparse');
  const csv = fs.readFileSync('C:/Users/Notebook/Downloads/Jira.csv', 'utf8');
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const csvEpics = result.data.filter(r => r['Tipo de Incidencia'] === 'Epic').map(r => r['Clave de incidencia']);
  console.log('CSV Epic count:', csvEpics.length);
  console.log('CSV Epic keys:', csvEpics.join(', '));

  // Find CSV epics that are NOT Epic in DB
  const dbMap = {};
  all.forEach(r => { dbMap[r.issue_key] = r.issue_type; });
  const mismatches = csvEpics.filter(k => dbMap[k] && dbMap[k] !== 'Epic');
  console.log('CSV Epic but DB says:');
  mismatches.forEach(k => console.log('  ' + k + ' -> ' + dbMap[k]));

  await pool.end();
})();
