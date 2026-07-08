'use server';
import pool from '@/lib/db';
import md5 from 'md5';
import { revalidatePath } from 'next/cache';

export async function getUsuarios(rol?: number) {
  let sql = 'SELECT id, email, first_name, last_name, role_id, dni, telefono, username FROM users WHERE role_id IN (2,3,4,5)'
  const params: any[] = [];
  if (rol) { sql += ' AND role_id = ?'; params.push(rol); }
  sql += ' ORDER BY last_name, first_name';
  const [rows]: any = await pool.execute(sql, params);
  return rows;
}

export async function createUsuario(data: {
  email: string; password: string; first_name: string; last_name: string;
  role_id: number; dni?: string; telefono?: string;
}) {
  const [exist]: any = await pool.execute('SELECT id FROM users WHERE email = ?', [data.email]);
  if (exist.length > 0) return { error: 'Ya existe un usuario con ese email' };

  const password_md5 = md5(data.password);
  const [result]: any = await pool.execute(
    'INSERT INTO users (email, password_md5, role_id, first_name, last_name, dni, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [data.email, password_md5, data.role_id, data.first_name, data.last_name, data.dni || null, data.telefono || null]
  );
  // Si es referente, asignarlo a todos los cursos activos
  if (data.role_id === 5) {
    const [cursos]: any = await pool.execute('SELECT id FROM asis_cursos WHERE activo = 1');
    for (const c of cursos) {
      await pool.execute(
        'INSERT IGNORE INTO asis_docentes_curso (curso_id, user_id, rol) VALUES (?, ?, ?)',
        [c.id, result.insertId, 'preceptor']
      );
    }
  }
  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function updateUsuario(id: number, data: {
  email: string; first_name: string; last_name: string;
  role_id: number; dni?: string; telefono?: string; password?: string;
}) {
  if (data.password) {
    const password_md5 = md5(data.password);
    await pool.execute(
      'UPDATE users SET email = ?, first_name = ?, last_name = ?, role_id = ?, dni = ?, telefono = ?, password_md5 = ? WHERE id = ?',
      [data.email, data.first_name, data.last_name, data.role_id, data.dni || null, data.telefono || null, password_md5, id]
    );
  } else {
    await pool.execute(
      'UPDATE users SET email = ?, first_name = ?, last_name = ?, role_id = ?, dni = ?, telefono = ? WHERE id = ?',
      [data.email, data.first_name, data.last_name, data.role_id, data.dni || null, data.telefono || null, id]
    );
  }
  revalidatePath('/admin/usuarios');
  return { success: true };
}

export async function deleteUsuario(id: number) {
  await pool.execute('DELETE FROM users WHERE id = ? AND role_id IN (3,4,5)', [id]);
  revalidatePath('/admin/usuarios');
  return { success: true };
}
