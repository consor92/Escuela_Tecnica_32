'use client';

import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const colors = ['#3182ce', '#38a169', '#dd6b20', '#e53e3e', '#805ad5', '#d53f8c', '#00b5d8', '#718096', '#f6ad55'];

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const, labels: { font: { size: 10 }, boxWidth: 12, padding: 6 } }
  }
};

function makePieData(labels: string[], values: number[]) {
  return {
    labels,
    datasets: [{ data: values, backgroundColor: colors.slice(0, values.length), borderWidth: 0 }]
  };
}

export default function DashboardCharts({ burndown, distByUser, distByPriority, distByStatus }: {
  burndown: { date: string; remaining: number; ideal: number }[];
  distByUser: { name: string; total: number }[];
  distByPriority: { priority: string; total: number }[];
  distByStatus: { status: string; total: number }[];
}) {
  const burndownData = {
    labels: burndown.map(d => {
      const dt = new Date(d.date);
      return `${dt.getDate()}/${dt.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Reales',
        data: burndown.map(d => d.remaining),
        borderColor: '#e53e3e',
        backgroundColor: 'rgba(229, 62, 62, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 2
      },
      {
        label: 'Ideal',
        data: burndown.map(d => d.ideal),
        borderColor: '#a0aec0',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const burndownOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, labels: { font: { size: 10 }, boxWidth: 12 } }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
      x: { grid: { display: false }, ticks: { maxTicksLimit: 15 } }
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>📉 Burndown del Bimestre</h4>
        <div style={{ height: '260px' }}>
          {burndown.length > 0 ? <Line data={burndownData} options={burndownOptions} /> : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>Sin datos de Jira</p>}
        </div>
      </div>

      <div className="card">
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem' }}>📊 Distribución de Tareas</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div style={{ height: '260px', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>Por alumno</div>
            {distByUser.length > 0
              ? <Pie data={makePieData(distByUser.map(d => d.name), distByUser.map(d => d.total))} options={pieOptions} />
              : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '50px 0', fontSize: '0.75rem' }}>Sin datos</p>}
          </div>
          <div style={{ height: '260px', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>Por prioridad</div>
            {distByPriority.length > 0
              ? <Pie data={makePieData(distByPriority.map(d => d.priority), distByPriority.map(d => d.total))} options={pieOptions} />
              : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '50px 0', fontSize: '0.75rem' }}>Sin datos</p>}
          </div>
          <div style={{ height: '260px', overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center', marginBottom: '8px' }}>Por estado</div>
            {distByStatus.length > 0
              ? <Pie data={makePieData(distByStatus.map(d => d.status), distByStatus.map(d => d.total))} options={pieOptions} />
              : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '50px 0', fontSize: '0.75rem' }}>Sin datos</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
