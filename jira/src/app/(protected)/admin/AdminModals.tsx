'use client';

import { useState, useEffect } from 'react';
import { Modal, NativeSelect, Button, Text, TextInput, Group, ActionIcon, Box, Table, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { getTeamStats, getTeamComments, getTeacherEvals } from './data-actions';
import { saveTeacherEvaluations } from './actions';
// @ts-expect-error
import IconFilter from '@tabler/icons-react/dist/esm/icons/IconFilter';
// @ts-expect-error
import IconUser from '@tabler/icons-react/dist/esm/icons/IconUser';
// @ts-expect-error
import IconCalendar from '@tabler/icons-react/dist/esm/icons/IconCalendar';
// @ts-expect-error
import IconAlertCircle from '@tabler/icons-react/dist/esm/icons/IconAlertCircle';
// @ts-expect-error
import IconX from '@tabler/icons-react/dist/esm/icons/IconX';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

const formatPeriodLabel = (label: string) => {
  return label.replace(/semana/gi, '').replace(/enero/gi, 'Ene').replace(/febrero/gi, 'Feb').replace(/marzo/gi, 'Mar').replace(/abril/gi, 'Abr').replace(/mayo/gi, 'May').replace(/junio/gi, 'Jun').replace(/julio/gi, 'Jul').replace(/agosto/gi, 'Ago').replace(/septiembre/gi, 'Sep').replace(/octubre/gi, 'Oct').replace(/noviembre/gi, 'Nov').replace(/diciembre/gi, 'Dic').trim();
};

export default function AdminModals({ activeModal, modalData, onClose, periods, currentPeriodId }: any) {
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
      const pointColors = dataValues.map((val, idx) => {
        if (idx > 0 && val !== null && dataValues[idx - 1] !== null && (dataValues[idx - 1]! - val > 2.5)) return '#ff0000';
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
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 6,
        borderWidth: 3
      };
    });

    return (
      <Box>
        <Group gap="xs" mb="md">
          {['score_gen', 'score_tw', 'score_dev', 'score_cw', 'score_sm', 'score_prof'].map(m => (
            <Button key={m} size="compact-xs" variant={metric === m ? 'filled' : 'light'} onClick={() => setMetric(m)}>
              {m.replace('score_', '').toUpperCase()}
            </Button>
          ))}
        </Group>
        <Box h={500}>
          <Line
            data={{ labels: periodLabels, datasets }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { y: { min: 0, max: 10.2, ticks: { stepSize: 1 } } },
              plugins: { legend: { onClick: (_e: any, legendItem: any, legend: any) => { const ci = legend.chart; const index = legendItem.datasetIndex; const isOnlyVisible = ci.data.datasets.every((ds: any, i: number) => i === index ? !ds.hidden : ds.hidden); ci.data.datasets.forEach((ds: any, i: number) => { ds.hidden = isOnlyVisible ? false : (i !== index); }); ci.update(); } } }
            }}
          />
        </Box>
      </Box>
    );
  };

  const renderComments = () => {
    const studentNames = Array.from(new Set(comments.map(c => `${c.target_fn} ${c.target_ln}`)));
    const filtered = comments.filter(c => (!commentFilterStudent || `${c.target_fn} ${c.target_ln}` === commentFilterStudent) && (!commentFilterPeriod || c.p_label === commentFilterPeriod));
    const grouped = filtered.reduce((acc: any, c: any) => { if (!acc[c.p_label]) acc[c.p_label] = []; acc[c.p_label].push(c); return acc; }, {});
    return (
      <Box>
        <Group gap="sm" mb="md">
          <NativeSelect size="xs" data={['Todos los alumnos', ...studentNames]} value={commentFilterStudent || 'Todos los alumnos'} onChange={(e) => setCommentFilterStudent(e.currentTarget.value === 'Todos los alumnos' ? '' : e.currentTarget.value)} />
          <NativeSelect size="xs" data={['Todos los periodos', ...Array.from(new Set(comments.map(c => c.p_label)))]} value={commentFilterPeriod || 'Todos los periodos'} onChange={(e) => setCommentFilterPeriod(e.currentTarget.value === 'Todos los periodos' ? '' : e.currentTarget.value)} />
        </Group>
        <Box mah={600} style={{ overflowY: 'auto' }}>
          {Object.keys(grouped).map(p => (
            <Box key={p} mb="md">
              <Text fw={700} c="violet" mb="xs">{p}</Text>
              {grouped[p].map((c: any, i: number) => (
                <Paper key={i} p="sm" withBorder mb="xs">
                  <Text size="xs" c="dimmed"><strong>De: {c.eval_fn}</strong> para <strong>{c.target_fn}</strong></Text>
                  <Text size="sm" mt={4}>{c.comments}</Text>
                </Paper>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderTeacherEval = () => {
    const handleSave = async (e: any) => {
      e.preventDefault();
      const evals = modalData.members.map((m: any) => ({ userId: m.id, score: teacherEvals[m.id]?.score, comments: teacherEvals[m.id]?.comments }));
      await saveTeacherEvaluations(selectedPeriod, evals);
      notifications.show({ title: 'Calificaciones', message: 'Guardadas correctamente.', color: 'green' });
      onClose();
    };
    const pLabel = periods.find((p: any) => p.id === selectedPeriod)?.label;
    return (
      <form onSubmit={handleSave}>
        <Box className="table-scroll">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Alumno</Table.Th>
                <Table.Th>Nota (1-10)</Table.Th>
                <Table.Th>Feedback</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {modalData.members.map((m: any) => (
                <Table.Tr key={m.id}>
                  <Table.Td><Text size="sm">{m.last_name}, {m.first_name}</Text></Table.Td>
                  <Table.Td><TextInput size="xs" type="number" step="1" min="1" max="10" value={teacherEvals[m.id]?.score || ''} onChange={(e) => setTeacherEvals({ ...teacherEvals, [m.id]: { ...teacherEvals[m.id], score: e.target.value } })} style={{ width: 80 }} /></Table.Td>
                  <Table.Td><TextInput size="xs" value={teacherEvals[m.id]?.comments || ''} onChange={(e) => setTeacherEvals({ ...teacherEvals, [m.id]: { ...teacherEvals[m.id], comments: e.target.value } })} /></Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
        <Button type="submit" fullWidth mt="md" color="violet">Guardar Calificaciones</Button>
      </form>
    );
  };

  const modalTitle = activeModal === 'chart' ? `Evolución: ${modalData?.name}` : activeModal === 'comments' ? `Notas: ${modalData?.name}` : activeModal === 'teacher' ? 'Notas del Docente' : '';
  const modalSize = activeModal === 'chart' ? 'xl' : 'lg';

  return (
    <Modal opened={!!activeModal} onClose={onClose} title={modalTitle} size={modalSize}>
      {activeModal === 'chart' && renderChart()}
      {activeModal === 'comments' && renderComments()}
      {activeModal === 'teacher' && renderTeacherEval()}
    </Modal>
  );
}
