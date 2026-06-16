'use client';

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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function StudentEvolutionChart({ stats }: any) {
  if (!stats || stats.length === 0) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No hay datos suficientes para generar la curva.</div>;
  }

  // Formatear etiquetas: quitar "semana" y mes corto
  const formatLabel = (label: string) => {
    return label.replace(/semana/gi, '').replace(/enero/gi, 'Ene').replace(/febrero/gi, 'Feb').replace(/marzo/gi, 'Mar').replace(/abril/gi, 'Abr').replace(/mayo/gi, 'May').replace(/junio/gi, 'Jun').replace(/julio/gi, 'Jul').replace(/agosto/gi, 'Ago').replace(/septiembre/gi, 'Sep').replace(/octubre/gi, 'Oct').replace(/noviembre/gi, 'Nov').replace(/diciembre/gi, 'Dic').trim();
  };

  const periodLabels = Array.from(new Set(stats.map((d: any) => formatLabel(d.p_label))));

  const data = {
    labels: periodLabels,
    datasets: [
      {
        label: 'Mi Evolución',
        data: periodLabels.map(label => {
          const entry = stats.find((d: any) => formatLabel(d.p_label) === label);
          if (!entry || entry.score_gen === null) return null;
          return (parseFloat(entry.score_gen) / 4) * 10;
        }),
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        tension: 0.4,
        borderWidth: 4,
        pointRadius: 6,
        fill: true,
        spanGaps: true
      }
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: () => 'Nivel de rendimiento',
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10.2, // Un poco más de 10 para que no se corte el punto arriba
        suggestedMax: 10,
        ticks: { display: false },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    },
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
