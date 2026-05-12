'use client';

import { useState } from 'react';
import { Search, ArrowUp, ArrowDown, KeyRound, Check, X as CloseIcon } from 'lucide-react';
import { forcePasswordReset } from './actions';

export default function ReportsTable({ initialReports, teams, unassignedUsers }: any) {
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<any>({ key: 'last_name', direction: 'asc' });
  
  // Estado para el reseteo de contraseña
  const [resetUserId, setResetUserId] = useState<number | null>(null);
  const [newPass, setNewPass] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPass = async (userId: number) => {
    if (!newPass) return;
    setIsResetting(true);
    await forcePasswordReset(userId, newPass);
    setIsResetting(false);
    setResetUserId(null);
    setNewPass('');
    alert("Contraseña actualizada con éxito.");
  };

  const filteredReports = initialReports.filter((r: any) => {
    const matchesSearch = 
      `${r.last_name} ${r.first_name} ${r.team_name || ''} ${r.year_div || ''} ${r.school_year || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = !teamFilter || r.team_name === teamFilter;
    return matchesSearch && matchesTeam;
  });

  const requestSort = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedReports = [...filteredReports].map(r => {
    const tw = parseFloat(r.avg_tw || 0);
    const dv = parseFloat(r.avg_dv || 0);
    const cw = parseFloat(r.avg_cw || 0);
    const general = (tw + dv + cw) / 3;
    const generalNota = general ? (general / 4) * 10 : 0;
    const profNota = parseFloat(r.avg_teacher || 0);
    const smNota = r.avg_sm ? (parseFloat(r.avg_sm) / 4) * 10 : 0;
    return { 
      ...r, 
      avg_general: generalNota,
      avg_teacher_val: profNota,
      avg_sm_val: smNota
    };
  }).sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    // Manejo de valores nulos/undefined
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre, equipo, división..." 
            style={{ paddingLeft: '35px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          value={teamFilter} 
          onChange={(e) => setTeamFilter(e.target.value)}
          style={{ width: '250px' }}
        >
          <option value="">Todos los equipos</option>
          {teams.map((t: any) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="table-container" style={{ maxHeight: '480px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('last_name')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Alumno <SortIcon column="last_name" /></div>
              </th>
              <th onClick={() => requestSort('team_name')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Equipo <SortIcon column="team_name" /></div>
              </th>
              <th onClick={() => requestSort('year_div')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Año/Div <SortIcon column="year_div" /></div>
              </th>
              <th onClick={() => requestSort('school_year')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Ciclo <SortIcon column="school_year" /></div>
              </th>
              <th onClick={() => requestSort('avg_tw')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>T.E <SortIcon column="avg_tw" /></div>
              </th>
              <th onClick={() => requestSort('avg_dv')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Dev <SortIcon column="avg_dv" /></div>
              </th>
              <th onClick={() => requestSort('avg_cw')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Clase <SortIcon column="avg_cw" /></div>
              </th>
              <th onClick={() => requestSort('avg_general')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Gral <SortIcon column="avg_general" /></div>
              </th>
              <th onClick={() => requestSort('avg_sm_val')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>SM <SortIcon column="avg_sm_val" /></div>
              </th>
              <th onClick={() => requestSort('avg_teacher_val')} style={{ cursor: 'pointer', position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Prof <SortIcon column="avg_teacher_val" /></div>
              </th>
              <th style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--card-bg)' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports.slice(0, 100).map((r: any) => {
                const tw = parseFloat(r.avg_tw || 0);
                const dv = parseFloat(r.avg_dv || 0);
                const cw = parseFloat(r.avg_cw || 0);
                const smNota = r.avg_sm_val;
                const profNota = r.avg_teacher_val;

                return (
                  <tr key={r.id}>
                    <td><strong>{r.last_name}, {r.first_name}</strong></td>
                    <td>{r.team_name || '-'}</td>
                    <td>{r.year_div || '-'}</td>
                    <td>{r.school_year || '-'}</td>
                    <td>{tw.toFixed(1)}</td>
                    <td>{dv.toFixed(1)}</td>
                    <td>{cw.toFixed(1)}</td>
                    <td style={{ background: 'rgba(74,144,226,0.1)', fontWeight: 700 }}>{r.avg_general.toFixed(1)}</td>
                    <td style={{ background: 'rgba(80,227,194,0.1)' }}>{smNota ? smNota.toFixed(1) : '-'}</td>
                    <td style={{ background: 'rgba(159,122,234,0.1)', fontWeight: 700 }}>{profNota > 0 ? profNota.toFixed(1) : '-'}</td>
                    <td>
                      {resetUserId === r.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input 
                            type="text" 
                            placeholder="Nueva pass" 
                            value={newPass} 
                            onChange={e => setNewPass(e.target.value)}
                            style={{ padding: '2px 4px', fontSize: '0.7rem', width: '80px' }}
                          />
                          <button className="btn-icon" onClick={() => handleResetPass(r.id)} disabled={isResetting} style={{ color: '#38a169' }}><Check size={14} /></button>
                          <button className="btn-icon" onClick={() => setResetUserId(null)} style={{ color: '#e53e3e' }}><CloseIcon size={14} /></button>
                        </div>
                      ) : (
                        <button 
                          className="btn-icon" 
                          title="Resetear Contraseña" 
                          onClick={() => setResetUserId(r.id)}
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <KeyRound size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
