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

    console.log(`Intento de login para: ${email}`);

    const [rows]: any = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND (password_md5 = ? OR password_md5 = ?)',
      [email, password_md5, password]
    );

    const user = rows[0];

    if (user) {
      console.log(`Login exitoso para: ${email}, Rol: ${user.role_id}`);
      await login({
        id: user.id,
        username: user.username,
        role_id: user.role_id,
        email: user.email,
      });

      if (user.role_id === 1) {
        redirect('/admin');
      } else {
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
    console.error('Login error:', error);
    return 'Ocurrió un error inesperado.';
  }
}

export async function signout() {
  // We can't use logout() here directly if we want to redirect easily from a server action
  // but we'll use it in a separate logout route or just call it.
  // Actually, for simplicity, let's just use the logout from lib/auth
}
