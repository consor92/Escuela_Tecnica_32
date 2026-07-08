const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const mysql = require('mysql2/promise');

async function importUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin123',
    database: 'scrum_eval',
  });

  console.log('Conectado a la base de datos...');

  const csvFile = fs.readFileSync(path.join(__dirname, 'users.csv'), 'utf-8');
  const records = parse(csvFile, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ';'
  });

  console.log(`Leídos ${records.length} registros del CSV.`);

  for (const record of records) {
    const roleId = record.rol == '1' ? 1 : 2; // Si rol es 1 en CSV, es Docente (1), sino Alumno (2)
    // En el CSV original, el campo 'usuario' parece estar vacío en las primeras líneas, 
    // usaremos el email como username si está vacío.
    const username = record.usuario || record.email.split('@')[0];

    try {
      await connection.execute(
        `INSERT IGNORE INTO users (
          external_id, username, email, password_md5, role_id, first_name, last_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          record.id,
          username,
          record.email,
          record.password, // Ya está en MD5 en el CSV
          roleId,
          record.nombre,
          record.apellido
        ]
      );
    } catch (err) {
      console.error(`Error insertando usuario ${record.email}:`, err.message);
    }
  }

  console.log('Importación finalizada.');
  await connection.end();
}

importUsers().catch(console.error);
