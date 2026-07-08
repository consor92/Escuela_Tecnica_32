'use client';

import { useState, useEffect, useRef } from 'react';
import { createReassignment, getTeamMembers, getTeamIssues, getTeamReassignments } from '@/app/(protected)/dashboard/actions';

export default function TaskReassignment({ teamId, userId }: { teamId: number; userId: number }) {
  const [members, setMembers] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [reassignments, setReassignments] = useState<any[]>([]);
  const [form, setForm] = useState({
    sprintNumber: 1,
    originalTaskKey: '',
    newTaskKey: '',
    fromUserId: 0,
    toUserId: 0,
    reason: '',
    assignedAt: '',
    reassignedAt: ''
  });
  const [message, setMessage] = useState('');
  const [searchOrig, setSearchOrig] = useState('');
  const [searchNew, setSearchNew] = useState('');
  const [showOrig, setShowOrig] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const origRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [teamId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (origRef.current && !origRef.current.contains(e.target as Node)) setShowOrig(false);
      if (newRef.current && !newRef.current.contains(e.target as Node)) setShowNew(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function loadData() {
    const [m, iss, r] = await Promise.all([getTeamMembers(teamId), getTeamIssues(teamId), getTeamReassignments(teamId)]);
    setMembers(m);
    setIssues(iss);
    setReassignments(r);
  }

  function selectIssue(key: string, summary: string, field: 'orig' | 'new') {
    if (field === 'orig') {
      setForm({ ...form, originalTaskKey: key });
      setSearchOrig(`${key} — ${summary}`);
    } else {
      setForm({ ...form, newTaskKey: key });
      setSearchNew(`${key} — ${summary}`);
    }
  }

  const filteredOrig = issues.filter(i =>
    !form.originalTaskKey || i.issue_key !== form.originalTaskKey
  ).filter(i =>
    `${i.issue_key} ${i.summary || ''}`.toLowerCase().includes(searchOrig.toLowerCase())
  );

  const filteredNew = issues.filter(i =>
    `${i.issue_key} ${i.summary || ''}`.toLowerCase().includes(searchNew.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.originalTaskKey || !form.newTaskKey) {
      setError('Seleccioná ambas tareas de la lista');
      return;
    }

    try {
      await createReassignment({
        teamId,
        sprintNumber: form.sprintNumber,
        originalTaskKey: form.originalTaskKey,
        newTaskKey: form.newTaskKey,
        fromUserId: form.fromUserId,
        toUserId: form.toUserId,
        reason: form.reason,
        assignedAt: form.assignedAt || undefined,
        reassignedAt: form.reassignedAt || undefined
      });
      setMessage('✅ Reasignación registrada. Pendiente de aprobación docente.');
      setForm({ sprintNumber: 1, originalTaskKey: '', newTaskKey: '', fromUserId: 0, toUserId: 0, reason: '', assignedAt: '', reassignedAt: '' });
      setSearchOrig('');
      setSearchNew('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem' }}>🔄 Nueva Reasignación de Tarea</h4>
        <form onSubmit={handleSubmit}>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>N° de Sprint</label>
              <input type="number" min={1} className="form-input" style={{ width: '100%', marginTop: '4px' }}
                value={form.sprintNumber}
                onChange={e => setForm({ ...form, sprintNumber: Number(e.target.value) })} required />
            </div>
            <div ref={origRef} style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Tarea Original</label>
              <input type="text" className="form-input" style={{ width: '100%', marginTop: '4px' }} placeholder="Buscá por código o nombre..."
                value={searchOrig}
                onFocus={() => setShowOrig(true)}
                onChange={e => { setSearchOrig(e.target.value); setShowOrig(true); setForm({ ...form, originalTaskKey: '' }); }} />
              {showOrig && filteredOrig.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '180px', overflowY: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {filteredOrig.slice(0, 30).map(i => (
                    <div key={i.issue_key} style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)' }}
                      onClick={() => { selectIssue(i.issue_key, i.summary || '', 'orig'); setShowOrig(false); }}>
                      <strong>{i.issue_key}</strong> — {i.summary || 'sin descripción'}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div ref={newRef} style={{ position: 'relative' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nueva Subtarea</label>
              <input type="text" className="form-input" style={{ width: '100%', marginTop: '4px' }} placeholder="Buscá por código o nombre..."
                value={searchNew}
                onFocus={() => setShowNew(true)}
                onChange={e => { setSearchNew(e.target.value); setShowNew(true); setForm({ ...form, newTaskKey: '' }); }} />
              {showNew && filteredNew.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '180px', overflowY: 'auto', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  {filteredNew.slice(0, 30).map(i => (
                    <div key={i.issue_key} style={{ padding: '6px 10px', cursor: 'pointer', fontSize: '0.75rem', borderBottom: '1px solid var(--border-color)' }}
                      onClick={() => { selectIssue(i.issue_key, i.summary || '', 'new'); setShowNew(false); }}>
                      <strong>{i.issue_key}</strong> — {i.summary || 'sin descripción'}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Alumno que no trabajó</label>
              <select className="form-input" style={{ width: '100%', marginTop: '4px' }}
                value={form.fromUserId}
                onChange={e => setForm({ ...form, fromUserId: Number(e.target.value) })} required>
                <option value={0}>Seleccionar...</option>
                {members.filter(m => m.id !== userId).map(m => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Alumno que asume la tarea</label>
              <select className="form-input" style={{ width: '100%', marginTop: '4px' }}
                value={form.toUserId}
                onChange={e => setForm({ ...form, toUserId: Number(e.target.value) })} required>
                <option value={0}>Seleccionar...</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha de asignación original</label>
              <input type="date" className="form-input" style={{ width: '100%', marginTop: '4px' }}
                value={form.assignedAt}
                onChange={e => setForm({ ...form, assignedAt: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fecha de reasignación</label>
              <input type="date" className="form-input" style={{ width: '100%', marginTop: '4px' }}
                value={form.reassignedAt}
                onChange={e => setForm({ ...form, reassignedAt: e.target.value })} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Motivo</label>
              <textarea className="form-input" style={{ width: '100%', marginTop: '4px', minHeight: '60px' }}
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })} required />
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {message && <span style={{ fontSize: '0.85rem', color: '#38a169' }}>{message}</span>}
              {error && <span style={{ fontSize: '0.85rem', color: '#e53e3e' }}>{error}</span>}
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>Solicitar Reasignación</button>
          </div>
        </form>
      </div>

      <h4 style={{ marginBottom: '0.75rem' }}>📋 Historial de Reasignaciones</h4>
      {reassignments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay reasignaciones registradas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {reassignments.map(r => (
            <div key={r.id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong>{r.original_task_key} → {r.new_task_key}</strong>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Sprint {r.sprint_number}</span>
                  <span style={{ marginLeft: '8px', fontWeight: 600, color: r.status === 'approved' ? '#38a169' : r.status === 'rejected' ? '#e53e3e' : '#dd6b20' }}>
                    {r.status === 'approved' ? '✓ Aprobado' : r.status === 'rejected' ? '✗ Rechazado' : '⏳ Pendiente'}
                  </span>
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: '#e53e3e' }}>{r.from_name} {r.from_last}</span> → <span style={{ color: '#38a169' }}>{r.to_name} {r.to_last}</span>
                <span style={{ marginLeft: '12px' }}>SM: {r.req_name} {r.req_last}</span>
              </div>
              <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>{r.reason}</div>
              {(r.assigned_at || r.reassigned_at) && (
                <div style={{ marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {r.assigned_at && <>Asignado: {new Date(r.assigned_at).toLocaleDateString()}</>}
                  {r.reassigned_at && <> · Reasignado: {new Date(r.reassigned_at).toLocaleDateString()}</>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
