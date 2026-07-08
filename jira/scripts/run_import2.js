const mysql = require('mysql2/promise');
(async () => {
  const pool = await mysql.createPool({ host: 'localhost', user: 'root', database: 'scrum_eval', waitForConnections: true, connectionLimit: 5 });
  const poolLegacy = await mysql.createPool({ host: 'localhost', user: 'root', database: 'epiz_27864677_encuentro', waitForConnections: true, connectionLimit: 5 });

  let cursosImportados = 0, inscripciones = 0, registrosImportados = 0;
  const [legacyCursos] = await poolLegacy.execute('SELECT * FROM curso ORDER BY anio, nombre_curso');
  console.log('Cursos legacy:', legacyCursos.length);

  // 1. Asegurar especialidad
  const [esp] = await pool.execute("SELECT id FROM asis_especialidades WHERE nombre = 'Prácticas Profesionalizantes' AND activo = 1");
  let espId;
  if (esp.length > 0) { espId = esp[0].id; }
  else { const [r] = await pool.execute("INSERT INTO asis_especialidades (nombre, activo) VALUES ('Prácticas Profesionalizantes', 1)"); espId = r.insertId; }

  // 2. Importar cursos
  for (const lc of legacyCursos) {
    const [exist] = await pool.execute('SELECT id FROM asis_cursos WHERE legacy_id = ?', [lc.id]);
    if (exist.length > 0) continue;
    const nombre = (lc.nombre_curso || '').replace(/^PP/i, '').trim() || 'Curso ' + lc.id;
    await pool.execute('INSERT INTO asis_cursos (nombre, descripcion, anio, especialidad_id, turno, legacy_id, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [nombre, lc.descripcion_curso || '', lc.anio || 2020, espId, (lc.turno || 'mañana').toLowerCase(), lc.id]);
    cursosImportados++;
  }
  console.log('Cursos importados:', cursosImportados);

  // 3. Mapeos
  const [cursoMapRows] = await pool.execute('SELECT id, legacy_id FROM asis_cursos WHERE legacy_id IS NOT NULL');
  const cursoMap = new Map(cursoMapRows.map(c => [c.legacy_id, c.id]));
  const [userMapRows] = await pool.execute('SELECT id, legacy_id FROM users WHERE legacy_id IS NOT NULL');
  const userMap = new Map(userMapRows.map(u => [u.legacy_id, u.id]));
  console.log('User map:', userMap.size, 'Curso map:', cursoMap.size);

  // 4. Inscribir alumnos
  const [legacyUsers] = await poolLegacy.execute('SELECT * FROM usuarios');
  for (const lu of legacyUsers) {
    const nuevoCursoId = cursoMap.get(lu.curso);
    const nuevoUserId = userMap.get(lu.id);
    if (!nuevoCursoId || !nuevoUserId) continue;
    const [ins] = await pool.execute('SELECT id FROM asis_alumnos_curso WHERE user_id = ? AND curso_id = ?', [nuevoUserId, nuevoCursoId]);
    if (ins.length > 0) continue;
    await pool.execute('INSERT INTO asis_alumnos_curso (curso_id, user_id, fecha_inscripcion, activo) VALUES (?, ?, CURDATE(), 1)', [nuevoCursoId, nuevoUserId]);
    inscripciones++;
  }
  console.log('Inscripciones creadas:', inscripciones);

  // 5. Importar registros asistencia
  const [legacyAsist] = await poolLegacy.execute('SELECT a.*, u.curso as curso_id_legacy FROM asistencia a JOIN usuarios u ON u.id = a.usuario');
  console.log('Registros legacy:', legacyAsist.length);
  let batch = 0;
  for (const la of legacyAsist) {
    const nuevoUserId = userMap.get(parseInt(la.usuario));
    const nuevoCursoId = cursoMap.get(la.curso_id_legacy);
    if (!nuevoUserId || !nuevoCursoId) continue;
    const [ac] = await pool.execute('SELECT id FROM asis_alumnos_curso WHERE user_id = ? AND curso_id = ?', [nuevoUserId, nuevoCursoId]);
    if (ac.length === 0) continue;
    const fecha = la.fecha instanceof Date ? la.fecha.toISOString().split('T')[0] : String(la.fecha);
    const [reg] = await pool.execute("SELECT id FROM asis_registros WHERE alumno_curso_id = ? AND fecha = ?", [ac[0].id, fecha]);
    if (reg.length > 0) continue;
    await pool.execute("INSERT INTO asis_registros (alumno_curso_id, fecha, estado) VALUES (?, ?, 'presente')", [ac[0].id, fecha]);
    registrosImportados++;
    batch++;
    if (batch % 1000 === 0) console.log('  Procesados', batch, 'registros...');
  }
  console.log('Registros importados:', registrosImportados);
  console.log('IMPORTACION COMPLETADA');
  await pool.end();
  await poolLegacy.end();
})().catch(e => console.error('ERROR:', e.message));
