'use client';
import { useState, useEffect } from 'react';
import { Paper, Group, Button, Table, Title, Text, NativeSelect, Box, Badge, SimpleGrid, Modal, Stack, Tooltip, TextInput } from '@mantine/core';
// @ts-expect-error
import IconChartBar from '@tabler/icons-react/dist/esm/icons/IconChartBar';
// @ts-expect-error
import IconDownload from '@tabler/icons-react/dist/esm/icons/IconDownload';
// @ts-expect-error
import IconEye from '@tabler/icons-react/dist/esm/icons/IconEye';
// @ts-expect-error
import IconArrowUp from '@tabler/icons-react/dist/esm/icons/IconArrowUp';
// @ts-expect-error
import IconArrowDown from '@tabler/icons-react/dist/esm/icons/IconArrowDown';
// @ts-expect-error
import IconSearch from '@tabler/icons-react/dist/esm/icons/IconSearch';
import { getCursos, getBimestres, calcularHoras, getDetalleAlumnoBimestre } from '../actions';
import SearchableSelect from '@/components/SearchableSelect';

export default function ComputoPanel() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [bimestres, setBimestres] = useState<any[]>([]);
  const [selectedBimestre, setSelectedBimestre] = useState<number>(1);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detalle, setDetalle] = useState<any>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filtro, setFiltro] = useState('');

  useEffect(() => { getCursos().then(setCursos); getBimestres().then(setBimestres); }, []);
  const handleCalcular = async () => { if (!selectedCursoId) return; setLoading(true); setResultado(await calcularHoras(selectedCursoId, selectedBimestre)); setLoading(false); };

  const verDetalle = async (userId: number, firstName: string, lastName: string) => {
    if (!selectedCursoId) return;
    setDetalleLoading(true);
    const data = await getDetalleAlumnoBimestre(selectedCursoId, userId, selectedBimestre);
    setDetalle({ ...data, userId, firstName, lastName });
    setDetalleLoading(false);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const exportCSV = () => {
    if (!resultado?.alumnos) return;
    const lines = resultado.alumnos.map((a: any) => `"${a.last_name}","${a.first_name}",${a.dias_presentes},${a.dias_tardias},${a.dias_retiro},${a.dias_ausente},${a.horas_reloj},${a.horas_catedra},${a.faltas_totales},${a.porcentaje}`);
    const csv = ['Apellido,Nombre,Presentes,Tardias,Retiro,Ausente,Hs Reloj,Hs Catedra,Faltas,%', ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'computo_horas.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const estadoColor = (estado: string) => {
    const map: Record<string, string> = { presente: 'green', tardia: 'orange', retiro_anticipado: 'yellow', ausente: 'red', no_laborable: 'gray' };
    return map[estado] || 'gray';
  };
  const estadoLabel = (estado: string) => {
    const map: Record<string, string> = { presente: 'Presente', tardia: 'Tard�a', retiro_anticipado: 'Retiro Ant.', ausente: 'Ausente', no_laborable: 'No laborable' };
    return map[estado] || estado;
  };
  const diasSemana = ['', 'Lun', 'Mar', 'Mi�', 'Jue', 'Vie', 'S�b', 'Dom'];

  return (
    <Box>
      <Title order={5} mb="sm">C�mputo de Horas</Title>
      <Paper p="sm" withBorder mb="sm" radius="md">
        <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="xs" verticalSpacing="sm">
          <Box>
            <Text size="xs" fw={600} mb={4}>Curso</Text>
            <SearchableSelect options={cursos.map((c: any) => ({ value: c.id, label: `${c.nombre} - ${c.especialidad_nombre} (${c.anio}/${c.division})` }))} value={selectedCursoId} onChange={setSelectedCursoId} placeholder="Curso..." />
          </Box>
          <NativeSelect label="Bimestre" size="xs" data={bimestres.map((b: any) => `Bimestre ${b.bimestre}`)} value={`Bimestre ${selectedBimestre}`} onChange={(e) => setSelectedBimestre(parseInt(e.currentTarget.value.replace('Bimestre ', '')))} />
          <Button size="xs" leftSection={<IconChartBar size={13} />} onClick={handleCalcular} disabled={loading || !selectedCursoId} mt={22}>{loading ? 'Calculando...' : 'Calcular'}</Button>
        </SimpleGrid>
      </Paper>

      {resultado?.error && <Paper p="sm" withBorder mb="sm" radius="md" bg="red.0" c="red.7"><Text size="sm">{resultado.error}</Text></Paper>}

      {resultado?.alumnos && (
        <>
          <Group justify="space-between" mb="sm">
            <Text size="xs" c="dimmed">
              Bim {resultado.bimestre}: {new Date(resultado.start_date).toLocaleDateString()} - {new Date(resultado.end_date).toLocaleDateString()}
              &nbsp;|&nbsp;D�as: {resultado.dias_habiles} | Sin clase: {resultado.dias_sin_clase} | Salidas: {resultado.dias_salida_didactica}
              &nbsp;|&nbsp;Hs reloj: {resultado.total_hs_reloj_bimestre} | Hs c�t: {resultado.total_hs_catedra_bimestre}
            </Text>
            <Button size="xs" variant="light" leftSection={<IconDownload size={12} />} onClick={exportCSV}>CSV</Button>
          </Group>

          <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <Box className="table-scroll">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    {['last_name', 'first_name', 'dias_presentes', 'dias_tardias', 'dias_retiro', 'dias_ausente', 'horas_reloj', 'horas_catedra', 'faltas_totales', 'porcentaje', ''].map((k, i) => (
                      k ? <Table.Th key={k} ta={i >= 2 ? 'center' : undefined}
                        style={k !== 'porcentaje' ? { cursor: 'pointer', userSelect: 'none' } : {}}
                        onClick={() => k !== 'porcentaje' && handleSort(k)}>
                        <Group gap={2} justify={i >= 2 ? 'center' : 'flex-start'} wrap="nowrap">
                          {['last_name','first_name','dias_presentes','dias_tardias','dias_retiro','dias_ausente','horas_reloj','horas_catedra','faltas_totales','porcentaje'][i]}
                          {sortKey === k ? (sortDir === 'asc' ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />) : <Box w={11} />}
                        </Group>
                      </Table.Th> : <Table.Th key="act" w={50}></Table.Th>
                    ))}
                  </Table.Tr>
                  <Table.Tr>
                    <Table.Th colSpan={2}><TextInput size="xs" placeholder="Filtrar..." value={filtro} onChange={e => setFiltro(e.currentTarget.value)} leftSection={<IconSearch size={12} />} styles={{ input: { fontSize: '0.7rem', minHeight: 26, height: 26 } }} /></Table.Th>
                    <Table.Th colSpan={9}></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {[...resultado.alumnos]
                    .filter(a => `${a.last_name} ${a.first_name}`.toLowerCase().includes(filtro.toLowerCase()))
                    .sort((a, b) => {
                      if (!sortKey) return 0;
                      const av = a[sortKey], bv = b[sortKey];
                      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
                      const as = String(av || '').toLowerCase(), bs = String(bv || '').toLowerCase();
                      if (as < bs) return sortDir === 'asc' ? -1 : 1;
                      if (as > bs) return sortDir === 'asc' ? 1 : -1;
                      return 0;
                    })
                    .map((a: any) => (
                      <Table.Tr key={a.user_id} style={{ cursor: 'pointer' }}>
                        <Table.Td><Text size="sm">{a.last_name}</Text></Table.Td>
                        <Table.Td><Text size="sm">{a.first_name}</Text></Table.Td>
                        <Table.Td ta="center"><Text size="sm" c="green" fw={600}>{a.dias_presentes}</Text></Table.Td>
                        <Table.Td ta="center"><Text size="sm" c="orange" fw={600}>{a.dias_tardias}</Text></Table.Td>
                        <Table.Td ta="center"><Text size="sm" c="yellow" fw={600}>{a.dias_retiro}</Text></Table.Td>
                        <Table.Td ta="center"><Text size="sm" c="red" fw={600}>{a.dias_ausente}</Text></Table.Td>
                        <Table.Td ta="center"><Text size="sm">{a.horas_reloj}</Text></Table.Td>
                        <Table.Td ta="center"><Text size="sm">{a.horas_catedra}</Text></Table.Td>
                        <Table.Td ta="center"><Text size="sm">{a.faltas_totales}</Text></Table.Td>
                        <Table.Td ta="center">
                          <Badge color={a.porcentaje >= 80 ? 'green' : a.porcentaje >= 60 ? 'yellow' : 'red'} variant="light" size="sm">{a.porcentaje}%</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Tooltip label="Ver detalle diario">
                            <Button variant="subtle" size="compact-xs" onClick={() => verDetalle(a.user_id, a.first_name, a.last_name)}><IconEye size={13} /></Button>
                          </Tooltip>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Paper>
        </>
      )}

      <Modal opened={!!detalle && !detalleLoading} onClose={() => setDetalle(null)} title={detalle ? `${detalle.firstName} ${detalle.lastName}` : ''} size="lg">
        {detalle && !detalleLoading && (
          <Stack gap="md">
            <SimpleGrid cols={5} spacing="xs">
              <Paper p="xs" withBorder radius="md" ta="center">
                <Text size="xs" c="dimmed">Presentes</Text>
                <Text fw={700} c="green">{detalle.totales.presentes}</Text>
              </Paper>
              <Paper p="xs" withBorder radius="md" ta="center">
                <Text size="xs" c="dimmed">Tard�as</Text>
                <Text fw={700} c="orange">{detalle.totales.tardias}</Text>
              </Paper>
              <Paper p="xs" withBorder radius="md" ta="center">
                <Text size="xs" c="dimmed">Retiro Ant.</Text>
                <Text fw={700} c="yellow">{detalle.totales.retiro}</Text>
              </Paper>
              <Paper p="xs" withBorder radius="md" ta="center">
                <Text size="xs" c="dimmed">Ausentes</Text>
                <Text fw={700} c="red">{detalle.totales.ausentes}</Text>
              </Paper>
              <Paper p="xs" withBorder radius="md" ta="center">
                <Text size="xs" c="dimmed">Faltas</Text>
                <Text fw={700} c="dimmed">{detalle.totales.faltas}</Text>
              </Paper>
            </SimpleGrid>

            <Box className="table-scroll">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>D�a</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Ingreso</Table.Th>
                    <Table.Th>Egreso</Table.Th>
                    <Table.Th>Justificaci�n</Table.Th>
                    <Table.Th>Falta</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {detalle.dias.map((d: any) => (
                    <Table.Tr key={d.fecha}>
                      <Table.Td><Text size="sm">{new Date(d.fecha).toLocaleDateString()}</Text></Table.Td>
                      <Table.Td><Text size="sm">{diasSemana[d.dia]}</Text></Table.Td>
                      <Table.Td>
                        <Badge color={estadoColor(d.estado)} variant="light" size="sm">{estadoLabel(d.estado)}</Badge>
                      </Table.Td>
                      <Table.Td><Text size="sm">{d.hora_ingreso || '-'}</Text></Table.Td>
                      <Table.Td><Text size="sm">{d.hora_egreso || '-'}</Text></Table.Td>
                      <Table.Td>
                        {d.justificacion ? <Group gap={4}><Badge color="cyan" variant="light" size="xs">Justif.</Badge><Text size="sm">{d.justificacion}</Text></Group> : <Text size="sm">-</Text>}
                      </Table.Td>
                      <Table.Td><Text size="sm">{d.falta > 0 ? d.falta : <Badge color="gray" variant="light" size="xs">Justif</Badge>}</Text></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
