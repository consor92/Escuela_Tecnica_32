const mysql = require('mysql2/promise');
(async () => {
  const pool = await mysql.createPool({ host: 'localhost', user: 'root', database: 'scrum_eval', waitForConnections: true, connectionLimit: 5 });
  const poolLegacy = await mysql.createPool({ host: 'localhost', user: 'root', database: 'epiz_27864677_encuentro', waitForConnections: true, connectionLimit: 5 });

  // Mapeos
  const [cursoMapRows] = await pool.execute('SELECT id, legacy_id FROM asis_cursos WHERE legacy_id IS NOT NULL');
  const cursoMap = new Map(cursoMapRows.map(c => [c.legacy_id, c.id]));
  const [userMapRows] = await pool.execute('SELECT id, legacy_id FROM users WHERE legacy_id IS NOT NULL');
  const userMap = new Map(userMapRows.map(u => [u.legacy_id, u.id]));
  console.log('User map:', userMap.size, 'Curso map:', cursoMap.size);

  // Importar registros asistencia
  const [legacyAsist] = await poolLegacy.execute('SELECT a.*, u.curso as curso_id_legacy FROM asistencia a JOIN usuarios u ON u.id = a.usuario');
  console.log('Registros legacy:', legacyAsist.length);

  let registrosImportados = 0, omitidos = 0, batch = 0;
  for (const la of legacyAsist) {
    const nuevoUserId = userMap.get(parseInt(la.usuario));
    const nuevoCursoId = cursoMap.get(la.curso_id_legacy);
    if (!nuevoUserId || !nuevoCursoId) { omitidos++; continue; }
    const [ac] = await pool.execute('SELECT id FROM asis_alumnos_curso WHERE user_id = ? AND curso_id = ?', [nuevoUserId, nuevoCursoId]);
    if (ac.length === 0) { omitidos++; continue; }
    const d = la.fecha;
    let fecha;
    if (d instanceof Date && !isNaN(d.getTime())) {
      fecha = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    } else if (typeof d === 'string' || typeof d === 'number') {
      fecha = String(d).slice(0, 10);
    } else continue;
    const [reg] = await pool.execute("SELECT id FROM asis_registros WHERE alumno_curso_id = ? AND fecha = ?", [ac[0].id, fecha]);
    if (reg.length > 0) { omitidos++; continue; }
    await pool.execute("INSERT INTO asis_registros (alumno_curso_id, fecha, estado, created_by) VALUES (?, ?, 'presente', ?)", [ac[0].id, fecha, nuevoUserId]);
    registrosImportados++;
    batch++;
    if (batch % 2000 === 0) console.log('  Procesados:', batch, '/ omitidos:', omitidos);
  }
  console.log('Registros importados:', registrosImportados, '| omitidos:', omitidos);
  console.log('IMPORTACION COMPLETADA');
  await pool.end();
  await poolLegacy.end();
})().catch(e => console.error('ERROR:', e.message));
