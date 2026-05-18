'use client';

import { useState } from 'react';
import { 
  renameTeam, 
  deleteTeam, 
  assignUserToTeam, 
  assignScrumMaster,
  updateTeamAcademicInfo 
} from './actions';
import { Trash2, Save, X, BarChart2, MessageSquare, Star, ChevronDown, ChevronUp, AlertTriangle, GraduationCap } from 'lucide-react';

export default function TeamCard({ team, academicOptions, onOpenChart, onOpenComments, onOpenTeacherEval }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(team.name);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Estados locales para ciclo/división (basados en el primer miembro si existe)
  const [schoolYear, setSchoolYear] = useState(team.members[0]?.school_year || '');
  const [yearDiv, setYearDiv] = useState(team.members[0]?.year_div || '');

  const handleDelete = async () => {
      await deleteTeam(team.id);
      setShowConfirmDelete(false);
  };

  const handleUpdateAcademic = async (newYear: string, newDiv: string) => {
    setSchoolYear(newYear);
    setYearDiv(newDiv);
    await updateTeamAcademicInfo(team.id, newYear, newDiv);
  };

  return (
    <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {showConfirmDelete && (
          <div className="confirm-overlay" style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              background: 'rgba(229, 62, 62, 0.95)', zIndex: 50, borderRadius: '12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'white', padding: '20px', textAlign: 'center'
          }}>
              <AlertTriangle size={40} style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 10px 0' }}>¿BORRAR EQUIPO?</h4>
              <p style={{ fontSize: '0.8rem', marginBottom: '20px' }}>Se perderán permanentemente todas las notas y promedios de este grupo.</p>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button className="btn" onClick={() => setShowConfirmDelete(false)} style={{ flex: 1, background: 'white', color: '#e53e3e' }}>CANCELAR</button>
                  <button className="btn" onClick={handleDelete} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid white' }}>BORRAR TODO</button>
              </div>
          </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <button 
            className="btn-icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ color: 'var(--primary-color)' }}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
              <input 
                type="text" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                style={{ flex: 1, padding: '4px 8px' }}
              />
              <button className="btn-icon" onClick={async () => { await renameTeam(team.id, newName); setIsEditing(false); }}><Save size={16} /></button>
              <button className="btn-icon" onClick={() => setIsEditing(false)}><X size={16} /></button>
            </div>
          ) : (
            <h3 style={{ margin: 0, color: 'var(--primary-color)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setIsEditing(true)}>{team.name}</h3>
          )}
        </div>
        <button className="btn-icon" style={{ color: '#e53e3e' }} onClick={() => setShowConfirmDelete(true)}><Trash2 size={16} /></button>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', background: 'var(--bg-color)', padding: '6px 8px', borderRadius: '8px', alignItems: 'center' }}>
        <GraduationCap size={14} color="var(--primary-color)" />
        <select 
          value={schoolYear} 
          onChange={(e) => handleUpdateAcademic(e.target.value, yearDiv)}
          style={{ flex: 1, fontSize: '0.7rem', padding: '2px', border: 'none', background: 'transparent', color: 'var(--text-color)', fontWeight: 600 }}
        >
          <option value="" style={{ color: '#333' }}>Ciclo...</option>
          {academicOptions.filter((o: any) => o.type === 'school_year').map((o: any) => (
            <option key={o.id} value={o.value} style={{ color: '#333' }}>{o.value}</option>
          ))}
        </select>
        <select 
          value={yearDiv} 
          onChange={(e) => handleUpdateAcademic(schoolYear, e.target.value)}
          style={{ flex: 1, fontSize: '0.7rem', padding: '2px', border: 'none', background: 'transparent', color: 'var(--text-color)', fontWeight: 600 }}
        >
          <option value="" style={{ color: '#333' }}>División...</option>
          {academicOptions.filter((o: any) => o.type === 'year_div').map((o: any) => (
            <option key={o.id} value={o.value} style={{ color: '#333' }}>{o.value}</option>
          ))}
        </select>
      </div>

      {!isCollapsed && (
        <>
          <div style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', marginBottom: '15px' }}>
            {team.members.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px dashed var(--border-color)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>{m.last_name}, {m.first_name}</span>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{m.year_div || '-'} • {m.school_year || '-'}</small>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {m.pendingCount > 0 && (
                    <span title={`${m.pendingCount} evaluaciones pendientes`} style={{ 
                      background: '#feb2b2', color: '#9b2c2c', fontSize: '0.55rem', 
                      padding: '1px 5px', borderRadius: '4px', fontWeight: 800,
                      display: 'flex', alignItems: 'center', gap: '2px'
                    }}>
                      <AlertTriangle size={8} /> PENDIENTE
                    </span>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <small style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>COEVAL</small>
                      <span style={{ 
                        fontSize: '0.8rem', fontWeight: 800, padding: '1px 6px', borderRadius: '5px',
                        background: m.bimestralCo >= 7 ? 'rgba(56, 161, 105, 0.15)' : m.bimestralCo >= 4 ? 'rgba(237, 137, 54, 0.15)' : 'rgba(229, 62, 62, 0.15)',
                        color: m.bimestralCo >= 7 ? '#2f855a' : m.bimestralCo >= 4 ? '#c05621' : '#c53030'
                      }}>
                        {m.bimestralCo.toFixed(1)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <small style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOCENTE</small>
                      <span style={{ 
                        fontSize: '0.8rem', fontWeight: 800, padding: '1px 6px', borderRadius: '5px',
                        background: m.bimestralProf >= 7 ? 'rgba(159, 122, 234, 0.15)' : m.bimestralProf >= 4 ? 'rgba(74, 144, 226, 0.15)' : 'rgba(113, 128, 150, 0.15)',
                        color: m.bimestralProf >= 7 ? '#805ad5' : m.bimestralProf >= 4 ? '#3182ce' : '#4a5568'
                      }}>
                        {m.bimestralProf.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <button className="btn-icon" style={{ color: 'var(--text-muted)', marginLeft: '4px' }} onClick={() => assignUserToTeam(m.id, null)}><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Scrum Masters</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px' }}>
              {[1, 2, 3, 4].map(b => (
                <select key={b} style={{ fontSize: '0.7rem', padding: '4px' }} value={team.sms[b] || ''} onChange={(e) => assignScrumMaster(team.id, e.target.value ? parseInt(e.target.value) : null, b)}>
                  <option value="">Bim {b}: -</option>
                  {team.members.map((m: any) => <option key={m.id} value={m.id}>B{b}: {m.first_name}</option>)}
                </select>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px' }} onClick={() => onOpenChart(team)}><BarChart2 size={14} /> Evolución</button>
            <button className="btn" style={{ flex: 1, background: 'var(--border-color)', color: 'var(--text-color)', fontSize: '0.8rem', padding: '8px' }} onClick={() => onOpenComments(team)}><MessageSquare size={14} /> Notas</button>
          </div>
          <button className="btn" style={{ width: '100%', background: 'rgba(159,122,234,0.1)', color: '#9f7aea', border: '1px solid #9f7aea', fontSize: '0.8rem', padding: '8px' }} onClick={() => onOpenTeacherEval(team)}><Star size={14} /> Calificar Alumnos</button>
        </>
      )}
    </div>
  );
}
