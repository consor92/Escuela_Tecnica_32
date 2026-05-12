'use server';

import pool from '@/lib/db';
import md5 from 'md5';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function restoreSystemDefault() {
  try {
    // 1. Limpieza profunda
    await pool.execute('SET FOREIGN_KEY_CHECKS = 0');
    await pool.execute('TRUNCATE TABLE teacher_evaluations');
    await pool.execute('TRUNCATE TABLE evaluations');
    await pool.execute('TRUNCATE TABLE scrum_masters');
    await pool.execute('TRUNCATE TABLE users');
    await pool.execute('TRUNCATE TABLE teams');
    await pool.execute('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Leer users.csv
    const csvPath = path.join(process.cwd(), 'users.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    });

    // 3. Procesar e importar
    for (const record of records as any[]) {
      const email = record.email;
      const nombre = record.nombre;
      const apellido = record.apellido;
      if (!email || !nombre) continue;

      const roleId = record.rol === '1' ? 1 : 2;
      const password_md5 = record.password || md5('123');
      const username = record.usuario || email.split('@')[0];
      
      // Mapeo de divisiones basado en curso (ejemplo: 26 -> 6°1, 27 -> 6°2)
      let yearDiv = '6°1';
      if (record.curso === '27') yearDiv = '6°2';

      await pool.execute(
        `INSERT INTO users (external_id, username, email, password_md5, role_id, first_name, last_name, school_year, year_div) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.id || null, username, email, password_md5, roleId, nombre, apellido, '2026', yearDiv]
      );
    }

    return { success: true, message: 'Sistema restaurado correctamente.' };
  } catch (err: any) {
    console.error('Error en restauración:', err);
    return { success: false, error: err.message };
  }
}

