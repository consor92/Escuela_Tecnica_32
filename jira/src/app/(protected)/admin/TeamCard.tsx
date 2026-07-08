'use client';

import { useState } from 'react';
import { 
  renameTeam, 
  deleteTeam, 
  assignUserToTeam, 
  assignScrumMaster,
  updateTeamAcademicInfo 
} from './actions';
import { updateExternalId } from './actions-users';
import { notifications } from '@mantine/notifications';
// @ts-expect-error
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash';
// @ts-expect-error
import IconDeviceFloppy from '@tabler/icons-react/dist/esm/icons/IconDeviceFloppy';
// @ts-expect-error
import IconX from '@tabler/icons-react/dist/esm/icons/IconX';
// @ts-expect-error
import IconChartBar from '@tabler/icons-react/dist/esm/icons/IconChartBar';
// @ts-expect-error
import IconMessage from '@tabler/icons-react/dist/esm/icons/IconMessage';
// @ts-expect-error
import IconStar from '@tabler/icons-react/dist/esm/icons/IconStar';
// @ts-expect-error
import IconChevronDown from '@tabler/icons-react/dist/esm/icons/IconChevronDown';
// @ts-expect-error
import IconChevronUp from '@tabler/icons-react/dist/esm/icons/IconChevronUp';
// @ts-expect-error
import IconAlertTriangle from '@tabler/icons-react/dist/esm/icons/IconAlertTriangle';
// @ts-expect-error
import IconCertificate from '@tabler/icons-react/dist/esm/icons/IconCertificate';
// @ts-expect-error
import IconHash from '@tabler/icons-react/dist/esm/icons/IconHash';
// @ts-expect-error
import IconCheck from '@tabler/icons-react/dist/esm/icons/IconCheck';

export default function TeamCard({ team, academicOptions, onOpenChart, onOpenComments, onOpenTeacherEval }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(team.name);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const [localExternalIds, setLocalExternalIds] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

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

  const handleSaveExternalId = async (userId: number) => {
    const newId = localExternalIds[userId];
    if (newId === undefined) return;
    
    setSavingId(userId);
    try {
        await updateExternalId(userId, parseInt(newId, 10) || 0);
        const next = { ...localExternalIds };
        delete next[userId];
        setLocalExternalIds(next);
        notifications.show({ title: 'ID Jira', message: 'Guardado con éxito', color: 'green' });
    } catch (e) {
        notifications.show({ title: 'Error', message: 'No se pudo guardar el ID de Jira', color: 'red' });
    } finally {
        setSavingId(null);
    }
  };

  return (
    <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible' }}>
      {showConfirmDelete && (
          <div className="confirm-overlay" style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              background: 'rgba(229, 62, 62, 0.95)', zIndex: 50, borderRadius: '12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'white', padding: '20px', textAlign: 'center'
          }}>
              <IconAlertTriangle size={40} style={{ marginBottom: '10px' }} />
              <h4 style={{ margin: '0 0 10px 0' }}>¿BORRAR EQUIPO?</h4>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button className="btn" onClick={() => setShowConfirmDelete(false)} style={{ flex: 1, background: 'white', color: '#e53e3e' }}>CANCELAR</button>
                  <button className="btn" onClick={handleDelete} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid white' }}>BORRAR TODO</button>
              </div>
          </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
          <button className="btn-icon" onClick={() => setIsCollapsed(!isCollapsed)} style={{ color: 'var(--primary-color)' }}>
            {isCollapsed ? <IconChevronDown size={18} /> : <IconChevronUp size={18} />}
          </button>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ flex: 1, padding: '4px 8px' }} />
              <button className="btn-icon" onClick={async () => { await renameTeam(team.id, newName); setIsEditing(false); }}><IconDeviceFloppy size={16} /></button>
              <button className="btn-icon" onClick={() => setIsEditing(false)}><IconX size={16} /></button>
            </div>
          ) : (
            <h3 style={{ margin: 0, color: 'var(--primary-color)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => setIsEditing(true)}>{team.name}</h3>
          )}
        </div>
        <button className="btn-icon" style={{ color: '#e53e3e' }} onClick={() => setShowConfirmDelete(true)}><IconTrash size={16} /></button>
      </div>

      {/* Selectores Académicos con Espaciado Corregido */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', background: 'var(--bg-color)', padding: '8px 12px', borderRadius: '10px', alignItems: 'center' }}>
        <IconCertificate size={16} color="var(--primary-color)" />
        <select 
          value={schoolYear} 
          onChange={(e) => handleUpdateAcademic(e.target.value, yearDiv)}
          style={{ flex: 1, fontSize: '0.75rem', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: 600 }}
        >
          <option value="">Ciclo...</option>
          {academicOptions.filter((o: any) => o.type === 'school_year').map((o: any) => (
            <option key={o.id} value={o.value}>{o.value}</option>
          ))}
        </select>
        <select 
          value={yearDiv} 
          onChange={(e) => handleUpdateAcademic(schoolYear, e.target.value)}
          style={{ flex: 1, fontSize: '0.75rem', padding: '4px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--card-bg)', color: 'var(--text-color)', fontWeight: 600 }}
        >
          <option value="">División...</option>
          {academicOptions.filter((o: any) => o.type === 'year_div').map((o: any) => (
            <option key={o.id} value={o.value}>{o.value}</option>
          ))}
        </select>
      </div>

      {!isCollapsed && (
        <>
          <div style={{ flex: 1, maxHeight: '350px', overflowY: 'auto', marginBottom: '15px' }}>
            {team.members.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed var(--border-color)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700 }}>{m.last_name}, {m.first_name}</span>
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{m.year_div || '-'} • {m.school_year || '-'}</small>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  {/* Jira ID Editor - REDISEÑADO PARA MÁXIMA VISIBILIDAD */}
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center', background: 'rgba(49, 130, 206, 0.05)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <IconHash size={14} color="#3182ce" />
                      <input
                          type="text"
                          placeholder="Nombre Jira"
                          defaultValue={m.external_id || ''}
                          key={`jira-id-${m.id}-${m.external_id}`}
                          onInput={(e: any) => setLocalExternalIds({ ...localExternalIds, [m.id]: e.target.value })}
                          style={{ 
                              fontSize: '0.85rem', width: '90px', padding: '5px 8px', 
                              border: '1px solid transparent', 
                              borderRadius: '6px', background: 'white', color: 'var(--text-color)', fontWeight: 800,
                              outline: localExternalIds[m.id] !== undefined ? '2px solid #3182ce' : 'none'
                          }}
                      />
                      {(localExternalIds[m.id] !== undefined) && (
                          <button 
                            style={{ 
                                background: '#3182ce', color: 'white', border: 'none', 
                                borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold'
                            }}
                            onClick={() => handleSaveExternalId(m.id)}
                            disabled={savingId === m.id}
                          >
                            {savingId === m.id ? '...' : <IconCheck size={16} stroke={4} />}
                          </button>
                      )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <small style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>CO:</small>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: m.bimestralCo >= 7 ? '#2f855a' : '#c53030' }}>{m.bimestralCo.toFixed(1)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <small style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>PR:</small>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: m.bimestralProf >= 7 ? '#805ad5' : '#4a5568' }}>{m.bimestralProf.toFixed(1)}</span>
                    </div>
                    <button className="btn-icon" style={{ color: '#e53e3e', marginLeft: '5px' }} onClick={() => assignUserToTeam(m.id, null)} title="Quitar del equipo"><IconX size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Scrum Masters</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '5px' }}>
              {[1, 2, 3, 4].map(b => (
                <select key={b} style={{ fontSize: '0.7rem', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color)' }} value={team.sms[b] || ''} onChange={(e) => assignScrumMaster(team.id, e.target.value ? parseInt(e.target.value) : null, b)}>
                  <option value="">Bim {b}: -</option>
                  {team.members.map((m: any) => <option key={m.id} value={m.id}>B{b}: {m.first_name}</option>)}
                </select>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.85rem', padding: '10px' }} onClick={() => onOpenChart(team)}><IconChartBar size={16} /> Evolución</button>
            <button className="btn" style={{ flex: 1, background: 'var(--border-color)', color: 'var(--text-color)', fontSize: '0.85rem', padding: '10px' }} onClick={() => onOpenComments(team)}><IconMessage size={16} /> Notas</button>
          </div>
          <button className="btn" style={{ width: '100%', background: 'rgba(159,122,234,0.15)', color: '#805ad5', border: '1px solid #805ad5', fontSize: '0.85rem', padding: '10px', fontWeight: 700 }} onClick={() => onOpenTeacherEval(team)}><IconStar size={16} /> Calificar Alumnos</button>
        </>
      )}
    </div>
  );
}
