'use client';

import React, { useState, useRef, useEffect } from 'react';
// @ts-expect-error
import IconCalculator from '@tabler/icons-react/dist/esm/icons/IconCalculator';
// @ts-expect-error
import IconUpload from '@tabler/icons-react/dist/esm/icons/IconUpload';
// @ts-expect-error
import IconUsers from '@tabler/icons-react/dist/esm/icons/IconUsers';
// @ts-expect-error
import IconChevronDown from '@tabler/icons-react/dist/esm/icons/IconChevronDown';
// @ts-expect-error
import IconChevronRight from '@tabler/icons-react/dist/esm/icons/IconChevronRight';
// @ts-expect-error
import IconTrendingUp from '@tabler/icons-react/dist/esm/icons/IconTrendingUp';
// @ts-expect-error
import IconChartBar from '@tabler/icons-react/dist/esm/icons/IconChartBar';
import { importJiraCSV, processGrades, getPeriods, updatePeriodDates, saveFieldNotebookScore, saveCeremonyRecord } from './actions';
import { getTeams } from './data';
import { getTeamSummary } from './summary';
import Papa from 'papaparse';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Pie, Bar, Line } from 'react-chartjs-2';
import { Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
// @ts-expect-error
import IconCalendar from '@tabler/icons-react/dist/esm/icons/IconCalendar';
// @ts-expect-error
import IconDeviceFloppy from '@tabler/icons-react/dist/esm/icons/IconDeviceFloppy';
// @ts-expect-error
import CloseIcon from '@tabler/icons-react/dist/esm/icons/IconX';
// @ts-expect-error
import IconCircleCheck from '@tabler/icons-react/dist/esm/icons/IconCircleCheck';
// @ts-expect-error
import IconTarget from '@tabler/icons-react/dist/esm/icons/IconTarget';
// @ts-expect-error
import IconBook from '@tabler/icons-react/dist/esm/icons/IconBook';
// @ts-expect-error
import IconClock from '@tabler/icons-react/dist/esm/icons/IconClock';
import CeremonyLogger from '@/components/scrum/CeremonyLogger';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

function normalizeName(name: string) {
    if (!name) return [];
    return name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 1);
}

function formatDateForInput(date: any) {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return '';
}

export default function AutoEvaluacionEquipos() {
  const [teams, setTeams] = useState<any>({});
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [periods, setPeriods] = useState<any[]>([]);
  const [showPeriodsModal, setShowPeriodsModal] = useState(false);

  useEffect(() => {
    getTeams().then(setTeams);
    getPeriods().then(setPeriods);
  }, []);

  const [selectedBimestre, setSelectedBimestre] = useState<number | null>(null); // null = Anual
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    distribucion: true,
    sprints: true,
    hitos: false,
    burndown: false,
    scrum: true,
    notasManuales: true
  });
  const [notebookScores, setNotebookScores] = useState<Record<number, number>>({});

  useEffect(() => {
    if (selectedTeam) {
        getTeamSummary(selectedTeam, selectedBimestre || undefined).then(setSummary);
    }
  }, [selectedTeam, selectedBimestre]);

  const handleSaveNotebook = async (userId: number, score: number) => {
      await saveFieldNotebookScore(userId, selectedBimestre || 1, score);
      setNotebookScores(prev => ({ ...prev, [userId]: score }));
      notifications.show({ title: 'Carpeta', message: 'Nota guardada correctamente.', color: 'green' });
  };

  const handleSaveCeremony = async (data: any) => {
      await saveCeremonyRecord({
          ...data,
          cellId: selectedTeam,
          periodId: selectedBimestre || 1
      });
      notifications.show({ title: 'Ceremonia', message: 'Registrada correctamente.', color: 'green' });
      toggleSection('scrum');
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBimestreChange = (bim: number | null) => {
    setSelectedBimestre(bim);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTeam) { notifications.show({ title: 'Selección requerida', message: 'Seleccione un equipo primero.', color: 'yellow' }); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setLoading(true);
      try {
        const result = await importJiraCSV(selectedTeam, text);
        if (result && typeof result === 'object') {
            const { nuevos, actualizados } = result;
            notifications.show({ title: 'Importación Jira', message: `${nuevos} nuevas tareas, ${actualizados} actualizadas.`, color: 'green' });
            const freshTeams = await getTeams();
            setTeams(freshTeams);
            getTeamSummary(selectedTeam, selectedBimestre || undefined).then(setSummary);
        } else {
            throw new Error('El servidor no devolvió un resultado válido.');
        }
      } catch (e: any) {
        notifications.show({ title: 'Error CSV', message: e.message || 'Error desconocido', color: 'red' });
      }
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await processGrades(selectedTeam!, selectedBimestre || 1);
      setResults(res);
    } catch (e) {
      notifications.show({ title: 'Error', message: 'Error al procesar notas.', color: 'red' });
    }
    setLoading(false);
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', margin: 0 }}>
            <IconCalculator size={32} color="var(--primary-color)" /> Auto Evaluación Equipos
        </h1>
        <button className="btn" onClick={() => setShowPeriodsModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <IconCalendar size={18} /> Configurar Bimestres
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><IconUsers size={20} /> Equipos</h3>
          {Object.entries(teams).map(([key, group]: any) => (
            <div key={key} style={{ marginBottom: '5px' }}>
              <button onClick={() => toggleGroup(key)} style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'space-between', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                {group.year} | {group.div}
                {expandedGroups[key] ? <IconChevronDown size={16} /> : <IconChevronRight size={16} />}
              </button>
              {expandedGroups[key] && (
                <div style={{ paddingLeft: '10px', marginTop: '5px' }}>
                  {group.teams.map((team: any) => (
                    <button key={team.id} onClick={() => setSelectedTeam(team.id)} style={{ width: '100%', padding: '8px', background: selectedTeam === team.id ? 'var(--primary-color)' : 'transparent', color: selectedTeam === team.id ? 'white' : 'var(--text-color)', border: 'none', borderRadius: '4px', cursor: 'pointer', textAlign: 'left' }}>
                      {team.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          {selectedTeam ? (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><IconChartBar size={20} /> Resumen de Equipo</h3>
                    <div style={{ display: 'flex', gap: '5px', background: 'var(--bg-color)', padding: '4px', borderRadius: '10px' }}>
                        {[1, 2, 3, 4].map(bim => (
                            <button 
                                key={bim}
                                onClick={() => handleBimestreChange(bim)}
                                style={{
                                    padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold',
                                    background: selectedBimestre === bim ? 'var(--primary-color)' : 'transparent',
                                    color: selectedBimestre === bim ? 'white' : 'var(--text-muted)'
                                }}
                            >
                                Bim {bim}
                            </button>
                        ))}
                        <button 
                            onClick={() => handleBimestreChange(null)}
                            style={{
                                padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold',
                                background: selectedBimestre === null ? 'var(--primary-color)' : 'transparent',
                                color: selectedBimestre === null ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            Anual
                        </button>
                    </div>
                </div>
                {summary && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                        <div className="card" style={{ padding: '15px' }}>
                            <strong>Tareas Principales:</strong><br/>{summary.totalTasks}<br/>
                            <small>({summary.finalizedTasks} fin.)</small>
                        </div>
                        <div className="card" style={{ padding: '15px' }}>
                            <strong>Subtareas:</strong><br/>{summary.totalSubtasks}<br/>
                            <small>({summary.finalizedSubtasks} fin.)</small>
                        </div>
                        <div className="card" style={{ padding: '15px' }}>
                            <strong>Story Points:</strong><br/>{summary.totalSP}<br/>
                            <small>({summary.finalizedSP} fin.)</small>
                        </div>
                        <div className="card" style={{ padding: '15px' }}>
                            <strong>Eficiencia:</strong><br/>
                            T: {summary.efficiency}%<br/>
                            SP: {summary.spEfficiency}%
                        </div>
                        <div className="card" style={{ padding: '15px', color: summary.totalDebt > 0 ? '#e53e3e' : 'inherit' }}>
                            <strong>Deuda Técnica:</strong><br/>{summary.totalDebt}<br/>
                            <small>Tareas saltadas</small>
                        </div>
                        <div className="card" style={{ padding: '15px' }}><strong>Tiempo Total:</strong><br/>{summary.totalTimeSpent}h</div>
                        
                        <div className="card" style={{ padding: '15px', color: summary.totalVulnerabilities > 0 ? '#e53e3e' : 'inherit' }}>
                            <strong>Bugs / Vulnerab.:</strong><br/>{summary.totalVulnerabilities}
                        </div>
                        <div className="card" style={{ padding: '15px', color: summary.unassignedCount > 0 ? '#e53e3e' : 'inherit' }}>
                            <strong>Sin Asignar:</strong><br/>{summary.unassignedCount} tareas
                        </div>
                        
                        <div className="card" style={{ padding: '15px', gridColumn: 'span 4' }}>
                          <strong>Progreso y Carga por Integrante:</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                             {summary.workload.map((data: any) => (
                                 <div key={data.name} style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', position: 'relative' }}>
                                    {data.debt > 0 && (
                                        <div title={`Deuda técnica: ${data.debt} tareas saltadas`} style={{ position: 'absolute', top: '10px', right: '10px', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                                            ⚠️ {data.debt}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', paddingRight: data.debt > 0 ? '30px' : '0' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{data.name}</span>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.75rem' }}>Tareas: {data.progress}%</div>
                                            <div style={{ fontWeight: 800, color: '#4a90e2', fontSize: '0.75rem' }}>SP: {data.spProgress}%</div>
                                        </div>
                                    </div>
                                    <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                                        <div style={{ height: '100%', width: `${data.progress}%`, background: 'var(--primary-color)', transition: 'width 0.5s ease' }}></div>
                                    </div>
                                    <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', marginBottom: '8px' }}>
                                        <div style={{ height: '100%', width: `${data.spProgress}%`, background: '#4a90e2', transition: 'width 0.5s ease' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        <span>📋 {data.tasks}t + {data.subtasks}st ({data.done}f)</span>
                                        <span>💎 {data.sp}sp ({data.doneSP}f)</span>
                                        <span>⏱️ {data.time}h</span>
                                    </div>
                                 </div>
                             ))}
                          </div>
                        </div>

                        {/* Hitos */}
                        <div className="card" style={{ padding: '20px', gridColumn: 'span 4' }}>
                          <h4 
                            onClick={() => toggleSection('hitos')}
                            style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--primary-color)', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IconTarget size={20} /> Hitos del {selectedBimestre ? `Bimestre ${selectedBimestre}` : 'Año'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {summary.unassignedHitoCount > 0 && (
                                    <div style={{ fontSize: '0.8rem', color: '#e53e3e', background: 'rgba(229, 62, 62, 0.1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
                                        ⚠️ {summary.unassignedHitoCount} tareas sin hito
                                    </div>
                                )}
                                {collapsedSections.hitos ? <IconChevronRight size={20} /> : <IconChevronDown size={20} />}
                            </div>
                          </h4>
                          {!collapsedSections.hitos && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
                               {summary.milestones.map((m: any) => (
                                   <div key={m.name} style={{ background: 'var(--bg-color)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{m.name}</span>
                                          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: m.progress === 100 ? '#38a169' : 'inherit' }}>{m.progress}%</span>
                                      </div>
                                      <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                                          <div style={{ height: '100%', width: `${m.progress}%`, background: m.progress === 100 ? '#38a169' : 'linear-gradient(90deg, var(--primary-color), #63b3ed)', transition: 'width 1s ease' }}></div>
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                          <span>Progreso Tareas</span>
                                          <span>{m.done} / {m.total}</span>
                                      </div>
                                   </div>
                               ))}
                            </div>
                          )}
                        </div>

                        {/* Distribución */}
                        <div className="card" style={{ padding: '20px', gridColumn: 'span 4' }}>
                          <h4 
                            onClick={() => toggleSection('distribucion')}
                            style={{ margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IconChartBar size={20} /> Distribución de Trabajo Finalizado
                            </div>
                            {collapsedSections.distribucion ? <IconChevronRight size={20} /> : <IconChevronDown size={20} />}
                          </h4>
                          {!collapsedSections.distribucion && (
                            <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                   {/* Paleta de colores unificada y vibrante para identificación clara */}
                                   {(() => {
                                       const vividPalette = ['#3182ce', '#38a169', '#dd6b20', '#805ad5', '#e53e3e', '#319795', '#d53f8c', '#d69e2e', '#4fd1c5', '#f687b3'];
                                       return (
                                           <>
                                               {/* Gráfico Tareas */}
                                               <div style={{ textAlign: 'center', minWidth: 0 }}>
                                                  <h5 style={{ marginBottom: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Tareas Principales (Task)</h5>
                                                  <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                                                      <Pie 
                                                          data={{
                                                              labels: summary.workload.map((u: any) => u.name),
                                                              datasets: [{
                                                                  data: summary.workload.map((u: any) => u.done),
                                                                  backgroundColor: vividPalette,
                                                                  borderWidth: 1
                                                              }]
                                                          }}
                                                          options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                                      />
                                                  </div>
                                               </div>
                                               {/* Gráfico Subtareas */}
                                               <div style={{ textAlign: 'center', minWidth: 0 }}>
                                                  <h5 style={{ marginBottom: '20px', fontSize: '0.8rem', fontWeight: 600 }}>Subtareas (Sub-task)</h5>
                                                  <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                                                      <Pie 
                                                          data={{
                                                              labels: summary.workload.map((u: any) => u.name),
                                                              datasets: [{
                                                                  data: summary.workload.map((u: any) => u.subtasksDone),
                                                                  backgroundColor: vividPalette,
                                                                  borderWidth: 1
                                                              }]
                                                          }}
                                                          options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                                      />
                                                  </div>
                                               </div>
                                               {/* Gráfico Total */}
                                               <div style={{ textAlign: 'center', minWidth: 0 }}>
                                                  <h5 style={{ marginBottom: '20px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-color)' }}>Total Combinado (T + ST)</h5>
                                                  <div style={{ height: '220px', display: 'flex', justifyContent: 'center' }}>
                                                      <Pie 
                                                          data={{
                                                              labels: summary.workload.map((u: any) => u.name),
                                                              datasets: [{
                                                                  data: summary.workload.map((u: any) => u.done + u.subtasksDone),
                                                                  backgroundColor: vividPalette,
                                                                  borderWidth: 2,
                                                                  borderColor: 'var(--card-bg)'
                                                              }]
                                                          }}
                                                          options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                                                      />
                                                  </div>
                                               </div>
                                               
                                               {/* Leyenda Compartida - Forzada a UN SOLO RENGLÓN */}
                                               <div style={{ 
                                                   gridColumn: '1 / -1', 
                                                   display: 'flex', 
                                                   flexWrap: 'nowrap', 
                                                   overflowX: 'auto', 
                                                   justifyContent: 'flex-start', 
                                                   gap: '12px', 
                                                   marginTop: '15px', 
                                                   padding: '12px', 
                                                   background: 'var(--bg-color)', 
                                                   borderRadius: '10px',
                                                   scrollbarWidth: 'thin'
                                               }}>
                                                  {summary.workload.map((u: any, i: number) => (
                                                      <div key={u.name} style={{ 
                                                          display: 'flex', 
                                                          alignItems: 'center', 
                                                          gap: '10px', 
                                                          padding: '8px 12px', 
                                                          border: '1px solid var(--border-color)', 
                                                          borderRadius: '8px', 
                                                          whiteSpace: 'nowrap',
                                                          background: 'var(--card-bg)',
                                                          flexShrink: 0
                                                      }}>
                                                          <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: vividPalette[i % vividPalette.length], flexShrink: 0 }}></div>
                                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{u.name.split(' ')[0]}</span>
                                                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Total: <strong>{u.done + u.subtasksDone}</strong></span>
                                                          </div>
                                                      </div>
                                                  ))}
                                               </div>
                                           </>
                                       );
                                   })()}
                                </div>
                            </div>
                          )}
                        </div>

                        {/* Sprints */}
                        <div className="card" style={{ padding: '20px', gridColumn: 'span 4' }}>
                          <h4 
                            onClick={() => toggleSection('sprints')}
                            style={{ margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IconTrendingUp size={20} /> Balance de Carga por Sprint
                            </div>
                            {collapsedSections.sprints ? <IconChevronRight size={20} /> : <IconChevronDown size={20} />}
                          </h4>
                          {!collapsedSections.sprints && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px', animation: 'fadeIn 0.3s ease' }}>
                                {summary.sprints && summary.sprints.length > 0 ? summary.sprints.map((sprint: any) => (
                                    <div key={sprint.name} style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <h5 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary-color)' }}>{sprint.name}</h5>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Total Sprint: <strong>{sprint.totalTasks + sprint.totalSubtasks}</strong> (T: {sprint.totalTasks} / ST: {sprint.totalSubtasks})
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                            {sprint.members.map((m: any) => {
                                                let bgColor = 'var(--card-bg)';
                                                let borderColor = 'var(--border-color)';
                                                let badgeText = '';
                                                let badgeColor = '';

                                                if (m.overloaded) {
                                                    bgColor = 'rgba(229, 62, 62, 0.05)';
                                                    borderColor = '#e53e3e';
                                                    badgeText = 'SOBRECARGA';
                                                    badgeColor = '#e53e3e';
                                                } else if (m.underloaded) {
                                                    bgColor = 'rgba(237, 137, 54, 0.05)';
                                                    borderColor = '#ed8936';
                                                    badgeText = 'SUBCARGA';
                                                    badgeColor = '#ed8936';
                                                } else if (m.empty) {
                                                    bgColor = 'rgba(113, 128, 150, 0.05)';
                                                    badgeText = 'SIN TAREAS';
                                                    badgeColor = '#718096';
                                                }

                                                return (
                                                    <div key={m.id} style={{ background: bgColor, border: `1px solid ${borderColor}`, padding: '12px', borderRadius: '10px', position: 'relative' }}>
                                                        {badgeText && (
                                                            <div style={{ position: 'absolute', top: '-10px', right: '10px', background: badgeColor, color: 'white', fontSize: '0.6rem', fontWeight: 900, padding: '2px 8px', borderRadius: '10px' }}>
                                                                {badgeText}
                                                            </div>
                                                        )}
                                                        <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>{m.name}</div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.75rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>Tareas/Sub:</span>
                                                                <span style={{ fontWeight: 600 }}>{m.tasks} / {m.subtasks}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span>Peso Complejidad:</span>
                                                                <span style={{ fontWeight: 800, color: badgeColor || 'var(--primary-color)' }}>{m.weightedScore}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )) : (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No se encontró información de Sprints para este periodo.</p>
                                )}
                            </div>
                          )}
                        </div>

                        {/* Burndown */}
                        {summary.burndownData && (
                            <div className="card" style={{ padding: '20px', gridColumn: 'span 4' }}>
                              <h4 
                                onClick={() => toggleSection('burndown')}
                                style={{ margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconTrendingUp size={20} /> Burndown Chart ({selectedBimestre ? `Bimestre ${selectedBimestre}` : 'Anual'})
                                </div>
                                {collapsedSections.burndown ? <IconChevronRight size={20} /> : <IconChevronDown size={20} />}
                              </h4>
                              {!collapsedSections.burndown && (
                                <div style={{ height: '350px', marginTop: '20px', animation: 'fadeIn 0.3s ease' }}>
                                    <Line 
                                        data={{
                                            labels: summary.burndownData.labels,
                                            datasets: [
                                                {
                                                    label: 'Tareas Restantes',
                                                    data: summary.burndownData.actual,
                                                    borderColor: 'var(--primary-color)',
                                                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                                                    fill: true,
                                                    tension: 0.4
                                                },
                                                {
                                                    label: 'Ideal',
                                                    data: summary.burndownData.ideal,
                                                    borderColor: '#e53e3e',
                                                    borderDash: [5, 5],
                                                    fill: false,
                                                    tension: 0
                                                }
                                            ]
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { position: 'bottom' },
                                                tooltip: { mode: 'index', intersect: false }
                                            },
                                            scales: {
                                                y: { beginAtZero: true, title: { display: true, text: 'Tareas' } },
                                                x: { grid: { display: false } }
                                            }
                                        }}
                                    />
                                </div>
                              )}
                            </div>
                        )}

                        {/* Registro Scrum (Asistencia) */}
                        <div className="card" style={{ padding: '20px', gridColumn: 'span 4' }}>
                            <h4 
                                onClick={() => toggleSection('scrum')}
                                style={{ margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#805ad5' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconClock size={20} /> Registro de Ceremonias y Asistencia
                                </div>
                                {collapsedSections.scrum ? <IconChevronRight size={20} /> : <IconChevronDown size={20} />}
                            </h4>
                            {!collapsedSections.scrum && (
                                <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease' }}>
                                    <CeremonyLogger 
                                        cellId={selectedTeam} 
                                        members={summary.teamMembers.map((m: any) => ({ id: m.id, name: `${m.first_name} ${m.last_name}` }))}
                                        onSave={handleSaveCeremony}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Notas Manuales (Carpeta) */}
                        <div className="card" style={{ padding: '20px', gridColumn: 'span 4' }}>
                            <h4 
                                onClick={() => toggleSection('notasManuales')}
                                style={{ margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', color: '#38a169' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconBook size={20} /> Calificación de Carpeta de Campo
                                </div>
                                {collapsedSections.notasManuales ? <IconChevronRight size={20} /> : <IconChevronDown size={20} />}
                            </h4>
                            {!collapsedSections.notasManuales && (
                                <div style={{ marginTop: '20px', animation: 'fadeIn 0.3s ease', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                                    {summary.teamMembers.map((m: any) => (
                                        <div key={m.id} style={{ background: 'var(--bg-color)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.first_name} {m.last_name}</span>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input 
                                                    type="number" 
                                                    min="0" max="10" step="0.5"
                                                    placeholder="0-10"
                                                    style={{ width: '60px', padding: '5px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                                    onChange={(e) => setNotebookScores(prev => ({ ...prev, [m.id]: parseFloat(e.target.value) }))}
                                                    value={notebookScores[m.id] || ''}
                                                />
                                                <button className="btn" style={{ padding: '5px' }} onClick={() => handleSaveNotebook(m.id, notebookScores[m.id])}><IconDeviceFloppy size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><IconUpload size={20} /> Cargar Jira.csv</h3>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv" />
                <button className="btn" onClick={() => fileInputRef.current?.click()} style={{ background: 'var(--primary-color)', color: 'white' }}>Seleccionar Archivo</button>
                
                <div style={{ marginTop: '2rem' }}>
                    <button className="btn" onClick={handleCalculate} style={{ background: 'var(--primary-color)', color: 'white' }}><IconTrendingUp size={16} /> Ejecutar Calificación al 100%</button>
                </div>

                {/* Resultados de Calificación */}
                {results && (
                    <div className="card" style={{ marginTop: '20px', border: '2px solid var(--primary-color)', animation: 'fadeIn 0.5s ease' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'var(--primary-color)' }}>📊 Reporte Final de Calificación (100%)</h3>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Desempeño Grupal:</span>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{results.groupScore.toFixed(1)} / 100</div>
                            </div>
                        </div>

                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-color)', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Alumno</th>
                                        <th style={{ padding: '12px' }}>Jira (40%)</th>
                                        <th style={{ padding: '12px' }}>Grupal (30%)</th>
                                        <th style={{ padding: '12px' }}>Asist. (10%)</th>
                                        <th style={{ padding: '12px' }}>Doc./Carp./Coeval. (20%)</th>
                                        <th style={{ padding: '12px' }}>Nota Final</th>
                                        <th style={{ padding: '12px' }}>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(results.individualResults).map(([userId, res]: [string, any]) => {
                                        const userName = summary.teamMembers?.find((m: any) => String(m.id) === String(userId))
                                            ? `${summary.teamMembers.find((m: any) => String(m.id) === String(userId)).first_name} ${summary.teamMembers.find((m: any) => String(m.id) === String(userId)).last_name}`
                                            : `Usuario ${userId}`;

                                        return (
                                            <tr key={userId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '12px' }}>
                                                    <strong>{userName}</strong><br/>
                                                    <small className="badge">{res.role}</small>
                                                </td>
                                                <td style={{ padding: '12px' }}>{res.jiraBase.toFixed(1)}</td>
                                                <td style={{ padding: '12px' }}>{(res.groupPart || 0).toFixed(1)}</td>
                                                <td style={{ padding: '12px' }}>{res.attendanceBase.toFixed(1)}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontSize: '0.7rem' }}>
                                                        Doc: {res.teacherBase.toFixed(0)} | Carp: {res.notebookBase.toFixed(0)} | Coe: {res.coevalBase.toFixed(0)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary-color)' }}>{res.finalScore.toFixed(1)}</div>
                                                </td>
                                                <td style={{ padding: '12px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        {res.details.map((d: string, idx: number) => (
                                                            <div key={idx} style={{ fontSize: '0.65rem', color: '#e53e3e' }}>• {d}</div>
                                                        ))}
                                                        {res.details.length === 0 && <span style={{ color: '#38a169', fontSize: '0.65rem' }}>✓ Sin observaciones</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: '20px', padding: '15px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h5 style={{ margin: '0 0 10px 0', fontSize: '0.85rem' }}>🎯 Desglose del 100% de la Nota:</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '0.7rem' }}>
                                <div><strong>Individual Jira (40%):</strong> Productividad ponderada por complejidad y castigos de calidad.</div>
                                <div><strong>Grupal (30%):</strong> Avance del backlog del equipo y balanceo de carga.</div>
                                <div><strong>Proceso (30%):</strong> Asistencia (10%), Nota Docente (7.5%), Carpeta (5%) y Coevaluación (7.5%).</div>
                            </div>
                        </div>
                    </div>
                )}
            </>
          ) : (
            <p>Seleccione un equipo del panel izquierdo para comenzar.</p>
          )}
        </div>
      </div>

      <Modal opened={showPeriodsModal} onClose={() => setShowPeriodsModal(false)} title="Configuración de Bimestres" size="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {periods.map((p: any) => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'center', padding: '10px', background: 'var(--bg-color)', borderRadius: '10px' }}>
              <div style={{ fontWeight: 700 }}>{p.label} (B{p.bimestre})</div>
              <input type="date" defaultValue={formatDateForInput(p.start_date)} onChange={(e) => { const newPeriods = periods.map((per: any) => per.id === p.id ? { ...per, start_date: e.target.value } : per); setPeriods(newPeriods); }} style={{ padding: '5px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)' }} />
              <input type="date" defaultValue={formatDateForInput(p.end_date)} onChange={(e) => { const newPeriods = periods.map((per: any) => per.id === p.id ? { ...per, end_date: e.target.value } : per); setPeriods(newPeriods); }} style={{ padding: '5px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)' }} />
              <button className="btn btn-primary" style={{ padding: '8px' }} onClick={async () => { await updatePeriodDates(p.id, p.start_date, p.end_date); notifications.show({ title: 'Periodo', message: 'Actualizado correctamente.', color: 'green' }); }}><IconDeviceFloppy size={16} /></button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
