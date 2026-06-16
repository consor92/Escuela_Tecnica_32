'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getTeamStats, getTeamComments, getTeacherEvals } from './data-actions';
import { saveTeacherEvaluations } from './actions';
import { Filter, User, Calendar, AlertCircle, Trash2, X } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Formateador global de etiquetas de periodo
const formatPeriodLabel = (label: string) => {
    return label.replace(/semana/gi, '').replace(/enero/gi, 'Ene').replace(/febrero/gi, 'Feb').replace(/marzo/gi, 'Mar').replace(/abril/gi, 'Abr').replace(/mayo/gi, 'May').replace(/junio/gi, 'Jun').replace(/julio/gi, 'Jul').replace(/agosto/gi, 'Ago').replace(/septiembre/gi, 'Sep').replace(/octubre/gi, 'Oct').replace(/noviembre/gi, 'Nov').replace(/diciembre/gi, 'Dic').trim();
};

export default function AdminModals({ 
    activeModal, 
    modalData, 
    onClose, 
    periods, 
    currentPeriodId 
}: any) {
  const [stats, setStats] = useState<any[]>([]);
  const [metric, setMetric] = useState('score_gen');
  const [comments, setComments] = useState<any[]>([]);
  const [teacherEvals, setTeacherEvals] = useState<any>({});
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriodId);
  
  const [commentFilterPeriod, setCommentFilterPeriod] = useState('');
  const [commentFilterStudent, setCommentFilterStudent] = useState('');

  useEffect(() => {
    if (activeModal === 'chart' && modalData) {
      getTeamStats(modalData.id).then(setStats);
    } else if (activeModal === 'comments' && modalData) {
      getTeamComments(modalData.id).then(setComments);
    } else if (activeModal === 'teacher' && modalData) {
      setSelectedPeriod(currentPeriodId);
      getTeacherEvals(currentPeriodId, modalData.id).then(setTeacherEvals);
    }
  }, [activeModal, modalData, currentPeriodId]);

  if (!activeModal) return null;

  const renderChart = () => {
    const periodLabels = Array.from(new Set(stats.map(d => formatPeriodLabel(d.p_label))));
    const studentNames = Array.from(new Set(stats.map(d => `${d.first_name} ${d.last_name}`)));
    
    const colors = ['#4a90e2', '#48bb78', '#ed8936', '#9f7aea', '#f56565'];

    const datasets = studentNames.map((name, i) => {
      const studentData = stats.filter(d => `${d.first_name} ${d.last_name}` === name);
      const dataValues = periodLabels.map(label => {
          const entry = studentData.find(d => formatPeriodLabel(d.p_label) === label);
          if (!entry) return null;
          const val = entry[metric];
          if (val === null) return null;
          return metric === 'score_prof' ? parseFloat(val) : (parseFloat(val) / 4) * 10;
      });

      // Alertas Críticas SIEMPRE ROJAS
      const pointStyles = dataValues.map((val, idx) => {
          if (idx > 0 && val !== null && dataValues[idx-1] !== null && (dataValues[idx-1]! - val > 2.5)) return 'crossRot';
          return 'circle';
      });

      const pointColors = dataValues.map((val, idx) => {
          if (idx > 0 && val !== null && dataValues[idx-1] !== null && (dataValues[idx-1]! - val > 2.5)) return '#ff0000';
          if (val !== null && val < 4) return '#ff0000';
          return colors[i % colors.length];
      });

      return {
        label: name,
        data: dataValues,
        borderColor: colors[i % colors.length],
        backgroundColor: colors[i % colors.length],
        tension: 0.3,
        spanGaps: true,
        pointStyle: pointStyles,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 6,
        borderWidth: 3
      };
    });

    const heatZonesPlugin = {
        id: 'heatZones',
        beforeDraw: (chart: any) => {
            const {ctx, chartArea: {left, right}, scales: {y}} = chart;
            const zones = [
                { yStart: 8.5, yEnd: 10, color: 'rgba(56, 161, 105, 0.08)', label: 'EXCELENCIA' },
                { yStart: 6, yEnd: 8.5, color: 'rgba(236, 201, 75, 0.05)', label: 'NORMAL' },
                { yStart: 0, yEnd: 4, color: 'rgba(229, 62, 62, 0.08)', label: 'ALERTA' }
            ];
            zones.forEach(z => {
                ctx.fillStyle = z.color;
                ctx.fillRect(left, y.getPixelForValue(z.yEnd), right - left, y.getPixelForValue(z.yStart) - y.getPixelForValue(z.yEnd));
            });
        }
    };

    return (
      <div className="modal" style={{ display: 'flex' }}>
        <div className="modal-content" style={{ maxWidth: '1100px' }}>
          <header style={{ background: 'var(--primary-color)', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>📈 Evolución Detallada: {modalData.name}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
          </header>
          <div style={{ padding: '15px 25px', background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
            {['score_gen', 'score_tw', 'score_dev', 'score_cw', 'score_sm', 'score_prof'].map(m => (
              <button key={m} className={`btn ${metric === m ? 'btn-primary' : ''}`} onClick={() => setMetric(m)} style={{ fontSize: '0.7rem', padding: '5px 12px' }}>
                {m.replace('score_', '').toUpperCase()}
              </button>
            ))}
          </div>
          <div style={{ padding: '30px', height: '500px' }}>
            <Line 
                data={{ labels: periodLabels, datasets }} 
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                        y: { min: 0, max: 10.2, suggestedMax: 10, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.03)' } } 
                    },
                    plugins: {
                        legend: {
                            onClick: (e, legendItem, legend) => {
                                const index = legendItem.datasetIndex;
                                const ci = legend.chart;
                                // Al hacer clic: Mostrar SOLO este dataset, o volver a mostrar todos si ya estaba solo
                                const isOnlyVisible = ci.data.datasets.every((ds, i) => i === index ? ds.hidden === false : ds.hidden === true);
                                ci.data.datasets.forEach((ds, i) => {
                                    ds.hidden = isOnlyVisible ? false : (i !== index);
                                });
                                ci.update();
                            }
                        }
                    }
                }} 
                plugins={[heatZonesPlugin]} 
            />
          </div>
        </div>
      </div>
    );
  };

  const renderComments = () => {
    const studentNames = Array.from(new Set(comments.map(c => `${c.target_fn} ${c.target_ln}`)));
    const filtered = comments.filter(c => (!commentFilterStudent || `${c.target_fn} ${c.target_ln}` === commentFilterStudent) && (!commentFilterPeriod || c.p_label === commentFilterPeriod));
    const grouped = filtered.reduce((acc: any, c: any) => { if (!acc[c.p_label]) acc[c.p_label] = []; acc[c.p_label].push(c); return acc; }, {});

    return (
      <div className="modal" style={{ display: 'flex' }}>
        <div className="modal-content" style={{ maxWidth: '850px' }}>
          <header style={{ background: 'var(--primary-color)', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>💬 Filtro de Notas: {modalData.name}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
          </header>
          <div style={{ padding: '15px 25px', display: 'flex', gap: '15px', background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
            <select value={commentFilterStudent} onChange={e => setCommentFilterStudent(e.target.value)} style={{ flex: 1 }}>
                <option value="">Todos los alumnos</option>
                {studentNames.map(n => <option key={n as string} value={n as string}>{n as string}</option>)}
            </select>
            <select value={commentFilterPeriod} onChange={e => setCommentFilterPeriod(e.target.value)} style={{ flex: 1 }}>
                <option value="">Todos los periodos</option>
                {Array.from(new Set(comments.map(c => c.p_label))).map(p => <option key={p as string} value={p as string}>{p as string}</option>)}
            </select>
          </div>
          <div style={{ padding: '30px', maxHeight: '600px', overflowY: 'auto' }}>
            {Object.keys(grouped).map(p => (
              <div key={p} style={{ marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--primary-color)' }}>{p}</h4>
                {grouped[p].map((c: any, i: number) => (
                  <div key={i} style={{ padding: '10px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: '10px', borderRadius: '8px' }}>
                    <small><strong>De: {c.eval_fn} para {c.target_fn}</strong></small>
                    <p style={{ margin: '5px 0 0 0' }}>{c.comments}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTeacherEval = () => {
    const handleSave = async (e: any) => {
        e.preventDefault();
        const evals = modalData.members.map((m: any) => ({ userId: m.id, score: teacherEvals[m.id]?.score, comments: teacherEvals[m.id]?.comments }));
        await saveTeacherEvaluations(selectedPeriod, evals);
        onClose();
    };
    const pLabel = periods.find((p:any) => p.id === selectedPeriod)?.label;
    return (
      <div className="modal" style={{ display: 'flex' }}>
        <div className="modal-content" style={{ maxWidth: '900px' }}>
          <header style={{ background: '#9f7aea', color: 'white', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><h3 style={{ margin: 0 }}>⭐ Notas del Docente</h3><p style={{ margin: 0, opacity: 0.8 }}>Periodo: <strong>{pLabel} (Actual)</strong></p></div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
          </header>
          <form onSubmit={handleSave} style={{ padding: '25px' }}>
            <table style={{ width: '100%' }}>
              <thead><tr><th>Alumno</th><th>Nota (1-10)</th><th>Feedback</th></tr></thead>
              <tbody>
                {modalData.members.map((m: any) => (
                  <tr key={m.id}>
                    <td>{m.last_name}, {m.first_name}</td>
                    <td><input type="number" step="1" min="1" max="10" value={teacherEvals[m.id]?.score || ''} onChange={(e) => setTeacherEvals({...teacherEvals, [m.id]: {...teacherEvals[m.id], score: e.target.value}})} /></td>
                    <td><input type="text" value={teacherEvals[m.id]?.comments || ''} onChange={(e) => setTeacherEvals({...teacherEvals, [m.id]: {...teacherEvals[m.id], comments: e.target.value}})} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#9f7aea', marginTop: '20px' }}>GUARDAR CALIFICACIONES</button>
          </form>
        </div>
      </div>
    );
  };

  if (activeModal === 'chart') return renderChart();
  if (activeModal === 'comments') return renderComments();
  if (activeModal === 'teacher') return renderTeacherEval();
  return null;
}
