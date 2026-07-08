'use client';
import { useState } from 'react';
import { Title, Text, Paper, Group, NativeSelect, Button, Table, Badge, SimpleGrid, Card, ThemeIcon, Avatar, Box, TextInput } from '@mantine/core';
// @ts-expect-error
import IconEye from '@tabler/icons-react/dist/esm/icons/IconEye';
// @ts-expect-error
import IconCalendar from '@tabler/icons-react/dist/esm/icons/IconCalendar';
// @ts-expect-error
import IconTrendingUp from '@tabler/icons-react/dist/esm/icons/IconTrendingUp';
// @ts-expect-error
import IconUsers from '@tabler/icons-react/dist/esm/icons/IconUsers';
// @ts-expect-error
import IconRefresh from '@tabler/icons-react/dist/esm/icons/IconRefresh';
// @ts-expect-error
import IconSchool from '@tabler/icons-react/dist/esm/icons/IconSchool';
// @ts-expect-error
import IconBook from '@tabler/icons-react/dist/esm/icons/IconBook';
// @ts-expect-error
import IconArrowUp from '@tabler/icons-react/dist/esm/icons/IconArrowUp';
// @ts-expect-error
import IconArrowDown from '@tabler/icons-react/dist/esm/icons/IconArrowDown';
// @ts-expect-error
import IconSearch from '@tabler/icons-react/dist/esm/icons/IconSearch';

export default function PreceptorClient({ cursos }: { cursos: any[] }) {
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<{ resumen: any; alumnos: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filtro, setFiltro] = useState('');

  const cargar = async () => {
    if (!cursoId) return;
    setLoading(true);
    try {
      const { getResumenBimestre, getRegistrosDia } = await import('./actions');
      const fechaObj = new Date(fecha);
      const bim = Math.ceil((fechaObj.getMonth() + 1) / 3);
      const [resumen, alumnos] = await Promise.all([
        getResumenBimestre(cursoId, bim),
        getRegistrosDia(cursoId, fecha),
      ]);
      setData({ resumen, alumnos });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = data?.alumnos
    ? [...data.alumnos]
        .filter(a => `${a.last_name} ${a.first_name}`.toLowerCase().includes(filtro.toLowerCase()))
        .sort((a, b) => {
          if (!sortKey) return 0;
          const av = String(a[sortKey] || '').toLowerCase();
          const bv = String(b[sortKey] || '').toLowerCase();
          if (av < bv) return sortDir === 'asc' ? -1 : 1;
          if (av > bv) return sortDir === 'asc' ? 1 : -1;
          return 0;
        })
    : [];

  return (
    <Box py="md" px="md" maw={1440} mx="auto">
      <Paper p="md" radius="md" className="hero-gradient" mb="md"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)', color: '#fff' }}>
        <div className="hero-circle" style={{ width: 200, height: 200, top: '-60px', right: '-40px' }} />
        <div className="hero-circle" style={{ width: 150, height: 150, bottom: '-40px', left: '20%' }} />
        <Group gap="sm" style={{ position: 'relative', zIndex: 1 }}>
          <Avatar size="md" radius="md" color="rgba(255,255,255,0.2)"><IconEye size={22} /></Avatar>
          <Box>
            <Title order={3} style={{ letterSpacing: '-0.03em' }}>Panel Preceptor</Title>
            <Text size="xs" opacity={0.8}>Asistencia y seguimiento de alumnos</Text>
          </Box>
        </Group>
      </Paper>

      <Paper p="md" radius="md" withBorder mb="md">
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <NativeSelect label="Curso" size="sm"
            data={[{ label: 'Seleccionar curso', value: '' }, ...cursos.map((c: any) => ({ label: `${c.nombre} (${c.especialidad_nombre})`, value: String(c.id) }))]}
            value={String(cursoId || '')} onChange={(e) => setCursoId(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)} />
          <Box>
            <Text size="xs" fw={600} mb={4}>Fecha</Text>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.currentTarget.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--mantine-color-default-border)', height: 34, width: '100%', background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)' }} />
          </Box>
          <Button leftSection={<IconRefresh size={14} />} onClick={cargar} disabled={!cursoId} loading={loading} mt={22} size="sm">Consultar</Button>
        </SimpleGrid>
      </Paper>

      {loading && <Text c="dimmed" ta="center" py="md">Consultando...</Text>}

      {data && (
        <>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="md">
            <Card padding="md" radius="md" withBorder>
              <Group gap="xs" mb={2}>
                <ThemeIcon variant="light" color="blue" size="sm" radius="md"><IconBook size={13} /></ThemeIcon>
                <Text size="xs" c="dimmed">Bimestre</Text>
              </Group>
              <Text fw={700} size="lg">{data.resumen?.bimestre || '-'}</Text>
            </Card>
            <Card padding="md" radius="md" withBorder>
              <Group gap="xs" mb={2}>
                <ThemeIcon variant="light" color="green" size="sm" radius="md"><IconTrendingUp size={13} /></ThemeIcon>
                <Text size="xs" c="dimmed">Asistencia</Text>
              </Group>
              <Text fw={700} size="lg">{data.resumen?.porcentaje_presentes?.toFixed(1) || '-'}%</Text>
            </Card>
            <Card padding="md" radius="md" withBorder>
              <Group gap="xs" mb={2}>
                <ThemeIcon variant="light" color="red" size="sm" radius="md"><IconUsers size={13} /></ThemeIcon>
                <Text size="xs" c="dimmed">Ausentes</Text>
              </Group>
              <Text fw={700} size="lg">{data.resumen?.total_inasistencias || 0}</Text>
            </Card>
            <Card padding="md" radius="md" withBorder>
              <Group gap="xs" mb={2}>
                <ThemeIcon variant="light" color="orange" size="sm" radius="md"><IconCalendar size={13} /></ThemeIcon>
                <Text size="xs" c="dimmed">Días reg.</Text>
              </Group>
              <Text fw={700} size="lg">{data.resumen?.dias_registrados || 0}</Text>
            </Card>
          </SimpleGrid>

          <Paper p="md" radius="md" withBorder>
            <Group gap="sm" mb="sm">
              <IconCalendar size={16} />
              <Title order={5}>Asistencia del día</Title>
              <Badge variant="light" color="blue" size="sm">{new Date(fecha).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</Badge>
            </Group>
            <Box className="table-scroll">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={36}>#</Table.Th>
                    <Table.Th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('last_name')}>
                      <Group gap={4} wrap="nowrap">Alumno {sortKey === 'last_name' ? (sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />) : <Box w={12} />}</Group>
                    </Table.Th>
                    <Table.Th w={130}>Estado</Table.Th>
                    <Table.Th w={90}>Ingreso</Table.Th>
                    <Table.Th w={90}>Egreso</Table.Th>
                    <Table.Th>Justificación</Table.Th>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th>
                      <TextInput size="xs" placeholder="Filtrar..." value={filtro} onChange={e => setFiltro(e.currentTarget.value)}
                        leftSection={<IconSearch size={12} />} styles={{ input: { fontSize: '0.7rem', minHeight: 26, height: 26 } }} />
                    </Table.Th>
                    <Table.Th colSpan={4}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sorted.length === 0 ? (
                    <Table.Tr><Table.Td colSpan={6}><Text c="dimmed" ta="center" py="md">No hay alumnos inscriptos en este curso</Text></Table.Td></Table.Tr>
                  ) : sorted.map((a: any, idx: number) => (
                    <Table.Tr key={a.alumno_curso_id || idx}>
                      <Table.Td c="dimmed"><Text size="sm">{idx + 1}</Text></Table.Td>
                      <Table.Td><Text size="sm" fw={500}>{a.last_name}, {a.first_name}</Text></Table.Td>
                      <Table.Td>
                        <Badge color={a.estado === 'presente' ? 'green' : a.estado === 'ausente' ? 'red' : a.estado === 'tardia' ? 'orange' : a.estado === 'retiro_anticipado' ? 'yellow' : 'gray'} variant="light" size="sm">
                          {a.estado?.replace('_', ' ') || 'Sin registro'}
                        </Badge>
                      </Table.Td>
                      <Table.Td><Text size="sm">{a.hora_ingreso?.substring(0, 5) || '-'}</Text></Table.Td>
                      <Table.Td><Text size="sm">{a.hora_egreso?.substring(0, 5) || '-'}</Text></Table.Td>
                      <Table.Td><Text size="sm">{a.justificacion || '-'}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}
