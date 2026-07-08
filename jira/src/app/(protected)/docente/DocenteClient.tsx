'use client';
import { useState, useEffect } from 'react';
import { Title, Text, Paper, Group, Button, Table, Badge, Alert, Flex, Box, Avatar, SimpleGrid, Tooltip, NativeSelect, TextInput, Textarea, Divider } from '@mantine/core';
// @ts-expect-error
import IconDeviceFloppy from '@tabler/icons-react/dist/esm/icons/IconDeviceFloppy';
// @ts-expect-error
import IconRefresh from '@tabler/icons-react/dist/esm/icons/IconRefresh';
// @ts-expect-error
import IconCircleCheck from '@tabler/icons-react/dist/esm/icons/IconCircleCheck';
// @ts-expect-error
import IconAlertCircle from '@tabler/icons-react/dist/esm/icons/IconAlertCircle';
// @ts-expect-error
import IconSchool from '@tabler/icons-react/dist/esm/icons/IconSchool';
// @ts-expect-error
import IconUserCheck from '@tabler/icons-react/dist/esm/icons/IconUserCheck';
// @ts-expect-error
import IconUserX from '@tabler/icons-react/dist/esm/icons/IconUserX';
// @ts-expect-error
import IconClock from '@tabler/icons-react/dist/esm/icons/IconClock';
// @ts-expect-error
import IconLogout from '@tabler/icons-react/dist/esm/icons/IconLogout';
// @ts-expect-error
import IconArrowUp from '@tabler/icons-react/dist/esm/icons/IconArrowUp';
// @ts-expect-error
import IconArrowDown from '@tabler/icons-react/dist/esm/icons/IconArrowDown';
// @ts-expect-error
import IconSearch from '@tabler/icons-react/dist/esm/icons/IconSearch';
// @ts-expect-error
import IconBell from '@tabler/icons-react/dist/esm/icons/IconBell';
// @ts-expect-error
import IconSend from '@tabler/icons-react/dist/esm/icons/IconSend';

const estados = ['presente', 'ausente', 'tardia', 'retiro_anticipado'] as const;

const estadoIcon: Record<string, React.ReactNode> = {
  presente: <IconUserCheck size={14} />,
  ausente: <IconUserX size={14} />,
  tardia: <IconClock size={14} />,
  retiro_anticipado: <IconLogout size={14} />,
};

const estadoColor: Record<string, string> = {
  presente: 'green', ausente: 'red', tardia: 'orange', retiro_anticipado: 'yellow',
};

const estadoLabel: Record<string, string> = {
  presente: 'Presente', ausente: 'Ausente', tardia: 'Tardía', retiro_anticipado: 'Retiro Ant.',
};

export default function DocenteClient({ cursos }: { cursos: any[] }) {
  const [tab, setTab] = useState('asistencia');
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [registros, setRegistros] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<'success' | 'error' | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSent, setNotifSent] = useState<'success' | 'error' | null>(null);
  const [notifHistory, setNotifHistory] = useState<any[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);

  useEffect(() => {
    if (selectedCursoId) {
      setLoadingHist(true);
      import('./actions').then(m => m.getNotificacionesEnviadas(selectedCursoId)).then(r => { setNotifHistory(r); setLoadingHist(false); }).catch(() => setLoadingHist(false));
    } else { setNotifHistory([]); }
  }, [selectedCursoId]);

  const cargarAsistencia = async () => {
    if (!selectedCursoId || !fecha) return;
    setLoading(true); setSaved(null);
    const { getAlumnosCurso, getRegistrosDia } = await import('./actions');
    const [alumnosData, registrosData] = await Promise.all([
      getAlumnosCurso(selectedCursoId),
      getRegistrosDia(selectedCursoId, fecha),
    ]);
    setAlumnos(alumnosData);
    const regMap: Record<number, any> = {};
    for (const r of registrosData) regMap[r.user_id] = { estado: r.estado, hora_ingreso: r.hora_ingreso?.substring(0, 5) || '', hora_egreso: r.hora_egreso?.substring(0, 5) || '', justificacion: r.justificacion || '', alumno_curso_id: r.alumno_curso_id };
    for (const a of alumnosData) if (!regMap[a.user_id]) regMap[a.user_id] = { estado: 'presente', hora_ingreso: '', hora_egreso: '', justificacion: '', alumno_curso_id: a.id };
    setRegistros(regMap); setLoading(false);
  };

  const updateReg = (uid: number, field: string, value: any) => setRegistros(p => ({ ...p, [uid]: { ...p[uid], [field]: value } }));

  const fillTime = (uid: number, field: string) => {
    if (registros[uid]?.[field]) return;
    const now = new Date();
    const t = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    updateReg(uid, field, t);
  };

  const handleGuardar = async () => {
    if (!selectedCursoId || !fecha) return;
    setSaving(true); setSaved(null);
    try {
      const { guardarAsistencia } = await import('./actions');
      await guardarAsistencia({
        cursoId: selectedCursoId, fecha,
        registros: Object.values(registros).map((r: any) => ({
          alumno_curso_id: r.alumno_curso_id, estado: r.estado,
          hora_ingreso: r.hora_ingreso || null, hora_egreso: r.hora_egreso || null,
          justificacion: r.justificacion || null,
        }))
      });
      setSaved('success');
    } catch { setSaved('error'); }
    setSaving(false);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sortedAlumnos = [...alumnos]
    .filter(a => `${a.last_name} ${a.first_name}`.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = String(a[sortKey] || '').toLowerCase();
      const bv = String(b[sortKey] || '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const total = alumnos.length;
  const estadosCount = { presentes: 0, ausentes: 0, tardias: 0 };
  Object.values(registros).forEach((r: any) => {
    if (r?.estado === 'presente') estadosCount.presentes++;
    else if (r?.estado === 'ausente') estadosCount.ausentes++;
    else if (r?.estado === 'tardia' || r?.estado === 'retiro_anticipado') estadosCount.tardias++;
  });

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Table.Th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort(field)}>
      <Group gap={4} wrap="nowrap">
        {children}
        {sortKey === field ? (sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />) : <Box w={12} />}
      </Group>
    </Table.Th>
  );

  return (
    <Box py="md" px="md" maw={1440} mx="auto">
      <Paper p="xs" radius="md" mb="md"
        style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)', color: '#fff' }}>
        <Group gap="xs" style={{ position: 'relative', zIndex: 1 }}>
          <Avatar size="sm" radius="md" color="rgba(255,255,255,0.2)"><IconSchool size={18} /></Avatar>
          <Box>
            <Title order={5} style={{ letterSpacing: '-0.03em' }}>Panel Docente</Title>
            <Text size="xs" opacity={0.8}>Tomá asistencia y gestioná notificaciones</Text>
          </Box>
        </Group>
      </Paper>

      <Group gap={4} mb="md">
        <Button size="xs" variant={tab === 'asistencia' ? 'filled' : 'outline'} onClick={() => setTab('asistencia')} leftSection={<IconUserCheck size={14} />}>Registrar Asistencia</Button>
        <Button size="xs" variant={tab === 'notificaciones' ? 'filled' : 'outline'} onClick={() => setTab('notificaciones')} leftSection={<IconBell size={14} />}>Notificaciones</Button>
      </Group>

      {tab === 'asistencia' && (
      <Paper p="md" radius="md" withBorder>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <NativeSelect label="Curso" size="sm"
            data={[{ label: 'Seleccionar curso', value: '' }, ...cursos.map((c: any) => ({ label: `${c.nombre} - ${c.especialidad_nombre} (${c.anio} / ${c.division})`, value: String(c.id) }))]}
            value={String(selectedCursoId || '')} onChange={(e) => setSelectedCursoId(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)} />
          <Box>
            <Text size="xs" fw={600} mb={4}>Fecha</Text>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.currentTarget.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--mantine-color-default-border)', height: 34, width: '100%', background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)' }} />
          </Box>
          <Button leftSection={<IconRefresh size={14} />} onClick={cargarAsistencia} disabled={!selectedCursoId || !fecha} loading={loading} mt={22}>
            Cargar Alumnos
          </Button>
        </SimpleGrid>

        {alumnos.length > 0 && !loading && (
          <Group gap="xs" mt="sm">
            <Badge size="sm" variant="dot" color="blue">Total: {total}</Badge>
            <Badge size="sm" variant="dot" color="green">Presentes: {estadosCount.presentes}</Badge>
            <Badge size="sm" variant="dot" color="red">Ausentes: {estadosCount.ausentes}</Badge>
            <Badge size="sm" variant="dot" color="orange">Tardías: {estadosCount.tardias}</Badge>
          </Group>
        )}

        {loading && <Text c="dimmed" ta="center" py="md">Cargando alumnos...</Text>}

        {!loading && alumnos.length > 0 && (
          <>
            <Box className="table-scroll" mt="sm">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={36}>#</Table.Th>
                    <SortHeader field="last_name">Alumno</SortHeader>
                    <Table.Th w={360}>Estado</Table.Th>
                    <Table.Th w={100}>Ingreso</Table.Th>
                    <Table.Th w={100}>Egreso</Table.Th>
                    <Table.Th>Justificación</Table.Th>
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th></Table.Th>
                    <Table.Th>
                      <TextInput size="xs" placeholder="Filtrar..." value={filterText} onChange={e => setFilterText(e.currentTarget.value)}
                        leftSection={<IconSearch size={12} />} styles={{ input: { fontSize: '0.7rem', minHeight: 26, height: 26 } }} />
                    </Table.Th>
                    <Table.Th colSpan={4}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedAlumnos.map((a: any, idx: number) => {
                    const reg = registros[a.user_id] || { estado: 'presente', hora_ingreso: '', hora_egreso: '', justificacion: '' };
                    return (
                      <Table.Tr key={a.id}>
                        <Table.Td c="dimmed"><Text size="sm">{idx + 1}</Text></Table.Td>
                        <Table.Td><Text size="sm" fw={500}>{a.last_name}, {a.first_name}</Text></Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            {estados.map(est => (
                              <Tooltip key={est} label={estadoLabel[est]}>
                                <Button size="compact-xs" variant={reg.estado === est ? 'filled' : 'outline'} color={estadoColor[est]} onClick={() => updateReg(a.user_id, 'estado', est)} px={8}>
                                  {estadoIcon[est]}
                                </Button>
                              </Tooltip>
                            ))}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <input type="time" value={reg.hora_ingreso} onFocus={() => fillTime(a.user_id, 'hora_ingreso')} onChange={(e) => updateReg(a.user_id, 'hora_ingreso', e.currentTarget.value)}
                            style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid var(--mantine-color-default-border)', width: '100%', background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)', cursor: 'pointer' }} />
                        </Table.Td>
                        <Table.Td>
                          <input type="time" value={reg.hora_egreso} onFocus={() => fillTime(a.user_id, 'hora_egreso')} onChange={(e) => updateReg(a.user_id, 'hora_egreso', e.currentTarget.value)}
                            style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid var(--mantine-color-default-border)', width: '100%', background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)', cursor: 'pointer' }} />
                        </Table.Td>
                        <Table.Td>
                          <input value={reg.justificacion} onChange={(e) => updateReg(a.user_id, 'justificacion', e.currentTarget.value)} placeholder="Justificación"
                            style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid var(--mantine-color-default-border)', width: '100%', background: 'var(--mantine-color-body)', color: 'var(--mantine-color-text)' }} />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Box>

            <Flex justify="space-between" align="center" mt="sm">
              {saved === 'success' && <Alert icon={<IconCircleCheck size={16} />} color="green" variant="light" py="xs" px="sm"><Text size="sm">Guardado</Text></Alert>}
              {saved === 'error' && <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" py="xs" px="sm"><Text size="sm">Error</Text></Alert>}
              {!saved && <Box />}
              <Button leftSection={<IconDeviceFloppy size={14} />} onClick={handleGuardar} loading={saving} size="sm">
                {saving ? 'Guardando...' : 'Guardar Asistencia'}
              </Button>
            </Flex>
          </>
        )}

        {!loading && selectedCursoId && alumnos.length === 0 && (
          <Box ta="center" py="md">
            <Text c="dimmed" size="sm">Sin alumnos en este curso</Text>
            <Text c="dimmed" size="xs">Seleccioná un curso y cargá los alumnos</Text>
          </Box>
        )}
      </Paper>
      )}

      {tab === 'notificaciones' && (
        <Paper p="md" radius="md" withBorder>
          <Title order={5} mb="sm">Enviar notificación a los alumnos</Title>
          <NativeSelect label="Curso" size="sm" mb="sm"
            data={[{ label: 'Seleccionar curso', value: '' }, ...cursos.map((c: any) => ({ label: `${c.nombre} - ${c.especialidad_nombre} (${c.anio} / ${c.division})`, value: String(c.id) }))]}
            value={String(selectedCursoId || '')} onChange={(e) => setSelectedCursoId(e.currentTarget.value ? parseInt(e.currentTarget.value) : null)} />
          <Textarea label="Mensaje" placeholder="Escribí el mensaje para los alumnos del curso..." minRows={4} mb="sm" value={notifMsg} onChange={(e) => setNotifMsg(e.currentTarget.value)} />
          <Flex justify="space-between" align="center" mb="lg">
            {notifSent === 'success' && <Alert icon={<IconCircleCheck size={16} />} color="green" variant="light" py="xs" px="sm"><Text size="sm">Notificación enviada</Text></Alert>}
            {notifSent === 'error' && <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" py="xs" px="sm"><Text size="sm">Error al enviar</Text></Alert>}
            {!notifSent && <Box />}
            <Button leftSection={<IconSend size={14} />} size="sm" disabled={!selectedCursoId || !notifMsg.trim()} loading={sendingNotif}
              onClick={async () => {
                if (!selectedCursoId || !notifMsg.trim()) return;
                setSendingNotif(true); setNotifSent(null);
                try {
                  const { enviarNotificacion } = await import('./actions');
                  await enviarNotificacion(selectedCursoId, notifMsg.trim());
                  setNotifSent('success'); setNotifMsg(''); setNotifHistory([]);
                  setNotifHistory(await (await import('./actions')).getNotificacionesEnviadas(selectedCursoId));
                } catch { setNotifSent('error'); }
                setSendingNotif(false);
              }}>
              Enviar a todos los alumnos
            </Button>
          </Flex>

          <Divider mb="sm" />
          <Title order={6} mb="sm">Notificaciones enviadas recientemente</Title>
          {loadingHist ? <Text size="xs" c="dimmed">Cargando...</Text> : notifHistory.length === 0 ? <Text size="xs" c="dimmed">Sin notificaciones enviadas aún</Text> : notifHistory.slice(0, 5).map((n: any, i: number) => (
            <Box key={i} p="xs" mb={4} style={{ borderRadius: 6, background: 'var(--mantine-color-gray-light)' }}>
              <Text size="xs" fw={600}>{n.mensaje}</Text>
              <Text size="xs" c="dimmed">{new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
