'use server';

import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import { login } from '@/lib/auth';
import md5 from 'md5';

export async function authenticate(prevState: string | undefined, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const password_md5 = md5(password);

    console.log('--- INTENTO DE LOGIN ---');
    console.log('Email:', email);
    console.log('Password (plain):', password);
    console.log('Password (MD5):', password_md5);

    console.log('Intentando conectar a DB en:', process.env.DB_HOST);
    
    let rows: any;
    try {
      const [result] = await pool.execute(
        'SELECT id, email, password_md5, role_id FROM users WHERE email = ?',
        [email]
      );
      rows = result;
      console.log('Consulta ejecutada con éxito.');
    } catch (dbError) {
      console.error('ERROR CRÍTICO DE DB:', (dbError as any).message);
      return 'Error de conexión con la base de datos.';
    }

    const user = rows ? rows[0] : null;
    console.log('Usuario encontrado en DB:', user ? 'SÍ' : 'NO');
    
    if (user) {
      console.log('MD5 en DB:', user.password_md5);
      const match = (user.password_md5 === password_md5 || user.password_md5 === password);
      console.log('¿Coincide contraseña?:', match ? 'SÍ' : 'NO');
      
      if (match) {
        await login({
          id: user.id,
          username: user.username,
          role_id: user.role_id,
          email: user.email,
        });
        // ... resto de la lógica
      }
    }

    if (user && (user.password_md5 === password_md5 || user.password_md5 === password)) {
      if (user.role_id === 1) redirect('/admin');
      else if (user.role_id === 3) redirect('/docente');
      else if (user.role_id === 4) redirect('/preceptor');
      else if (user.role_id === 5) redirect('/referente');
      else {
        if (!user.school_year || !user.year_div) {
          redirect('/profile');
        } else {
          redirect('/dashboard');
        }
      }
    } else {
      return 'Credenciales incorrectas.';
    }
  } catch (error) {
    if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
    }
    return 'Ocurrió un error inesperado.';
  }
}

export async function signout() {
  // We can't use logout() here directly if we want to redirect easily from a server action
  // but we'll use it in a separate logout route or just call it.
  // Actually, for simplicity, let's just use the logout from lib/auth
}
