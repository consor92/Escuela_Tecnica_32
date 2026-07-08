const mysql = require('mysql2/promise');
const crypto = require('crypto');
(async () => {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'scrum_eval' });

  const pass = '123456';
  const passMD5 = crypto.createHash('md5').update(pass).digest('hex');
  console.log('Password MD5:', passMD5);

  // 1. Crear docente nahuel.acosta@bue.edu.ar
  const [exist1] = await conn.query("SELECT id FROM users WHERE email = 'nahuel.acosta@bue.edu.ar'");
  if (exist1.length === 0) {
    await conn.query(
      "INSERT INTO users (username, email, password_md5, role_id, first_name, last_name) VALUES (?, ?, ?, 3, ?, ?)",
      ['nahuel.acosta', 'nahuel.acosta@bue.edu.ar', passMD5, 'Nahuel', 'Acosta']
    );
    console.log('CREADO: Docente nahuel.acosta@bue.edu.ar');
  } else {
    console.log('YA EXISTE: nahuel.acosta@bue.edu.ar id=' + exist1[0].id);
  }

  // 2. Cambiar Guillermo Puma (id=121) de role_id=3 a role_id=5 (Referente)
  await conn.query("UPDATE users SET role_id = 5, password_md5 = ? WHERE id = 121", [passMD5]);
  console.log('ACTUALIZADO: Guillermo Puma a Referente (role_id=5), password reset');

  // 3. Crear preceptor claudia.tunila
  const [exist3] = await conn.query("SELECT id FROM users WHERE email LIKE '%claudia.tunila%' OR username LIKE '%claudia%'");
  if (exist3.length === 0) {
    await conn.query(
      "INSERT INTO users (username, email, password_md5, role_id, first_name, last_name) VALUES (?, ?, ?, 4, ?, ?)",
      ['claudia.tunila', 'claudia.tunila@bue.edu.ar', passMD5, 'Claudia', 'Tunila']
    );
    console.log('CREADO: Preceptor claudia.tunila');
  } else {
    console.log('YA EXISTE: claudia id=' + exist3[0].id);
  }

  // 4. Verificar Gonzalo Consorti
  const [gonzalo] = await conn.query("SELECT id, first_name, last_name, role_id, email FROM users WHERE id = 64");
  console.log('\n=== GONZALO CONSORTI ===');
  console.log('ID:', gonzalo[0].id, '| Nombre:', gonzalo[0].first_name, gonzalo[0].last_name, '| Role:', gonzalo[0].role_id, '(1=Admin)', '| Email:', gonzalo[0].email);

  // 5. Verificar resultado final
  const [staff] = await conn.query('SELECT id, username, email, first_name, last_name, role_id FROM users WHERE role_id IN (1,3,4,5) ORDER BY role_id, last_name');
  console.log('\n=== Personal del sistema actualizado ===');
  const roles = {1: 'Admin', 3: 'Docente', 4: 'Preceptor', 5: 'Referente'};
  staff.forEach(u => console.log(`  id=${u.id} ${u.first_name} ${u.last_name} (${u.email}) -> ${roles[u.role_id] || u.role_id}`));

  await conn.end();
})().catch(e => console.error('ERROR:', e.message));
