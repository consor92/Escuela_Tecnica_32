'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calculator, Upload, Users, ChevronDown, ChevronRight, TrendingUp, BarChart } from 'lucide-react';
import { importJiraCSV, processGrades } from './actions';
import { getTeams } from './data';
import { getTeamSummary } from './summary';
import Papa from 'papaparse';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function normalizeName(name: string) {
    if (!name) return [];
    return name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 1);
}

export default function AutoEvaluacionEquipos() {
  const [teams, setTeams] = useState<any>({});
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  useEffect(() => {
    if (selectedTeam) {
        getTeamSummary(selectedTeam).then(setSummary);
    }
  }, [selectedTeam]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedTeam) return alert('Por favor, seleccione un equipo primero.');
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      const csvData = parsed.data as any[];
      
      console.group("🔍 Trazabilidad de Vinculación Jira");
      const allTeamsList = Object.values(teams).flatMap((g: any) => g.teams);
      const currentTeam = allTeamsList.find((t: any) => t.id === selectedTeam);
      const teamMembers = currentTeam?.members || [];
      
      console.log("EQUIPO SELECCIONADO:", currentTeam?.name);
      console.log("MIEMBROS EN EQUIPO (SISTEMA):", teamMembers.map((m: any) => ({
          db_id: m.id,
          nombre: `${m.first_name} ${m.last_name}`,
          jira_id_registrado: m.external_id
      })));

      console.log("DETECCIÓN EN CSV:");
      csvData.slice(0, 15).forEach((row, idx) => {
          const jiraName = row['Persona asignada'];
          const jiraIdRaw = row['ID de la persona asignada'] || row['ID asignado'];
          const jiraId = jiraIdRaw ? jiraIdRaw.split(':')[0] : 'N/A';
          const jiraWords = normalizeName(jiraName);
          
          let match = teamMembers.find((m: any) => {
              const sysWords = normalizeName(`${m.first_name} ${m.last_name}`);
              const wordMatches = jiraWords.filter(jw => sysWords.some(sw => sw.includes(jw) || jw.includes(sw))).length;
              return wordMatches >= Math.min(jiraWords.length, 2);
          });

          if (match) {
              console.log(`[VÍNCULO OK] Fila ${idx+2} -> Tarea: "${row['Resumen']?.substring(0,20)}..." | JiraUser: "${jiraName}" (ID: ${jiraId}) | ✅ ASIGNADO A: ${match.first_name} (DB ID: ${match.id})`);
          } else {
              console.warn(`[VÍNCULO FALLIDO] Fila ${idx+2} -> JiraUser: "${jiraName}" (ID: ${jiraId}) | ❌ NO SE ENCONTRÓ EN ESTE EQUIPO`);
          }
      });
      console.groupEnd();

      setLoading(true);
      try {
        const { nuevos, actualizados } = await importJiraCSV(selectedTeam, text);
        alert(`Importación completada: ${nuevos} nuevas tareas, ${actualizados} actualizadas.`);
        const freshTeams = await getTeams();
        setTeams(freshTeams);
        getTeamSummary(selectedTeam).then(setSummary);
      } catch (e) {
        alert('Error al procesar el archivo CSV.');
      }
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await processGrades(selectedTeam!, 1);
      setResults(res);
    } catch (e) {
      alert('Error al procesar notas.');
    }
    setLoading(false);
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
        <Calculator size={32} color="var(--primary-color)" /> Auto Evaluación Equipos
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={20} /> Equipos</h3>
          {Object.entries(teams).map(([key, group]: any) => (
            <div key={key} style={{ marginBottom: '5px' }}>
              <button onClick={() => toggleGroup(key)} style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'space-between', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                {group.year} | {group.div}
                {expandedGroups[key] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
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
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart size={20} /> Resumen de Equipo</h3>
                {summary && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                        <div className="card" style={{ padding: '15px' }}><strong>Tareas:</strong><br/>{summary.totalIssues}</div>
                        <div className="card" style={{ padding: '15px' }}><strong>Finalizadas:</strong><br/>{summary.finalized}</div>
                        <div className="card" style={{ padding: '15px' }}><strong>Eficiencia:</strong><br/>{summary.efficiency}%</div>
                        <div className="card" style={{ padding: '15px' }}><strong>Tiempo:</strong><br/>{summary.totalTimeSpent}h</div>
                        <div className="card" style={{ padding: '15px' }}><strong>Vulnerabilidades:</strong><br/>{summary.totalVulnerabilities}</div>
                        <div className="card" style={{ padding: '15px', color: summary.unassignedCount > 0 ? '#e53e3e' : 'inherit' }}>
                            <strong>Sin Asignar:</strong><br/>{summary.unassignedCount} tareas
                        </div>
                        <div className="card" style={{ padding: '15px', gridColumn: 'span 2' }}>
                          <strong>Prioridades:</strong><br/>
                          {Object.entries(summary.priorityDistribution).map(([p, count]: any) => `${p}: ${count} `)}
                        </div>
                        
                        <div className="card" style={{ padding: '15px', gridColumn: 'span 4' }}>
                          <strong>Carga y Progreso por Integrante:</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                             {summary.workload.map((data: any) => (
                                 <div key={data.name} style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{data.name}</span>
                                        <span style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '0.85rem' }}>{data.progress}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '8px' }}>
                                        <div style={{ height: '100%', width: `${data.progress}%`, background: 'var(--primary-color)', transition: 'width 0.5s ease' }}></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <span>📋 {data.tasks} t</span>
                                        <span>✅ {data.done} f</span>
                                        <span>⏱️ {data.time}h</span>
                                    </div>
                                 </div>
                             ))}
                          </div>
                        </div>
                    </div>
                )}
                
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Upload size={20} /> Cargar Jira.csv</h3>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".csv" />
                <button className="btn" onClick={() => fileInputRef.current?.click()} style={{ background: 'var(--primary-color)', color: 'white' }}>Seleccionar Archivo</button>
                
                <div style={{ marginTop: '2rem' }}>
                    <button className="btn" onClick={handleCalculate} style={{ background: 'var(--primary-color)', color: 'white' }}><TrendingUp size={16} /> Ejecutar Calificación</button>
                </div>
            </>
          ) : (
            <p>Seleccione un equipo del panel izquierdo para comenzar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
