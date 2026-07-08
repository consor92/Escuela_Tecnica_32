const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'scrum_eval' });
  const [cols] = await conn.query('SHOW CREATE TABLE asis_docentes_curso');
  console.log('CREATE TABLE:', cols[0]['Create Table']);
  const [indexes] = await conn.query('SHOW INDEX FROM asis_docentes_curso');
  console.log('\nIndexes:');
  indexes.forEach(i => console.log(`  ${i.Column_name} (${i.Index_type}) ${i.Non_unique ? 'non-unique' : 'UNIQUE'} key_name=${i.Key_name}`));
  const [data] = await conn.query('SELECT * FROM asis_docentes_curso WHERE curso_id = 25');
  console.log('\nData for curso_id=25:', JSON.stringify(data));
  await conn.end();
})().catch(e => console.error(e.message));
