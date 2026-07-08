'use client';

import { useState } from 'react';
import { Accordion, Text } from '@mantine/core';
import { Line } from 'react-chartjs-2';
import StudentEvolutionChart from './StudentEvolutionChart';
import DashboardCharts from './DashboardCharts';

const tabStyle = (active: boolean) => ({
  padding: '8px 18px',
  border: 'none',
  background: active ? 'var(--primary-color)' : 'transparent',
  color: active ? 'white' : 'var(--text-muted)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: active ? 700 : 500,
  transition: 'all 0.15s',
});

function BurndownChart({ data, title }: { data: { date: string; remaining: number; ideal: number }[]; title: string }) {
  if (!data || data.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No hay datos de burndown.</p>;
  }

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Restante',
        data: data.map(d => d.remaining),
        borderColor: '#e53e3e',
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: 'Ideal',
        data: data.map(d => d.ideal),
        borderColor: '#38a169',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const, labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
      tooltip: { enabled: false },
    },
    scales: {
      y: {
        min: 0,
        ticks: { stepSize: 1 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: 10, maxRotation: 45 },
      },
    },
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>{title}</h4>
      <div style={{ height: '260px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

export default function DashboardViews({
  evalContent, stats, isScrumMaster, reassignContent, milestones: milestonesByBim,
  burndown, distByUser, distByPriority, distByStatus, teamId, bimestre,
  individualMetrics, attendanceData, evaluationPeriods,
  currentPeriodLabel, projectMetrics, pendingDetailed, annualBurndown, bimestres,
  horarios, allDatesExtra,
}: {
  evalContent: React.ReactNode;
  stats: any[];
  isScrumMaster: boolean;
  reassignContent?: React.ReactNode;
  milestones: { bimestre: number; label: string; milestones: any[] }[];
  burndown: any[];
  distByUser: any[];
  distByPriority: any[];
  distByStatus: any[];
  teamId: number | null;
  bimestre: number | null;
  individualMetrics: any;
  attendanceData: any[];
  evaluationPeriods: any[];
  currentPeriodLabel: string;
  projectMetrics: any[];
  pendingDetailed: any[];
  annualBurndown: any[];
  bimestres: any[];
  horarios: { dia_semana: number; hs_reloj: number; hs_catedra: number; hora_inicio?: string; hora_fin?: string }[];
  allDatesExtra: Record<string, any>;
}) {
  const [tab, setTab] = useState('evaluaciones');
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const stateColor: Record<string, string> = {
    presente: '#38a169',
    ausente: '#e53e3e',
    tardia: '#d69e2e',
    retiro_anticipado: '#2b6cb0',
  };
  const stateBg: Record<string, string> = {
    presente: '#c6f6d5',
    ausente: '#fed7d7',
    tardia: '#fefcbf',
    retiro_anticipado: '#bee3f8',
  };

  const tabs = [
    { key: 'evaluaciones', label: 'Evaluaciones' },
    { key: 'hitos', label: 'Hitos' },
    { key: 'graficos', label: 'Gráficos' },
    { key: 'asistencia', label: 'Asistencia' },
    ...(isScrumMaster ? [{ key: 'reasignacion', label: 'Reasignación' }] : []),
  ];



  return (
    <div>
      {/* Pending evaluations accordion (collapsible alert) */}
      {pendingDetailed.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <Accordion variant="separated" defaultValue={null}>
            <Accordion.Item value="pendientes">
              <Accordion.Control>
                <Text size="sm" fw={600} c="red">⚠️ Tienes evaluaciones pendientes de periodos anteriores ({pendingDetailed.length})</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', borderRadius: '8px', padding: '12px' }}>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {pendingDetailed.map((p: any, i: number) => (
                      <li key={i}>
                        <strong>{p.p_label}</strong>: Falta evaluar a <strong>{p.first_name} {p.last_name}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </div>
      )}

      {(() => {
        const bimFaltas = bimestres
          .filter((b: any) => new Date(b.start_date) <= new Date())
          .map((b: any) => {
            let total = 0;
            const c = new Date(b.start_date);
            const e = new Date(b.end_date);
            while (c <= e) {
              const extra = allDatesExtra[c.toISOString().split('T')[0]] || {};
              const est = extra.estado;
              if (est === 'ausente') total += 1;
              else if (est === 'tardia') total += 0.25;
              else if (est === 'retiro_anticipado') total += 0.25;
              c.setDate(c.getDate() + 1);
            }
            return { bimestre: b.bimestre, faltas: total };
          });
        const anualFaltas = bimFaltas.reduce((s, bf) => s + bf.faltas, 0);
        const nearLimit = bimFaltas.some(bf => bf.faltas >= 4) || anualFaltas >= 16;
        if (nearLimit) {
          return (
            <div style={{ marginBottom: '1rem' }}>
              <Accordion variant="separated" defaultValue={null}>
                <Accordion.Item value="faltas">
                  <Accordion.Control>
                    <Text size="sm" fw={600} c="red">⚠️ {bimFaltas.filter(bf => bf.faltas >= 4).map(bf => `B${bf.bimestre}: ${bf.faltas.toFixed(2)} faltas`).join(' · ')}{anualFaltas >= 16 ? `${bimFaltas.some(bf => bf.faltas >= 4) ? ' · ' : ''}Anual: ${anualFaltas.toFixed(2)} faltas` : ''}</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 0' }}>
                      {bimFaltas.map(bf => (
                        <div key={bf.bimestre} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', borderRadius: '6px', background: bf.faltas >= 4 ? '#fff5f5' : 'var(--bg-color)' }}>
                          <span style={{ fontWeight: 600 }}>Bimestre {bf.bimestre}</span>
                          <span style={{ fontWeight: 700, color: bf.faltas >= 4 ? '#e53e3e' : bf.faltas >= 3 ? '#d69e2e' : '#38a169' }}>{bf.faltas.toFixed(2)} / 5 faltas</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', borderRadius: '6px', background: anualFaltas >= 16 ? '#fff5f5' : 'var(--bg-color)', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 600 }}>Acumulado anual</span>
                        <span style={{ fontWeight: 700, color: anualFaltas >= 16 ? '#e53e3e' : anualFaltas >= 15 ? '#d69e2e' : '#38a169' }}>{anualFaltas.toFixed(2)} / 20 faltas</span>
                      </div>
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </div>
          );
        }
        return null;
      })()}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={tabStyle(tab === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'evaluaciones' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
          <div className="card" style={{ overflow: 'visible' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Compañeros por Evaluar</h3>
            </div>
            {evalContent}
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>Mi Curva de Progreso</h3>
            <StudentEvolutionChart stats={stats} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '15px', textAlign: 'center' }}>
              Esta gráfica muestra tu evolución general basada en las evaluaciones de tus pares.
            </p>
          </div>
        </div>
      )}

      {tab === 'hitos' && (
        <div>
          {milestonesByBim.length === 0 || milestonesByBim.every((b: any) => b.milestones.length === 0) ? (
            <div className="card" style={{ padding: '20px' }}>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No hay hitos registrados.</p>
            </div>
          ) : (
            <Accordion variant="separated" defaultValue={null}>
              {milestonesByBim.map((b: any) => b.milestones.length > 0 && (
                <Accordion.Item key={b.bimestre} value={String(b.bimestre)}>
                  <Accordion.Control>
                    <Text size="sm" fw={600}>{b.label}</Text>
                    <Text size="xs" c="dimmed">{b.milestones.length} hitos · {b.milestones.filter((m: any) => m.progress === 100).length} completados</Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                      {b.milestones.map((m: any) => (
                        <div key={m.name} onClick={() => setSelectedMilestone(m)}
                          style={{ background: 'var(--bg-color)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform 0.1s' }}>
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
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </div>
      )}

      {/* Milestone detail modal */}
      {selectedMilestone && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedMilestone(null)}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedMilestone.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {selectedMilestone.done}/{selectedMilestone.total} tareas · {selectedMilestone.progress}% completo
                </div>
              </div>
              <button onClick={() => setSelectedMilestone(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
            </div>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ height: '100%', width: `${selectedMilestone.progress}%`, background: selectedMilestone.progress === 100 ? '#38a169' : 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedMilestone.issues && selectedMilestone.issues.length > 0 ? selectedMilestone.issues.map((issue: any) => (
                <div key={issue.key} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '8px',
                  background: issue.finalized ? 'rgba(56, 161, 105, 0.08)' : 'var(--bg-color)',
                  border: `1px solid ${issue.finalized ? '#38a169' : 'var(--border-color)'}`
                }}>
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                    background: issue.finalized ? '#38a169' : 'var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.65rem', fontWeight: 900
                  }}>
                    {issue.finalized ? '✓' : '·'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.summary || issue.key}</div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span className="badge" style={{ fontSize: '0.6rem' }}>{issue.type}</span>
                      {issue.priority && <span className="badge" style={{ fontSize: '0.6rem' }}>{issue.priority}</span>}
                      {issue.assignee && <span>{issue.assignee}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, color: issue.finalized ? '#38a169' : '#e53e3e' }}>
                    {issue.status}
                  </div>
                </div>
              )) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No hay tareas en este hito.</p>
              )}
            </div>
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '10px', background: 'var(--bg-color)', borderRadius: '8px' }}>
              <span>✅ Finalizadas: {selectedMilestone.done}</span>
              <span>⏳ Pendientes: {selectedMilestone.total - selectedMilestone.done}</span>
              <span>📋 Total: {selectedMilestone.total}</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'graficos' && (
        <DashboardCharts
          burndown={burndown}
          distByUser={distByUser}
          distByPriority={distByPriority}
          distByStatus={distByStatus}
        />
      )}

      {tab === 'asistencia' && (
        <div>
          {bimestres.length === 0 ? (
            <div className="card" style={{ padding: '20px' }}>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No tienes registros de asistencia.</p>
            </div>
          ) : (
            <Accordion variant="separated" defaultValue={null}>
              {bimestres.filter((b: any) => new Date(b.start_date) <= new Date()).map((b: any) => {
                const inferredDows = Array.from(new Set(attendanceData.map((r: any) => new Date(r.fecha).getDay())));
                const classDows = inferredDows.length > 0 ? inferredDows : horarios.map((h: any) => Number(h.dia_semana));
                let p = 0, a = 0, t = 0, ra = 0, eventCount = 0, noLabClassDays = 0, totalClassDays = 0;
                let totalHsReloj = 0, totalHsCatedra = 0, faltasTotal = 0;
                const startCursor = new Date(b.start_date);
                const endCursor = new Date(b.end_date);
                const countCursor = new Date(startCursor);
                while (countCursor <= endCursor) {
                  const dow = countCursor.getDay();
                  const key = countCursor.toISOString().split('T')[0];
                  const extra = allDatesExtra[key] || {};
                  const isClassDay = classDows.includes(dow);
                  if (isClassDay) {
                    totalClassDays++;
                    if (extra.noLaborable) {
                      noLabClassDays++;
                    } else if (extra.evento) {
                      eventCount++;
                    }
                  }
                  let estado = extra.estado || null;
                  if (estado === 'presente') p += extra.evento ? 2 : 1;
                  else if (estado === 'ausente') a++;
                  else if (estado === 'tardia') t += extra.evento ? 2 : 1;
                  else if (estado === 'retiro_anticipado') ra += extra.evento ? 2 : 1;
                  // Hours: presente=100%, tardia/retiro=75%, ausente=0%
                  if (estado && estado !== 'ausente' && isClassDay && !extra.noLaborable) {
                    const factor = estado === 'presente' ? 1 : 0.75;
                    const h = horarios.find((h: any) => Number(h.dia_semana) === dow);
                    if (h) {
                      totalHsReloj += (Number(h.hs_reloj) || 0) * factor;
                      totalHsCatedra += (Number(h.hs_catedra) || 0) * factor;
                    }
                    if (extra.evento) {
                      totalHsReloj += (Number(extra.evento.hs_reloj) || 0) * factor;
                      totalHsCatedra += (Number(extra.evento.hs_catedra) || 0) * factor;
                    }
                  }
                  if (estado === 'ausente') faltasTotal += 1;
                  else if (estado === 'tardia') faltasTotal += 0.25;
                  else if (estado === 'retiro_anticipado') faltasTotal += 0.25;
                  countCursor.setDate(countCursor.getDate() + 1);
                }

                const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                const dayNames = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi'];

                const start = new Date(b.start_date);
                const end = new Date(b.end_date);
                const months: { label: string; year: number; month: number; days: { date: Date; estado?: string; noLaborable?: any; evento?: any }[][] }[] = [];
                const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
                while (cursor <= end) {
                  const year = cursor.getFullYear();
                  const month = cursor.getMonth();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const firstDow = new Date(year, month, 1).getDay();
                  const offset = firstDow >= 1 && firstDow <= 5 ? firstDow - 1 : 0;
                  const weeks: { date: Date; estado?: string; noLaborable?: any; evento?: any }[][] = [];
                  let week: { date: Date; estado?: string; noLaborable?: any; evento?: any }[] = [];
                  for (let i = 0; i < offset; i++) week.push({ date: new Date(year, month, 0 - offset + 1 + i) });
                  for (let d = 1; d <= daysInMonth; d++) {
                    const dt = new Date(year, month, d);
                    const dow = dt.getDay();
                    if (dow === 0 || dow === 6) continue;
                    if (dt < start || dt > end) {
                      week.push({ date: dt });
                    } else {
                      const key = dt.toISOString().split('T')[0];
                      const extra = allDatesExtra[key] || {};
                      let estado = extra.estado || null;
                      week.push({ date: dt, estado, noLaborable: extra.noLaborable, evento: extra.evento });
                    }
                    if (week.length === 5) {
                      weeks.push(week);
                      week = [];
                    }
                  }
                  if (week.length > 0) {
                    while (week.length < 5) week.push({ date: new Date(year, month, daysInMonth + (week.length - 1)) });
                    weeks.push(week);
                  }
                  months.push({ label: `${monthNames[month]} ${year}`, year, month, days: weeks });
                  cursor.setMonth(cursor.getMonth() + 1);
                }

                return (
                  <Accordion.Item key={b.bimestre} value={String(b.bimestre)}>
                    <Accordion.Control>
                      <Text size="sm" fw={600}>Bimestre {b.bimestre}</Text>
                      <Text size="xs" c="dimmed">{totalClassDays} clases · {p} presentes · {a} ausentes · {t} tardías · {ra} retiros · {eventCount} eventos{faltasTotal > 0 ? ` · ` : ''}</Text>
                      {faltasTotal > 0 && <Text size="xs" fw={700} c="red">{faltasTotal.toFixed(2)} falta{faltasTotal !== 1 ? 's' : ''}</Text>}
                    </Accordion.Control>
                    <Accordion.Panel>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: '#f7fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)' }}>{totalClassDays}</div>
                          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Clases totales</div>
                        </div>
                        <div style={{ padding: '8px', background: '#f0fff4', borderRadius: '8px', border: '1px solid #c6f6d5', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38a169' }}>{p}</div>
                          <div style={{ fontSize: '0.55rem', color: '#38a169' }}>Presentes</div>
                        </div>
                        <div style={{ padding: '8px', background: '#fff5f5', borderRadius: '8px', border: '1px solid #fed7d7', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e53e3e' }}>{a}</div>
                          <div style={{ fontSize: '0.55rem', color: '#e53e3e' }}>Ausencias</div>
                        </div>
                        <div style={{ padding: '8px', background: '#fffff0', borderRadius: '8px', border: '1px solid #fefcbf', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d69e2e' }}>{t}</div>
                          <div style={{ fontSize: '0.55rem', color: '#d69e2e' }}>Tardías</div>
                        </div>
                        <div style={{ padding: '8px', background: '#ebf8ff', borderRadius: '8px', border: '1px solid #bee3f8', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2b6cb0' }}>{ra}</div>
                          <div style={{ fontSize: '0.55rem', color: '#2b6cb0' }}>Retiros</div>
                        </div>
                        <div style={{ padding: '8px', background: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d8fd', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#805ad5' }}>{eventCount}</div>
                          <div style={{ fontSize: '0.55rem', color: '#805ad5' }}>Salidas didácticas</div>
                        </div>
                        <div style={{ padding: '8px', background: '#edf2f7', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#718096' }}>{noLabClassDays}</div>
                          <div style={{ fontSize: '0.55rem', color: '#718096' }}>Feriados</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '0.75rem' }}>
                        <div style={{ padding: '6px 12px', background: 'var(--bg-color)', borderRadius: '6px', flex: 1, textAlign: 'center' }}>
                          <strong>{totalHsReloj.toFixed(1)}</strong> hs reloj cursadas
                        </div>
                        <div style={{ padding: '6px 12px', background: 'var(--bg-color)', borderRadius: '6px', flex: 1, textAlign: 'center' }}>
                          <strong>{totalHsCatedra.toFixed(1)}</strong> hs cátedra cursadas
                        </div>
                      </div>

                      {(p + a + t + ra) > 0 && (
                        <div style={{ height: '18px', display: 'flex', borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
                          {p > 0 && <div style={{ flex: p, background: '#38a169', transition: 'flex 0.3s' }} title={`${Math.round(p/(p+a+t+ra)*100)}% presente`} />}
                          {a > 0 && <div style={{ flex: a, background: '#e53e3e', transition: 'flex 0.3s' }} title={`${Math.round(a/(p+a+t+ra)*100)}% ausente`} />}
                          {t > 0 && <div style={{ flex: t, background: '#d69e2e', transition: 'flex 0.3s' }} title={`${Math.round(t/(p+a+t+ra)*100)}% tardía`} />}
                          {ra > 0 && <div style={{ flex: ra, background: '#2b6cb0', transition: 'flex 0.3s' }} title={`${Math.round(ra/(p+a+t+ra)*100)}% retiro`} />}
                    </div>)}
                      {months.map(m => (
                        <div key={`${m.year}-${m.month}`} style={{ marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>{m.label}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px' }}>
                            {dayNames.map(dn => (
                              <div key={dn} style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', padding: '2px 0' }}>{dn}</div>
                            ))}
                            {m.days.flat().map((cell, i) => {
                              const isPadding = cell.date.getMonth() !== m.month || cell.date.getFullYear() !== m.year;
                              if (!cell.estado && !cell.noLaborable && !cell.evento) {
                                if (isPadding) return <div key={i} />;
                                const isClassDay = classDows.includes(cell.date.getDay());
                                return isClassDay ? <div key={i} style={{ textAlign: 'center', padding: '10px 2px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 400, color: '#a0aec0', border: '1px solid transparent', cursor: 'pointer' }} onClick={() => setSelectedDay({ ...cell, extra: {}, key: cell.date.toISOString().split('T')[0] })}>{cell.date.getDate()}?</div> : <div key={i} />;
                              }
                              const isNoLab = !!cell.noLaborable;
                              const isEvento = !!cell.evento;
                              const hasEstado = !!cell.estado;
                              const dayNum = cell.date.getDate();
                              const cellKey = cell.date.toISOString().split('T')[0];
                              const cellExtra = allDatesExtra[cellKey] || {};
                              let color = '#718096';
                              let bg = '#e2e8f0';
                              let border = '1px solid #cbd5e0';
                              let extraStyle: any = {};
                              if (isNoLab) {
                                color = '#718096'; bg = '#e2e8f0'; border = '1px solid #cbd5e0';
                                extraStyle = { textDecoration: 'line-through', opacity: 0.7 };
                              } else if (isEvento && hasEstado) {
                                const est = cell.estado as string;
                                color = stateColor[est] || '#718096';
                                bg = stateBg[est] || '#e2e8f0';
                                border = `1px solid ${color}`;
                                extraStyle = { borderBottom: '3px solid #805ad5' };
                              } else if (isEvento) {
                                color = '#805ad5'; bg = '#e9d8fd'; border = '1px solid #d6bcfa';
                              } else if (hasEstado) {
                                const est = cell.estado as string;
                                color = stateColor[est] || '#718096';
                                bg = stateBg[est] || '#e2e8f0';
                                border = `1px solid ${color}`;
                              }
                              return (
                                <div key={i} style={{
                                  textAlign: 'center', padding: '10px 2px', borderRadius: '8px',
                                  fontSize: '0.75rem', fontWeight: 800,
                                  color, background: bg, border,
                                  cursor: 'pointer', position: 'relative',
                                  boxShadow: hasEstado || isEvento ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                  ...extraStyle,
                                }} onClick={() => setSelectedDay({ ...cell, extra: cellExtra, key: cellKey })}>
                                  {dayNum}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', padding: '8px', fontSize: '0.6rem', color: 'var(--text-muted)', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#c6f6d5', border: '1px solid #38a169' }}></span> Presente</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fed7d7', border: '1px solid #e53e3e' }}></span> Ausente</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fefcbf', border: '1px solid #d69e2e' }}></span> Tardía</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#bee3f8', border: '1px solid #2b6cb0' }}></span> Retiro</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e9d8fd', border: '1px solid #805ad5' }}></span> Salida didáctica</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#e2e8f0', border: '1px solid #cbd5e0' }}></span> Feriado</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fefcbf', border: '1px solid #d69e2e', borderBottom: '3px solid #805ad5' }}></span> Asistencia + Salida</span>
                      </div>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          )}

          {selectedDay && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }} onClick={() => setSelectedDay(null)}>
              <div className="card" style={{ width: '100%', maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>
                    {selectedDay.date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => setSelectedDay(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.5rem', lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  {(selectedDay.estado || selectedDay.extra?.estado) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '6px', background: stateBg[(selectedDay.estado || selectedDay.extra?.estado) as string] || 'var(--bg-color)' }}>
                      <span style={{ fontWeight: 600 }}>Asistencia</span>
                      <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{selectedDay.estado || selectedDay.extra?.estado}</span>
                    </div>
                  )}
                  {!selectedDay.estado && !selectedDay.extra?.estado && horarios.find((hx: any) => Number(hx.dia_semana) === selectedDay.date.getDay()) && (
                    <div style={{ padding: '8px 12px', borderRadius: '6px', background: '#edf2f7', textAlign: 'center', color: '#718096', fontStyle: 'italic', fontSize: '0.8rem' }}>
                      Sin registro de asistencia
                    </div>
                  )}
                  {(selectedDay.extra?.hora_ingreso || selectedDay.extra?.hora_egreso) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-color)' }}>
                      <span style={{ fontWeight: 600 }}>Horario registrado</span>
                      <span style={{ fontWeight: 600 }}>{selectedDay.extra?.hora_ingreso ? selectedDay.extra.hora_ingreso.slice(0, 5) : '—'} a {selectedDay.extra?.hora_egreso ? selectedDay.extra.hora_egreso.slice(0, 5) : '—'}</span>
                    </div>
                  )}
                  {selectedDay.extra?.justificacion && (
                    <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--bg-color)' }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>Justificación</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedDay.extra.justificacion}</div>
                    </div>
                  )}
                  {selectedDay.noLaborable && (
                    <div style={{ padding: '8px 12px', borderRadius: '6px', background: '#e2e8f0' }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>Feriado / Sin clase</div>
                      <div style={{ color: '#718096', fontSize: '0.8rem' }}>{selectedDay.noLaborable}</div>
                    </div>
                  )}
                  {selectedDay.evento && (
                    <div style={{ padding: '8px 12px', borderRadius: '6px', background: '#e9d8fd' }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>Salida didáctica</div>
                      <div style={{ color: '#805ad5', fontSize: '0.8rem' }}>{selectedDay.evento.descripcion || selectedDay.evento.nombre || 'Evento'}</div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: '#805ad5' }}>
                        <span>{Number(selectedDay.evento.hs_reloj) || 0} hs reloj</span>
                        <span>{Number(selectedDay.evento.hs_catedra) || 0} hs cátedra</span>
                      </div>
                    </div>
                  )}
                  {(() => {
                    const de = selectedDay.estado || selectedDay.extra?.estado;
                    const dow = selectedDay.date.getDay();
                    const h = horarios.find((hx: any) => Number(hx.dia_semana) === dow);
                    if (!h) return null;
                    const baseReloj = Number(h.hs_reloj) || 0;
                    const baseCatedra = Number(h.hs_catedra) || 0;
                    const eReloj = selectedDay.evento ? Number(selectedDay.evento.hs_reloj) || 0 : 0;
                    const eCatedra = selectedDay.evento ? Number(selectedDay.evento.hs_catedra) || 0 : 0;
                    const factor = !de || de === 'ausente' ? 0 : de === 'presente' ? 1 : 0.75;
                    const totReloj = (baseReloj + eReloj) * factor;
                    const totCatedra = (baseCatedra + eCatedra) * factor;
                    const isAbsent = !de || de === 'ausente';
                    const penalty = factor > 0 && factor < 1;
                    return (
                      <div style={{ padding: '8px 12px', borderRadius: '6px', background: isAbsent ? '#fff5f5' : penalty ? '#fffff0' : '#f0fff4' }}>
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{isAbsent ? 'Horas perdidas' : 'Horas contabilizadas'}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span>{totReloj.toFixed(1)} hs reloj</span>
                          <span>{totCatedra.toFixed(1)} hs cátedra</span>
                        </div>
                        {isAbsent && (
                          <div style={{ fontSize: '0.7rem', color: '#e53e3e', marginTop: '4px' }}>
                            Sin asistencia registrada — 0 horas
                          </div>
                        )}
                        {penalty && (
                          <div style={{ fontSize: '0.7rem', color: '#d69e2e', marginTop: '4px' }}>
                            Penalización 75% por {de === 'tardia' ? 'tardía' : 'retiro anticipado'}
                          </div>
                        )}
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Horario cátedra: {h.hora_inicio?.slice(0, 5) || '—'} a {h.hora_fin?.slice(0, 5) || '—'} · {baseReloj} hs reloj / {baseCatedra} hs cátedra
                        </div>
                      </div>
                    );
                  })()}
                  {selectedDay.extra?.falta && (
                    <div style={{ padding: '8px 12px', borderRadius: '6px', background: '#fff5f5' }}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>Falta registrada</div>
                      <div style={{ color: '#e53e3e', fontSize: '0.8rem' }}>{selectedDay.extra.falta.motivo || `Tipo ${selectedDay.extra.falta.tipo}`}</div>
                    </div>
                  )}
                  {!selectedDay.estado && !selectedDay.extra?.estado && !selectedDay.noLaborable && !selectedDay.evento && !selectedDay.extra?.falta && !horarios.find((hx: any) => Number(hx.dia_semana) === selectedDay.date.getDay()) && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Sin información adicional</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'reasignacion' && reassignContent && (
        <div className="card">
          {reassignContent}
        </div>
      )}
    </div>
  );
}
