'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select'), { ssr: false });
import { useRouter } from 'next/navigation';
import { 
  createTeam, 
  assignUserToTeam, 
  toggleEvaluations, 
  setActivePeriod, 
  addAcademicOption, 
  deleteAcademicOption 
} from './actions';
import { restoreSystemDefault } from './seed-actions';
import { Plus, Users, Settings, X, Search, Database, RefreshCcw } from 'lucide-react';

export default function AdminHeader({ 
  evalEnabled, 
  currentPeriod, 
  periods, 
  academicOptions,
  unassignedUsers,
  teams 
}: any) {
  const [isMounted, setIsMounted] = useState(false);
  const selectId = "admin-select-student";
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [academicType, setAcademicType] = useState('school_year');
  const [academicValue, setAcademicValue] = useState('');

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePeriodChange = (periodId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('period', periodId);
    router.push(url.pathname + url.search);
  };

  const handleRestore = async () => {
    if (confirm('¿ATENCIÓN: Esto borrará TODAS las evaluaciones, equipos y calificaciones actuales para restaurar los datos de users.csv?')) {
        const res = await restoreSystemDefault();
        if (res.success) {
            alert('Sistema restaurado correctamente.');
            window.location.reload();
        } else {
            alert('Error: ' + res.error);
        }
    }
  };

  const studentOptions = unassignedUsers.map((u: any) => ({
    value: u.id,
    label: `${u.last_name}, ${u.first_name}`
  }));

  const customStyles = {
    control: (base: any) => ({
      ...base,
      background: 'var(--card-bg)',
      borderColor: 'var(--border-color)',
      borderRadius: '10px',
      color: 'var(--text-color)'
    }),
    menu: (base: any) => ({
      ...base,
      background: 'var(--card-bg)',
      zIndex: 100
    }),
    option: (base: any, state: any) => ({
      ...base,
      background: state.isFocused ? 'var(--primary-color)' : 'transparent',
      color: state.isFocused ? 'white' : 'var(--text-color)'
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'var(--text-color)'
    }),
    input: (base: any) => ({
      ...base,
      color: 'var(--text-color)'
    })
  };

  return (
    <div className="admin-header-controls">
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn" style={{ background: 'var(--text-muted)', color: 'white', fontSize: '0.75rem', padding: '6px 12px' }} onClick={handleRestore}>
            <RefreshCcw size={14} /> Restaurar (Default)
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}><Settings size={18} /> Académico</h4>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <select 
                value={academicType} 
                onChange={(e) => setAcademicType(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              >
                <option value="school_year">Ciclo</option>
                <option value="year_div">Año/Div</option>
              </select>
              <input 
                type="text" 
                placeholder="Valor..." 
                value={academicValue}
                onChange={(e) => setAcademicValue(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              />
              <button 
                className="btn btn-primary"
                style={{ padding: '8px 12px' }}
                onClick={async () => {
                  if (academicValue) {
                    await addAcademicOption(academicType, academicValue);
                    setAcademicValue('');
                  }
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {academicOptions.map((o: any) => (
                <span key={o.id} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--border-color)' }}>
                  {o.value} <X size={12} style={{ cursor: 'pointer' }} onClick={() => deleteAcademicOption(o.id)} />
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ marginTop: 0 }}>Encuestas</h4>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={evalEnabled} 
                onChange={(e) => toggleEvaluations(e.target.checked)}
              />
              <span className="switch-slider"></span>
            </label>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '20px' }}>
            <h4 style={{ marginTop: 0 }}>Periodo Activo</h4>
            <select 
              value={currentPeriod?.id || ''} 
              onChange={(e) => {
                const val = e.target.value;
                setActivePeriod(parseInt(val));
                handlePeriodChange(val);
              }}
              style={{ padding: '8px' }}
            >
              {periods.map((p: any) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}><Plus size={18} /> Nuevo Equipo</h4>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input 
              type="text" 
              placeholder="Nombre..." 
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              style={{ padding: '8px' }}
            />
            <button 
              className="btn btn-primary"
              onClick={async () => {
                if (newTeamName) {
                  await createTeam(newTeamName);
                  setNewTeamName('');
                }
              }}
            >
              Crear
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}><Users size={18} /> Asignar Alumno</h4>
          <div style={{ display: 'flex', gap: '5px', flexDirection: 'column' }}>
            {isMounted && (
              <Select
                id={selectId}
                instanceId={selectId}
                options={studentOptions}
                value={selectedUser}
                onChange={setSelectedUser}
                placeholder="Buscar alumno..."
                styles={customStyles}
                isClearable
              />
            )}
            <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
              <select 
                value={selectedTeam} 
                onChange={(e) => setSelectedTeam(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              >
                <option value="">Equipo...</option>
                {teams.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button 
                className="btn btn-primary"
                disabled={!selectedUser || !selectedTeam}
                onClick={async () => {
                  await assignUserToTeam(selectedUser.value, parseInt(selectedTeam));
                  setSelectedUser(null);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
