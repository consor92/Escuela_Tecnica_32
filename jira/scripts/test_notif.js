const mysql = require('mysql2/promise');
(async () => {
  const pool = await mysql.createPool({ host: 'localhost', user: 'root', database: 'scrum_eval', waitForConnections: true, connectionLimit: 5 });
  try {
    const [rows] = await pool.execute(
      'SELECT id, titulo, mensaje, tipo, leida, fecha FROM asis_notificaciones WHERE user_id = ? AND leida = 0 ORDER BY fecha DESC',
      [1]  // user id 1 for testing
    );
    console.log('Rows:', rows.length);
    console.log('Sample:', JSON.stringify(rows.slice(0, 2)));
  } catch (e) {
    console.error('Error:', e.message);
  }
  await pool.end();
})().catch(e => console.error('Fatal:', e.message));
