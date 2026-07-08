const mysql = require('mysql2/promise');
const fs = require('fs');
const Papa = require('papaparse');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'scrum_eval', waitForConnections: true });
  const [dbEpics] = await pool.execute('SELECT issue_key, issue_type FROM jira_issues WHERE cell_id=6 AND issue_type = "Epic" ORDER BY issue_key');
  const dbEpicKeys = dbEpics.map(r => r.issue_key);
  console.log('DB Epic keys (' + dbEpicKeys.length + '):', dbEpicKeys.join(', '));

  const csv = fs.readFileSync('C:/Users/Notebook/Downloads/Jira.csv', 'utf8');
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const csvEpics = result.data.filter(r => r['Tipo de Incidencia'] === 'Epic').map(r => r['Clave de incidencia']);
  console.log('CSV Epic keys (' + csvEpics.length + '):', csvEpics.join(', '));

  // CSV Epics that are NOT Epic in DB
  const dbSet = new Set(dbEpicKeys);
  const csvSet = new Set(csvEpics);
  const needFix = csvEpics.filter(k => !dbSet.has(k));
  console.log('CSV Epics that need fix (' + needFix.length + '):', needFix.join(', '));
  const extraInDB = dbEpicKeys.filter(k => !csvSet.has(k));
  console.log('Extra Epics in DB (not in CSV):', extraInDB.join(', '));

  await pool.end();
})();
