const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Función auxiliar para escapar comillas simples y evitar que rompan el SQL (ej: D'Angelo)
const escapeSql = (str) => {
  if (!str) return '';
  return String(str).replace(/'/g, "''");
};

async function generateSqlFile() {
  // 1. Configuramos el archivo de salida
  const outputFileName = 'import_users.sql';
  const outputPath = path.join(__dirname, outputFileName);
  const sqlFileStream = fs.createWriteStream(outputPath, { encoding: 'utf-8' });

  sqlFileStream.write('-- Script de inserción de usuarios generado automáticamente\n\n');

  // 2. Leemos el CSV
  const csvFile = fs.readFileSync(path.join(__dirname, 'users.csv'), 'utf-8');
  const records = parse(csvFile, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ';'
  });

  console.log(`Leídos ${records.length} registros del CSV. Generando SQL...`);

  // 3. Procesamos los datos y escribimos en el archivo
  for (const record of records) {
    const roleId = record.rol == '1' ? 1 : 2;
    const username = record.usuario || record.email.split('@')[0];

    // Limpiamos los textos (String) con comillas simples escapadas
    const safeUsername = escapeSql(username);
    const safeEmail = escapeSql(record.email);
    const safePassword = escapeSql(record.password);
    const safeFirstName = escapeSql(record.nombre);
    const safeLastName = escapeSql(record.apellido);

    // Creamos la sentencia SQL final (los números van sin comillas, los textos con '')
    const sqlInsert = `INSERT IGNORE INTO users (external_id, username, email, password_md5, role_id, first_name, last_name) VALUES (${record.id}, '${safeUsername}', '${safeEmail}', '${safePassword}', ${roleId}, '${safeFirstName}', '${safeLastName}');\n`;

    // Escribimos la línea en el archivo .sql
    sqlFileStream.write(sqlInsert);
  }

  // 4. Cerramos el flujo del archivo
  sqlFileStream.end();

  // Esperamos la confirmación de que se terminó de guardar
  sqlFileStream.on('finish', () => {
    console.log(`¡Proceso finalizado! Archivo guardado en: ${outputPath}`);
  });

  sqlFileStream.on('error', (err) => {
    console.error('Error al guardar el archivo SQL:', err);
  });
}

generateSqlFile().catch(console.error);