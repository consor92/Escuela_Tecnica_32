const mysql = require('mysql2/promise');
(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'scrum_eval', waitForConnections: true });
  // Fix issue_type for CSV-Epics that got wrong types in DB
  const fixes = [
    ['SCRUM-63', 'Epic'],
    ['SCRUM-69', 'Epic'],
    ['SCRUM-72', 'Epic'],
    ['SCRUM-126', 'Epic'],
    ['SCRUM-142', 'Epic'],
    ['SCRUM-204', 'Epic'],
    ['SCRUM-212', 'Epic'],
    ['SCRUM-229', 'Epic'],
  ];
  for (const [key, type] of fixes) {
    const [r] = await pool.execute('UPDATE jira_issues SET issue_type = ? WHERE issue_key = ? AND cell_id = 6', [type, key]);
    console.log(key + ' -> ' + type + ' (affected: ' + r.affectedRows + ')');
  }
  // Verify
  const [rows] = await pool.execute('SELECT issue_type, COUNT(*) as c FROM jira_issues WHERE cell_id=6 GROUP BY issue_type');
  console.log('New counts:', JSON.stringify(rows));
  await pool.end();
})();
