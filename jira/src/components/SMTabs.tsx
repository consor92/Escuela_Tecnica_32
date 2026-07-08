'use client';

import { useState, ReactNode } from 'react';

export default function SMTabs({ evalContent, reassignContent }: { evalContent: ReactNode; reassignContent: ReactNode }) {
  const [tab, setTab] = useState<'eval' | 'reas'>('eval');

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem', borderBottom: '2px solid var(--border-color)' }}>
        <button
          onClick={() => setTab('eval')}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            borderBottom: tab === 'eval' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: tab === 'eval' ? 700 : 500,
            color: tab === 'eval' ? 'var(--primary-color)' : 'var(--text-muted)'
          }}
        >📋 Evaluaciones</button>
        <button
          onClick={() => setTab('reas')}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            borderBottom: tab === 'reas' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: tab === 'reas' ? 700 : 500,
            color: tab === 'reas' ? 'var(--primary-color)' : 'var(--text-muted)'
          }}
        >🔄 Reasignación de Tareas</button>
      </div>
      {tab === 'eval' ? evalContent : reassignContent}
    </div>
  );
}
