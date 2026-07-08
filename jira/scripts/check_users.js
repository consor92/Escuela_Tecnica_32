const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'scrum_eval' });
  
  // Check specific users
  const emails = ['nahuel.acosta@bue.edu.ar', 'guillermo.puma', 'claudia.tunila'];
  const names = ['consor92', 'consorti', 'gonzalo'];
  
  for (const e of emails) {
    const [users] = await conn.query('SELECT id, username, email, first_name, last_name, role_id, dni, telefono FROM users WHERE email LIKE ? OR username LIKE ?', [`%${e}%`, `%${e}%`]);
    if (users.length > 0) {
      users.forEach(u => console.log(`Email match "${e}": id=${u.id} username=${u.username} email=${u.email} name=${u.first_name} ${u.last_name} role=${u.role_id}`));
    } else {
      console.log(`No match for "${e}"`);
    }
  }

  // Find Gonzalo Consorti
  for (const n of names) {
    const [users] = await conn.query('SELECT id, username, email, first_name, last_name, role_id FROM users WHERE username LIKE ? OR first_name LIKE ? OR last_name LIKE ?', [`%${n}%`, `%${n}%`, `%${n}%`]);
    if (users.length > 0) {
      users.forEach(u => console.log(`Name match "${n}": id=${u.id} username=${u.username} email=${u.email} name=${u.first_name} ${u.last_name} role=${u.role_id}`));
    }
  }

  // List all users with role_id in (1,3,4,5) -- admins, teachers, preceptors, referentes
  const [staff] = await conn.query('SELECT id, username, email, first_name, last_name, role_id FROM users WHERE role_id IN (1,3,4,5) ORDER BY role_id, last_name');
  console.log('\n=== Personal del sistema (role_id=1=Admin, 3=Docente, 4=Preceptor, 5=Referente) ===');
  staff.forEach(u => console.log(`id=${u.id} ${u.first_name} ${u.last_name} (${u.email}) role=${u.role_id} username=${u.username}`));

  await conn.end();
})().catch(e => console.error(e.message));
