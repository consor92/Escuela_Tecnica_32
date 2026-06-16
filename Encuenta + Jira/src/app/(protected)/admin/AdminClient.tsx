'use client';

import { useEffect, useState } from 'react';
import AdminHeader from './AdminHeader';
import DataPanel from './DataPanel';
import TeamCard from './TeamCard';
import ReportsTable from './ReportsTable';
import AdminModals from './AdminModals';
import { ChevronDown, ChevronRight, Users, LayoutGrid } from 'lucide-react';

export default function AdminClient({ 
  initialData 
}: any) {
  const { 
  evalEnabled, 
  periods, 
  academicOptions, 
  unassignedUsers, 
  teamsData, 
  finalReports
  } = initialData;

  // Estados que dependen de initialData y pueden cambiar vía URL/Props
  const [currentPeriod, setCurrentPeriod] = useState(initialData.currentPeriod);
  const [reports, setReports] = useState(initialData.finalReports);

  useEffect(() => {
    setCurrentPeriod(initialData.currentPeriod);
    setReports(initialData.finalReports);
    }, [initialData.currentPeriod, initialData.finalReports]);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const [expandedYears, setExpandedYears] = useState<string[]>([]);
  const [expandedDivs, setExpandedDivs] = useState<string[]>([]);

  // Recuperar estados de expansión al cargar
  useEffect(() => {
    const savedYears = localStorage.getItem('expandedYears');
    const savedDivs = localStorage.getItem('expandedDivs');
    if (savedYears) setExpandedYears(JSON.parse(savedYears));
    if (savedDivs) setExpandedDivs(JSON.parse(savedDivs));
  }, []);

  // Guardar estados de expansión al cambiar
  useEffect(() => {
    localStorage.setItem('expandedYears', JSON.stringify(expandedYears));
  }, [expandedYears]);

  useEffect(() => {
    localStorage.setItem('expandedDivs', JSON.stringify(expandedDivs));
  }, [expandedDivs]);

  const openModal = (type: string, data: any) => {
    setModalData(data);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const toggleYear = (year: string) => {
    setExpandedYears(prev => expandedYears.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);
  };

  const toggleDiv = (divKey: string) => {
    setExpandedDivs(prev => expandedDivs.includes(divKey) ? prev.filter(d => d !== divKey) : [...prev, divKey]);
  };

  const groupedTeams = teamsData.reduce((acc: any, team: any) => {
    const year = team.members[0]?.school_year || 'Sin Ciclo';
    const div = team.members[0]?.year_div || 'Sin División';
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][div]) acc[year][div] = [];
    acc[year][div].push(team);
    return acc;
  }, {});

  return (
    <div className="admin-container" style={{ padding: '20px' }}>
      <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              <LayoutGrid size={32} color="var(--primary-color)" /> Panel de Control Administrativo
          </h1>
          <DataPanel />
      </div>

      <AdminHeader 
        evalEnabled={evalEnabled}
        currentPeriod={currentPeriod}
        periods={periods}
        academicOptions={academicOptions}
        unassignedUsers={unassignedUsers}
        teams={teamsData}
      />

      <h2 style={{ margin: '2.5rem 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Users size={28} /> Gestión de Equipos
      </h2>

      <div className="teams-hierarchy">
        {Object.keys(groupedTeams).sort().reverse().map(year => (
          <div key={year} className="year-group" style={{ marginBottom: '1.5rem' }}>
            <button 
                onClick={() => toggleYear(year)}
                style={{ 
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px', 
                    padding: '12px 20px', background: 'var(--primary-color)', color: 'white', 
                    border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 800,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
            >
                {expandedYears.includes(year) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                📅 Ciclo Lectivo {year}
            </button>

            {expandedYears.includes(year) && (
              <div className="div-group-container" style={{ padding: '10px 0 10px 20px' }}>
                {Object.keys(groupedTeams[year]).sort().map(div => {
                  const divKey = `${year}-${div}`;
                  return (
                    <div key={divKey} className="div-group" style={{ marginBottom: '1rem' }}>
                        <button 
                            onClick={() => toggleDiv(divKey)}
                            style={{ 
                                width: '100%', display: 'flex', alignItems: 'center', gap: '8px', 
                                padding: '10px 15px', background: 'var(--card-bg)', color: 'var(--text-color)', 
                                border: '1px solid var(--border-color)', borderRadius: '10px', cursor: 'pointer',
                                fontWeight: 700, marginBottom: '10px'
                            }}
                        >
                            {expandedDivs.includes(divKey) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            🏫 {div}
                        </button>

                        {expandedDivs.includes(divKey) && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', padding: '10px' }}>
                            {groupedTeams[year][div].map((t: any) => (
                              <TeamCard 
                                key={t.id} 
                                team={t} 
                                academicOptions={academicOptions}
                                onOpenChart={(data: any) => openModal('chart', data)}
                                onOpenComments={(data: any) => openModal('comments', data)}
                                onOpenTeacherEval={(data: any) => openModal('teacher', data)}
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {teamsData.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No hay equipos creados aún.</p>}
      </div>

      <h2 style={{ margin: '3.5rem 0 1rem 0' }}>📊 Reporte Consolidado de Rendimiento</h2>
      <ReportsTable initialReports={reports} teams={teamsData} unassignedUsers={unassignedUsers} />

      <AdminModals 
        activeModal={activeModal}
        modalData={modalData}
        onClose={closeModal}
        periods={periods}
        currentPeriodId={currentPeriod?.id}
      />
    </div>
  );
}
