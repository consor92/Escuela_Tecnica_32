const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'epiz_27864677_encuentro', dateStrings: true });
  const [bad] = await conn.query("SELECT COUNT(*) as c FROM asistencia WHERE fecha = '0000-00-00' OR fecha IS NULL");
  console.log('Fechas invalidas:', bad[0].c);
  const [sample] = await conn.query('SELECT id, usuario, fecha FROM asistencia LIMIT 5');
  console.log('Sample:', JSON.stringify(sample));
  await conn.end();
})().catch(e => console.error(e.message));
