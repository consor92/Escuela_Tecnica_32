'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from './actions';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="card login-card">
          <div className="login-header">
            <div className="logo-placeholder">
              <ShieldCheck size={40} />
            </div>
            <h1>Sistema de Calificaciones</h1>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '-5px', marginBottom: '10px' }}>
              Se usan credenciales de Encuentro Tecnologico
            </p>
            <p>Sistema de Coevaluación Bisemanal</p>
          </div>

          {errorMessage && (
            <div className="alert alert-error">{errorMessage}</div>
          )}

          <form action={dispatch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Correo Electrónico</label>
              <input type="email" name="email" required placeholder="ejemplo@correo.com" style={{ padding: '12px' }} />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Contraseña</label>
              <input type="password" name="password" required placeholder="••••••••" style={{ padding: '12px' }} />
            </div>
            <div style={{ marginTop: '10px' }}>
              <LoginButton />
            </div>
          </form>

          <div className="login-footer">
            <p>¿Olvidaste tu contraseña? Contacta a tu docente.</p>
            <div className="footer-meta">
              <span>v2.0.0 (React)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn btn-primary btn-login" disabled={pending}>
      {pending ? 'Ingresando...' : 'Ingresar al Portal'}
    </button>
  );
}
