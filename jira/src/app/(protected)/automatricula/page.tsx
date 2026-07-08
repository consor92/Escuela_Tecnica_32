'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// @ts-expect-error
import IconLogin from '@tabler/icons-react/dist/esm/icons/IconLogin';

export default function AutoMatriculaPage() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    setMsg('');
    setError('');
    try {
      const res = await fetch('/api/automatricula', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Matriculado correctamente en: ' + data.curso);
        setCodigo('');
      } else {
        setError(data.error || 'Error al procesar');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: '500px', margin: '0 auto', paddingTop: '2rem' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)', color: 'white', border: 'none' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><IconLogin size={20} /> Auto-matriculación</h2>
        <p style={{ opacity: 0.9, marginBottom: 0 }}>Ingresá el código que te dio tu preceptor para matricularte en un curso</p>
      </div>
      <div className="card" style={{ marginTop: '1rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>Código de matrícula</label>
        <input value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Ej: C25-2026"
          style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '1.1rem', fontFamily: 'monospace', boxSizing: 'border-box' }} />
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !codigo.trim()}
          style={{ width: '100%', marginTop: '10px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <IconLogin size={16} /> {loading ? 'Procesando...' : 'Matricularme'}
        </button>
        {msg && <div style={{ background: '#c6f6d5', color: '#22543d', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>{msg}</div>}
        {error && <div style={{ background: '#fed7d7', color: '#9b2c2c', padding: '10px', borderRadius: '6px', marginTop: '10px' }}>{error}</div>}
      </div>
    </div>
  );
}
