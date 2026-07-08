const mysql = require('mysql2/promise');
(async () => {
  const pool = await mysql.createPool({ host: 'localhost', user: 'root', database: 'scrum_eval', waitForConnections: true, connectionLimit: 5 });
  const poolLegacy = await mysql.createPool({ host: 'localhost', user: 'root', database: 'epiz_27864677_encuentro', waitForConnections: true, connectionLimit: 5 });

  let usuariosImportados = 0;
  let cursosImportados = 0;
  let registrosImportados = 0;

  // 1. Importar usuarios legacy
  const [legacyUsers] = await poolLegacy.execute('SELECT * FROM usuarios');
  console.log('Legacy users found: ' + legacyUsers.length);

  let updatedCount = 0;
  for (const lu of legacyUsers) {
    const [exist] = await pool.execute('SELECT id FROM users WHERE legacy_id = ? OR email = ?', [lu.id, lu.email]);
    if (exist.length > 0) {
      const res = await pool.execute(
        'UPDATE users SET legacy_id = ?, dni = ?, telefono = ?, telefono_alternativo = ?, fecha_nacimiento = ?, direccion = ?, cuil = ?, nacionalidad = ? WHERE id = ?',
        [lu.id, lu.dni || null, lu.telefono || null, lu.telefono_alternativo || null, lu.nacimiento || null, lu.direccion || null, lu.cuil || null, lu.nacionalidad || null, exist[0].id]
      );
      updatedCount++;
      continue;
    }
    let roleId = 2;
    if (lu.rol === 1) roleId = 3;
    else if (lu.rol === 2) roleId = 5;
    await pool.execute(
      'INSERT INTO users (username, email, password_md5, role_id, first_name, last_name, legacy_id, dni, telefono, telefono_alternativo, fecha_nacimiento, direccion, cuil, nacionalidad) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [lu.usuario, lu.email, lu.pwd, roleId, lu.nombre, lu.apellido, lu.id, lu.dni || null, lu.telefono || null, lu.telefono_alternativo || null, lu.nacimiento || null, lu.direccion || null, lu.cuil || null, lu.nacionalidad || null]
    );
    usuariosImportados++;
  }
  console.log('Nuevos usuarios insertados: ' + usuariosImportados);
  console.log('Usuarios existentes actualizados: ' + updatedCount);

  // Verificar
  const [verif] = await pool.execute('SELECT COUNT(*) as c FROM users WHERE legacy_id IS NOT NULL');
  console.log('Users con legacy_id: ' + verif[0].c);
  const [verif2] = await pool.execute("SELECT COUNT(*) as c FROM users WHERE dni IS NOT NULL AND dni != ''");
  console.log('Users con dni: ' + verif2[0].c);
  const [verif3] = await pool.execute('SELECT id, legacy_id, dni, telefono, fecha_nacimiento, cuil FROM users WHERE legacy_id IS NOT NULL LIMIT 5');
  console.log('Muestra:', JSON.stringify(verif3, null, 2));

  // 2. Importar cursos
  const [legacyCursos] = await poolLegacy.execute('SELECT * FROM curso ORDER BY anio, nombre_curso');
  for (const lc of legacyCursos) {
    const [espExist] = await pool.execute("SELECT id FROM asis_especialidades WHERE nombre = 'Prácticas Profesionalizantes' AND activo = 1");
    let espId;
    if (espExist.length > 0) {
      espId = espExist[0].id;
    } else {
      const [r] = await pool.execute("INSERT INTO asis_especialidades (nombre, activo) VALUES ('Prácticas Profesionalizantes', 1)");
      espId = r.insertId;
    }
    const [cursoExist] = await pool.execute('SELECT id FROM asis_cursos WHERE legacy_id = ?', [lc.id]);
    if (cursoExist.length > 0) continue;
    const nombre = lc.nombre_curso.replace(/^PP/i, '').trim() || 'Curso ' + lc.id;
    await pool.execute(
      'INSERT INTO asis_cursos (nombre, descripcion, anio, especialidad_id, turno, legacy_id, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [nombre, lc.descripcion_curso || '', lc.anio || 2020, espId, lc.turno || 'mañana', lc.id]
    );
    cursosImportados++;
  }
  console.log('Cursos importados: ' + cursosImportados);

  // 3. Mapeo legacy curso -> nuevo curso
  const [cursoMapRows] = await pool.execute('SELECT id, legacy_id FROM asis_cursos WHERE legacy_id IS NOT NULL');
  const cursoMap = new Map(cursoMapRows.map(c => [c.legacy_id, c.id]));

  // 4. Mapeo legacy usuario -> nuevo user
  const [userMapRows] = await pool.execute('SELECT id, legacy_id FROM users WHERE legacy_id IS NOT NULL');
  const userMap = new Map(userMapRows.map(u => [u.legacy_id, u.id]));
  console.log('User map size: ' + userMap.size + ', Curso map size: ' + cursoMap.size);

  // 5. Inscribir alumnos
  let inscripciones = 0;
  for (const lu of legacyUsers) {
    const legacyCursoId = lu.curso;
    const nuevoCursoId = cursoMap.get(legacyCursoId);
    const nuevoUserId = userMap.get(lu.id);
    if (!nuevoCursoId || !nuevoUserId) continue;
    const [insExist] = await pool.execute('SELECT id FROM asis_alumnos_curso WHERE user_id = ? AND curso_id = ?', [nuevoUserId, nuevoCursoId]);
    if (insExist.length > 0) continue;
    await pool.execute('INSERT INTO asis_alumnos_curso (curso_id, user_id, fecha_inscripcion, activo) VALUES (?, ?, CURDATE(), 1)', [nuevoCursoId, nuevoUserId]);
    inscripciones++;
  }
  console.log('Inscripciones creadas: ' + inscripciones);

  // 6. Importar registros de asistencia
  const [legacyAsist] = await poolLegacy.execute('SELECT a.*, u.curso as curso_id_legacy FROM asistencia a JOIN usuarios u ON u.id = a.usuario');
  for (const la of legacyAsist) {
    const nuevoUserId = userMap.get(parseInt(la.usuario));
    const nuevoCursoId = cursoMap.get(la.curso_id_legacy);
    if (!nuevoUserId || !nuevoCursoId) continue;
    const [alumnoCurso] = await pool.execute('SELECT id FROM asis_alumnos_curso WHERE user_id = ? AND curso_id = ?', [nuevoUserId, nuevoCursoId]);
    if (alumnoCurso.length === 0) continue;
    const alumnoCursoId = alumnoCurso[0].id;
    const fecha = la.fecha instanceof Date ? la.fecha.toISOString().split('T')[0] : la.fecha;
    const [regExist] = await pool.execute("SELECT id FROM asis_registros WHERE alumno_curso_id = ? AND fecha = ?", [alumnoCursoId, fecha]);
    if (regExist.length > 0) continue;
    await pool.execute("INSERT INTO asis_registros (alumno_curso_id, fecha, estado, hora_llegada) VALUES (?, ?, 'presente', ?)", [alumnoCursoId, fecha, la.serial || null]);
    registrosImportados++;
  }
  console.log('Registros de asistencia importados: ' + registrosImportados);
  console.log('IMPORTACION COMPLETADA');

  await pool.end();
  await poolLegacy.end();
})().catch(e => { console.error('ERROR:', e.message, e.stack); });
