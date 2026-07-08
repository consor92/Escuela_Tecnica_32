const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'scrum_eval' });
  const [tables] = await conn.query("SHOW TABLES LIKE 'asis_notificaciones'");
  console.log('asis_notificaciones existe:', tables.length > 0);
  if (tables.length > 0) {
    const [cols] = await conn.query('DESCRIBE asis_notificaciones');
    cols.forEach(c => console.log(' ', c.Field, c.Type, c.Null));
  } else {
    // Check all asis_ tables
    const [all] = await conn.query("SHOW TABLES LIKE 'asis_%'");
    console.log('Tablas asis_ existentes:', all.map(r => Object.values(r)[0]).join(', '));
  }
  await conn.end();
})().catch(e => console.error(e.message));
