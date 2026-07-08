const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'scrum_eval', multipleStatements: true });
  await conn.query('ALTER TABLE asis_docentes_curso DROP FOREIGN KEY asis_docentes_curso_ibfk_1');
  await conn.query('ALTER TABLE asis_docentes_curso DROP FOREIGN KEY asis_docentes_curso_ibfk_2');
  await conn.query('ALTER TABLE asis_docentes_curso DROP INDEX unique_preceptor_curso');
  await conn.query('ALTER TABLE asis_docentes_curso ADD UNIQUE KEY unique_user_curso (curso_id, user_id)');
  await conn.query('ALTER TABLE asis_docentes_curso ADD CONSTRAINT asis_docentes_curso_ibfk_1 FOREIGN KEY (curso_id) REFERENCES asis_cursos(id) ON DELETE CASCADE');
  await conn.query('ALTER TABLE asis_docentes_curso ADD CONSTRAINT asis_docentes_curso_ibfk_2 FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
  console.log('OK: constraint actualizada');
  const [indexes] = await conn.query('SHOW INDEX FROM asis_docentes_curso');
  indexes.forEach(i => console.log(' ', i.Key_name, i.Column_name, i.Non_unique === 0 ? 'UNIQUE' : ''));
  await conn.end();
})().catch(e => console.error('ERROR:', e.message));
