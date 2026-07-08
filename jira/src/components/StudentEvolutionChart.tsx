'use client';

import { useRef, useEffect } from 'react';
import { Line, getElementAtEvent } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

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

export default function StudentEvolutionChart({ stats }: any) {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.resize();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [stats]);

  if (!stats || stats.length === 0) {
    return <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No hay datos suficientes para generar la curva.</div>;
  }

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
          return parseFloat(entry.score_gen);
        }),
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 5,
        fill: true,
        spanGaps: true
      }
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 40, bottom: 10, left: 5, right: 5 }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          display: false,
          stepSize: 2,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
        afterBuildTicks: (axis: any) => {
          axis.ticks = [];
          for (let v = 0; v <= 10; v += 2) {
            axis.ticks.push({ value: v });
          }
        }
      },
      x: {
        grid: { display: false },
        ticks: { maxRotation: 30 }
      }
    },
  };

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}
