'use client';
import { useState, useEffect, useMemo } from 'react';
import { Title, Text, Paper, Group, NativeSelect, Button, Table, Badge, SimpleGrid, Card, ThemeIcon, Avatar, Box, Tabs, Alert, Modal, Stack, Divider, Tooltip, ActionIcon } from '@mantine/core';
// @ts-expect-error - direct icon import
import IconFileSpreadsheet from '@tabler/icons-react/dist/esm/icons/IconFileSpreadsheet';
// @ts-expect-error - direct icon import
import IconDownload from '@tabler/icons-react/dist/esm/icons/IconDownload';
// @ts-expect-error - direct icon import
import IconEye from '@tabler/icons-react/dist/esm/icons/IconEye';
// @ts-expect-error - direct icon import
import IconUsers from '@tabler/icons-react/dist/esm/icons/IconUsers';
// @ts-expect-error - direct icon import
import IconCalendar from '@tabler/icons-react/dist/esm/icons/IconCalendar';
// @ts-expect-error - direct icon import
import IconTrendingUp from '@tabler/icons-react/dist/esm/icons/IconTrendingUp';
// @ts-expect-error - direct icon import
import IconAlertCircle from '@tabler/icons-react/dist/esm/icons/IconAlertCircle';
// @ts-expect-error - direct icon import
import IconArrowUp from '@tabler/icons-react/dist/esm/icons/IconArrowUp';
// @ts-expect-error - direct icon import
import IconArrowDown from '@tabler/icons-react/dist/esm/icons/IconArrowDown';
// @ts-expect-error - direct icon import
import IconArrowsSort from '@tabler/icons-react/dist/esm/icons/IconArrowsSort';

type SortDir = 'asc' | 'desc';

function SortHeader({ label, sortKey, current, onSort }: { label: string; sortKey: string; current: { key: string; dir: SortDir } | null; onSort: (key: string) => void }) {
  const active = current?.key === sortKey;
  return (
    <Table.Th onClick={() => onSort(sortKey)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <Group gap={4} wrap="nowrap">
        <Text size="sm" fw={600}>{label}</Text>
        {active ? (
          current?.dir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />
        ) : <IconArrowsSort size={12} opacity={0.3} />}
      </Group>
    </Table.Th>
  );
}

const ESTADO_COLORS: Record<string, string> = {
  presente: 'green', ausente: 'red', tardia: 'orange', retiro_anticipado: 'yellow',
  feriado: 'gray', sin_docente: 'violet',
};
const ESTADO_LABELS: Record<string, string> = {
  presente: 'Presente', ausente: 'Ausente', tardia: 'Tardía', retiro_anticipado: 'Retiro ant.',
  feriado: 'Feriado', sin_docente: 'Sin docente',
};
const DAY_NAMES: Record<number, string> = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom' };

export default function ReferenteClient({ cursos, bimestres }: { cursos: any[]; bimestres: any[] }) {
  const [cursoId, setCursoId] = useState<number | null>(null);
  const [bimestre, setBimestre] = useState(bimestres[0]?.bimestre || 1);
  const [tab, setTab] = useState('resumen');
  const [data, setData] = useState<any>(null);
  const [anualData, setAnualData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sort, setSort] = useState<{ key: string; dir: SortDir } | null>(null);
  const [modalAlumno, setModalAlumno] = useState<any>(null);
  const [loadingModal, setLoadingModal] = useState(false);

  const loadResumen = async () => {
    if (!cursoId) return;
    setLoading(true);
    try {
      const { getResumenGlobalCurso } = await import('./actions');
      const r = await getResumenGlobalCurso(cursoId, bimestre);
      setData(r);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadAnual = async () => {
    if (!cursoId) return;
    setLoading(true);
    try {
      const { getResumenAnual } = await import('./actions');
      const r = await getResumenAnual(cursoId);
      setAnualData(r);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'anual') { loadAnual(); }
    else if (cursoId) { loadResumen(); }
  }, [cursoId, bimestre, tab]);

  const openDetalle = async (userId: number) => {
    if (!cursoId) return;
    setLoadingModal(true);
    setModalAlumno(null);
    try {
      const { getDetalleAlumnoCompleto } = await import('./actions');
      const bim = tab === 'anual' ? 1 : bimestre;
      const r = await getDetalleAlumnoCompleto(cursoId, userId, bim);
      setModalAlumno(r);
    } catch (e) { console.error(e); }
    setLoadingModal(false);
  };

  const alumnosSorted = useMemo(() => {
    const src = data?.alumnos;
    if (!src) return [];
    if (!sort) return src;
    const arr = [...src];
    arr.sort((a: any, b: any) => {
      let va = a[sort.key], vb = b[sort.key];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [data, sort]);

  const anualSorted = useMemo(() => {
    const src = anualData?.alumnos;
    if (!src) return [];
    if (!sort) return src;
    const arr = [...src];
    arr.sort((a: any, b: any) => {
      let va = a[sort.key], vb = b[sort.key];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [anualData, sort]);

  const handleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { key, dir: 'asc' };
    });
  };

  const handleExportGlobal = async () => {
    setExporting(true);
    try {
      const { exportExcelGlobal } = await import('./actions');
      const html = await exportExcelGlobal();
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'reporte_global_asistencia.xls'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    setExporting(false);
  };

  const handleExportCurso = async () => {
    if (!cursoId) return;
    setExporting(true);
    try {
      const { exportExcelCurso } = await import('./actions');
      const html = await exportExcelCurso(cursoId, bimestre);
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'reporte_curso_' + cursoId + '_b' + bimestre + '.xls'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    setExporting(false);
  };

  const renderSummaryCards = (d: any) => {
    if (!d) return null;
    return (
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" mb="md">
        <Card padding="md" radius="md" withBorder>
          <Group gap="xs" mb={2}><ThemeIcon variant="light" color="blue" size="sm" radius="md"><IconUsers size={13} /></ThemeIcon><Text size="xs" c="dimmed">Alumnos</Text></Group>
          <Text fw={700} size="lg">{d.total_alumnos}</Text>
        </Card>
        <Card padding="md" radius="md" withBorder>
          <Group gap="xs" mb={2}><ThemeIcon variant="light" color="green" size="sm" radius="md"><IconCalendar size={13} /></ThemeIcon><Text size="xs" c="dimmed">Clases</Text></Group>
          <Text fw={700} size="lg">{d.total_clases}</Text>
        </Card>
        <Card padding="md" radius="md" withBorder>
          <Group gap="xs" mb={2}><ThemeIcon variant="light" color="violet" size="sm" radius="md"><IconAlertCircle size={13} /></ThemeIcon><Text size="xs" c="dimmed">Sin docente</Text></Group>
          <Text fw={700} size="lg">{d.sin_docente}</Text>
        </Card>
        <Card padding="md" radius="md" withBorder>
          <Group gap="xs" mb={2}><ThemeIcon variant="light" color="orange" size="sm" radius="md"><IconCalendar size={13} /></ThemeIcon><Text size="xs" c="dimmed">Feriados</Text></Group>
          <Text fw={700} size="lg">{d.feriados}</Text>
        </Card>
        <Card padding="md" radius="md" withBorder>
          <Group gap="xs" mb={2}><ThemeIcon variant="light" color="teal" size="sm" radius="md"><IconTrendingUp size={13} /></ThemeIcon><Text size="xs" c="dimmed">Asistencia</Text></Group>
          <Text fw={700} size="lg">{d.promedio_asistencia}%</Text>
        </Card>
        <Card padding="md" radius="md" withBorder>
          <Group gap="xs" mb={2}><ThemeIcon variant="light" color="red" size="sm" radius="md"><IconAlertCircle size={13} /></ThemeIcon><Text size="xs" c="dimmed">Faltas</Text></Group>
          <Text fw={700} size="lg">{d.total_faltas}</Text>
        </Card>
        <Card padding="md" radius="md" withBorder>
          <Group gap="xs" mb={2}><ThemeIcon variant="light" color="cyan" size="sm" radius="md"><IconTrendingUp size={13} /></ThemeIcon><Text size="xs" c="dimmed">Horas</Text></Group>
          <Text fw={700} size="lg">{d.total_horas}</Text>
        </Card>
        <Card padding="md" radius="md" withBorder>
          <Group gap="xs" mb={2}><ThemeIcon variant="light" color="gray" size="sm" radius="md"><IconCalendar size={13} /></ThemeIcon><Text size="xs" c="dimmed">Días hábiles</Text></Group>
          <Text fw={700} size="lg">{d.dias_habiles}</Text>
        </Card>
      </SimpleGrid>
    );
  };

  const renderTable = (alumnos: any[], isAnual: boolean) => {
    const prefix = isAnual ? 'anual' : 'bim';
    return (
      <Box className="table-scroll">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={36}>#</Table.Th>
              <SortHeader label="Alumno" sortKey="last_name" current={sort} onSort={handleSort} />
              <SortHeader label="Presentes" sortKey="presentes" current={sort} onSort={handleSort} />
              <SortHeader label="Ausentes" sortKey="ausentes" current={sort} onSort={handleSort} />
              <SortHeader label="Tardías" sortKey="tardias" current={sort} onSort={handleSort} />
              <SortHeader label="Horas" sortKey="horas" current={sort} onSort={handleSort} />
              <SortHeader label="Faltas" sortKey="faltas_totales" current={sort} onSort={handleSort} />
              <SortHeader label="% Asist." sortKey="porcentaje" current={sort} onSort={handleSort} />
              <Table.Th w={60}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {alumnos.length === 0 ? (
              <Table.Tr><Table.Td colSpan={9}><Text c="dimmed" ta="center">Sin datos</Text></Table.Td></Table.Tr>
            ) : alumnos.map((a: any, i: number) => (
              <Table.Tr key={a.alumno_curso_id || i}>
                <Table.Td><Text size="sm" c="dimmed">{i + 1}</Text></Table.Td>
                <Table.Td><Text size="sm" fw={500}>{a.last_name}, {a.first_name}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.presentes}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.ausentes}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.tardias}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.horas}</Text></Table.Td>
                <Table.Td><Text size="sm">{a.faltas_totales}</Text></Table.Td>
                <Table.Td><Badge color={a.porcentaje >= 75 ? 'green' : a.porcentaje >= 50 ? 'orange' : 'red'} variant="light" size="sm">{a.porcentaje}%</Badge></Table.Td>
                <Table.Td><Button size="compact-xs" variant="light" onClick={() => openDetalle(a.user_id)}>Ver</Button></Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    );
  };
  return (
    <Box py="md" px="md" maw={1440} mx="auto">
      <Paper p="md" radius="md" mb="md" style={{ background: 'linear-gradient(135deg, #d69e2e 0%, #b7791f 100%)', color: '#fff' }}>
        <Group gap="sm" style={{ position: 'relative', zIndex: 1 }}>
          <Avatar size="md" radius="md" color="rgba(255,255,255,0.2)"><IconFileSpreadsheet size={22} /></Avatar>
          <Box>
            <Title order={3} style={{ letterSpacing: '-0.03em' }}>Panel Referente</Title>
            <Text size="xs" opacity={0.8}>Seguimiento global y exportación de asistencia</Text>
          </Box>
        </Group>
      </Paper>

      <Paper p="md" radius="md" withBorder mb="md">
        <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="sm">
          <NativeSelect label="Curso" size="sm"
            data={[{ label: 'Todos los cursos (exportación global)', value: '' }, ...cursos.map((c: any) => ({ label: c.nombre + ' - ' + c.especialidad_nombre + ' (' + c.anio + '/' + c.division + ')', value: String(c.id) }))]}
            value={String(cursoId || '')} onChange={(e) => setCursoId(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)} />
          <NativeSelect label="Bimestre" size="sm" value={String(bimestre)}
            data={bimestres.map((b: any) => ({ label: 'Bimestre ' + b.bimestre, value: String(b.bimestre) }))}
            onChange={(e) => setBimestre(parseInt(e.currentTarget.value))} />
          <Box />
          <Group gap="sm" mt={22}>
            <Button leftSection={<IconDownload size={14} />} size="sm" variant="light" loading={exporting} onClick={handleExportGlobal}>Exportar global</Button>
            {cursoId && <Button leftSection={<IconDownload size={14} />} size="sm" loading={exporting} onClick={handleExportCurso}>Exportar curso</Button>}
          </Group>
        </SimpleGrid>
      </Paper>

      <Tabs value={tab} onChange={(v) => { setTab(v || 'resumen'); setSort(null); }}>
        <Tabs.List mb="md">
          <Tabs.Tab value="resumen" leftSection={<IconEye size={14} />}>Resumen</Tabs.Tab>
          <Tabs.Tab value="detalle" leftSection={<IconUsers size={14} />}>Detalle por alumno</Tabs.Tab>
          <Tabs.Tab value="anual" leftSection={<IconCalendar size={14} />}>Vista anual</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="resumen">
          {!cursoId ? (
            <Card padding="xl" radius="md" withBorder ta="center">
              <Text c="dimmed">Seleccioná un curso y bimestre para ver el resumen</Text>
            </Card>
          ) : loading ? (
            <Text c="dimmed" ta="center" py="md">Cargando...</Text>
          ) : data?.error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow">{data.error}</Alert>
          ) : data ? (
            <>
              {renderSummaryCards(data)}
              <Paper p="md" radius="md" withBorder>
                <Group gap="sm" mb="sm">
                  <IconEye size={16} />
                  <Title order={5}>Alumnos - Bimestre {bimestre}</Title>
                  <Badge variant="light" color="violet" size="sm">{data.total_clases} clases</Badge>
                </Group>
                {renderTable(alumnosSorted, false)}
              </Paper>
            </>
          ) : null}
        </Tabs.Panel>

        <Tabs.Panel value="detalle">
          {!cursoId ? (
            <Card padding="xl" radius="md" withBorder ta="center">
              <Text c="dimmed">Seleccioná un curso y bimestre para ver el detalle</Text>
            </Card>
          ) : loading ? (
            <Text c="dimmed" ta="center" py="md">Cargando...</Text>
          ) : data?.error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow">{data.error}</Alert>
          ) : data ? (
            <Paper p="md" radius="md" withBorder>
              <Group gap="sm" mb="sm">
                <IconUsers size={16} />
                <Title order={5}>Detalle por alumno</Title>
                <Badge variant="light" color="violet" size="sm">{data.total_alumnos} alumnos</Badge>
              </Group>
              {renderTable(alumnosSorted, false)}
            </Paper>
          ) : null}
        </Tabs.Panel>

        <Tabs.Panel value="anual">
          {!cursoId ? (
            <Card padding="xl" radius="md" withBorder ta="center">
              <Text c="dimmed">Seleccioná un curso para ver el resumen anual</Text>
            </Card>
          ) : loading ? (
            <Text c="dimmed" ta="center" py="md">Cargando...</Text>
          ) : anualData?.error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="yellow">{anualData.error}</Alert>
          ) : anualData ? (
            <>
              {renderSummaryCards(anualData)}
              {anualData.bimestres?.map((b: any, i: number) => (
                <Paper key={i} p="md" radius="md" withBorder mb="sm">
                  <Group gap="sm" mb="sm">
                    <Title order={6}>Bimestre {b.bimestre}</Title>
                    <Badge variant="light" color="green" size="sm">{b.total_clases} clases</Badge>
                    <Badge variant="light" color="orange" size="sm">{b.promedio_asistencia}% asis.</Badge>
                  </Group>
                  <Text size="xs" c="dimmed" mb="xs">
                    Clases: {b.total_clases} | Sin docente: {b.sin_docente} | Feriados: {b.feriados} | Horas: {b.total_horas}
                  </Text>
                </Paper>
              ))}
              <Paper p="md" radius="md" withBorder>
                <Group gap="sm" mb="sm">
                  <IconCalendar size={16} />
                  <Title order={5}>Resumen anual</Title>
                  <Badge variant="light" color="violet" size="sm">{anualData.total_clases} clases</Badge>
                </Group>
                {renderTable(anualSorted, true)}
              </Paper>
            </>
          ) : null}
        </Tabs.Panel>
      </Tabs>

      <Modal opened={!!modalAlumno} onClose={() => setModalAlumno(null)} title="Detalle del alumno" size="xl">
        {loadingModal ? (
          <Text c="dimmed" py="md">Cargando...</Text>
        ) : modalAlumno?.error ? (
          <Alert color="yellow" icon={<IconAlertCircle size={16} />}>{modalAlumno.error}</Alert>
        ) : modalAlumno ? (
          <Stack gap="md">
            <Paper p="sm" radius="md" withBorder>
              <Title order={6} mb="xs">Datos personales</Title>
              <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
                {[
                  ['Nombre', modalAlumno.user?.first_name + ' ' + modalAlumno.user?.last_name],
                  ['Email', modalAlumno.user?.email],
                  ['DNI', modalAlumno.user?.dni],
                  ['Teléfono', modalAlumno.user?.telefono],
                  ['Tel. alternativo', modalAlumno.user?.telefono_alternativo],
                  ['Fecha nac.', modalAlumno.user?.fecha_nacimiento?.substring(0,10)],
                  ['Dirección', modalAlumno.user?.direccion],
                  ['CUIL', modalAlumno.user?.cuil],
                  ['Nacionalidad', modalAlumno.user?.nacionalidad],
                  ['Género', modalAlumno.user?.genero],
                ].map(([l, v]) => v ? <Text key={l as string} size="xs"><strong>{l}:</strong> {v}</Text> : null)}
              </SimpleGrid>
            </Paper>
            <Paper p="sm" radius="md" withBorder>
              <Group gap="sm" mb="xs">
                <Title order={6}>Asistencia</Title>
                <Badge size="sm" color="green">Presentes: {modalAlumno.presentes}</Badge>
                <Badge size="sm" color="red">Ausentes: {modalAlumno.ausentes}</Badge>
                <Badge size="sm" color="orange">Tardías: {modalAlumno.tardias}</Badge>
                <Badge size="sm" color="cyan">Horas: {modalAlumno.horas_acumuladas}</Badge>
                <Badge size="sm" color="violet">Faltas: {modalAlumno.faltas_totales}</Badge>
              </Group>
              <Box className="table-scroll" style={{ maxHeight: 400 }}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={100}>Fecha</Table.Th>
                      <Table.Th w={50}>Día</Table.Th>
                      <Table.Th w={100}>Estado</Table.Th>
                      <Table.Th w={70}>Hs.Reloj</Table.Th>
                      <Table.Th w={60}>Ingreso</Table.Th>
                      <Table.Th w={60}>Egreso</Table.Th>
                      <Table.Th>Justificación</Table.Th>
                      <Table.Th w={60}>Falta</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {modalAlumno.dias?.length === 0 ? (
                      <Table.Tr><Table.Td colSpan={8}><Text c="dimmed" ta="center">Sin datos</Text></Table.Td></Table.Tr>
                    ) : modalAlumno.dias.map((d: any, i: number) => {
                      if (d.isEvento) return null;
                      const estado = d.estado;
                      return (
                        <Table.Tr key={i}>
                          <Table.Td><Text size="sm">{d.fecha}</Text></Table.Td>
                          <Table.Td><Text size="sm">{DAY_NAMES[d.diaSem] || ''}</Text></Table.Td>
                          <Table.Td>{estado ? <Badge size="sm" color={ESTADO_COLORS[estado] || 'gray'} variant="light">{ESTADO_LABELS[estado] || estado}</Badge> : <Text size="sm" c="dimmed">—</Text>}</Table.Td>
                          <Table.Td><Text size="sm">{d.hsReloj}</Text></Table.Td>
                          <Table.Td><Text size="sm">{d.hora_ingreso || '—'}</Text></Table.Td>
                          <Table.Td><Text size="sm">{d.hora_egreso || '—'}</Text></Table.Td>
                          <Table.Td><Text size="sm">{d.justificacion || '—'}</Text></Table.Td>
                          <Table.Td><Text size="sm">{d.falta > 0 ? d.falta : '—'}</Text></Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Box>
            </Paper>
          </Stack>
        ) : null}
      </Modal>
    </Box>
  );
}
