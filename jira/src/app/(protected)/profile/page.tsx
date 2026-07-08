import pool from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [users]: any = await pool.execute(
    'SELECT first_name, last_name, school_year, year_div, role_id FROM users WHERE id = ?',
    [session.user.id]
  );
  const user = users[0];

  if (user.role_id === 1) redirect('/admin');
  if (user.role_id === 3) redirect('/docente');
  if (user.role_id === 4) redirect('/preceptor');
  if (user.role_id === 5) redirect('/referente');

  const [options]: any = await pool.execute('SELECT * FROM academic_options');
  const schoolYears = options.filter((o: any) => o.type === 'school_year');
  const yearDivs = options.filter((o: any) => o.type === 'year_div');

  async function updateProfile(formData: FormData) {
    'use server';
    const school_year = formData.get('school_year');
    const year_div = formData.get('year_div');
    const userId = session.user.id;

    if (school_year && year_div) {
      await pool.execute(
        'UPDATE users SET school_year = ?, year_div = ? WHERE id = ?',
        [school_year, year_div, userId]
      );
      revalidatePath('/dashboard');
      redirect('/dashboard');
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="card login-card">
          <div className="login-header">
            <div className="logo-placeholder">👤</div>
            <h1>¡Hola, {user.first_name}!</h1>
            <p>Antes de comenzar, necesitamos que actualices tus datos escolares.</p>
          </div>

          <form action={updateProfile}>
            <div className="form-group">
              <label>Ciclo Lectivo</label>
              <select name="school_year" required defaultValue={user.school_year || ''}>
                <option value="">Seleccione un ciclo...</option>
                {schoolYears.map((o: any) => (
                  <option key={o.id} value={o.value}>{o.value}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Año y División</label>
              <select name="year_div" required defaultValue={user.year_div || ''}>
                <option value="">Seleccione año y división...</option>
                {yearDivs.map((o: any) => (
                  <option key={o.id} value={o.value}>{o.value}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-login">Guardar y Continuar</button>
          </form>

          <div className="login-footer">
            <p>Estos datos son obligatorios para poder realizar tus evaluaciones.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
