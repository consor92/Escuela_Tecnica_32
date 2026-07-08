'use client';
import { useState, useEffect } from 'react';
import { Paper, Group, Button, Table, Title, Text, TextInput, NativeSelect, ActionIcon, Box, Tabs, Badge, SimpleGrid, Pagination, Modal } from '@mantine/core';
// @ts-expect-error
import IconCalendar from '@tabler/icons-react/dist/esm/icons/IconCalendar';
// @ts-expect-error
import IconPlus from '@tabler/icons-react/dist/esm/icons/IconPlus';
// @ts-expect-error
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash';
// @ts-expect-error
import IconArrowUp from '@tabler/icons-react/dist/esm/icons/IconArrowUp';
// @ts-expect-error
import IconArrowDown from '@tabler/icons-react/dist/esm/icons/IconArrowDown';
import { getCursos, getEventosEspeciales, createEventoEspecial, deleteEventoEspecial, getAusenciasDocente, createAusenciaDocente, deleteAusenciaDocente, getDiasNoLaborables, createDiaNoLaborable, deleteDiaNoLaborable, getDocentesCurso } from '../actions';
import SearchableSelect from '@/components/SearchableSelect';

function EventosEspecialesList({ cursoId }: { cursoId: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ fecha: '', descripcion: '', horas_reloj: 1, horas_catedra: 1 });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const load = async () => setItems(await getEventosEspeciales(cursoId));
  useEffect(() => { load(); setPage(1); }, [cursoId]);
  const addItem = async () => { if (!form.fecha || !form.descripcion) return; await createEventoEspecial({ ...form, curso_id: cursoId }); setForm({ fecha: '', descripcion: '', horas_reloj: 1, horas_catedra: 1 }); load(); };
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const filtered = items.filter(e => e.descripcion?.toLowerCase().includes(filterText.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = String(a[sortKey] || '').toLowerCase();
    const bv = String(b[sortKey] || '').toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Table.Th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort(field)}>
      <Group gap={4} wrap="nowrap">
        {children}
        {sortKey === field ? (sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />) : <Box w={12} />}
      </Group>
    </Table.Th>
  );
  return (
    <Box>
      <Paper p="sm" withBorder mb="sm" radius="md">
        <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="xs" verticalSpacing="sm">
          <TextInput label="Fecha" type="date" size="xs" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.currentTarget.value })} />
          <TextInput label="Descripci�n" size="xs" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.currentTarget.value })} />
          <TextInput label="Hs Reloj" type="number" step="0.25" size="xs" value={form.horas_reloj} onChange={(e) => setForm({ ...form, horas_reloj: parseFloat(e.currentTarget.value) })} />
          <TextInput label="Hs C�tedra" type="number" step="0.25" size="xs" value={form.horas_catedra} onChange={(e) => setForm({ ...form, horas_catedra: parseFloat(e.currentTarget.value) })} />
          <Button size="xs" leftSection={<IconPlus size={12} />} onClick={addItem} mt={22}>Agregar</Button>
        </SimpleGrid>
      </Paper>
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Box className="table-scroll">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <SortHeader field="fecha">Fecha</SortHeader>
                <SortHeader field="descripcion">Descripci�n</SortHeader>
                <SortHeader field="horas_reloj">Hs Reloj</SortHeader>
                <SortHeader field="horas_catedra">Hs C�t.</SortHeader>
                <Table.Th w={50}>Acc.</Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th colSpan={5}>
                  <TextInput size="xs" placeholder="Filtrar descripci�n..." value={filterText} onChange={e => setFilterText(e.currentTarget.value)} />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginated.map((e: any) => (
                <Table.Tr key={e.id}>
                  <Table.Td><Text size="sm">{new Date(e.fecha).toLocaleDateString()}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.descripcion}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.horas_reloj}</Text></Table.Td>
                  <Table.Td><Text size="sm">{e.horas_catedra}</Text></Table.Td>
                  <Table.Td><ActionIcon variant="subtle" color="red" size="sm" onClick={() => setConfirmDeleteId(e.id)}><IconTrash size={13} /></ActionIcon></Table.Td>
                </Table.Tr>
              ))}
              {paginated.length === 0 && <Table.Tr><Table.Td colSpan={5}><Text ta="center" c="dimmed" py="md">Sin eventos</Text></Table.Td></Table.Tr>}
            </Table.Tbody>
          </Table>
        </Box>
        {totalPages > 1 && <Group justify="center" py="sm"><Pagination total={totalPages} value={page} onChange={setPage} size="sm" /></Group>}
      </Paper>
      <Modal opened={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirmar" size="xs">
        <Text size="sm" mb="md">�Eliminar evento especial?</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button size="xs" color="red" onClick={async () => { await deleteEventoEspecial(confirmDeleteId!); setConfirmDeleteId(null); load(); }}>Eliminar</Button>
        </Group>
      </Modal>
    </Box>
  );
}

function AusenciasDocenteList({ cursoId }: { cursoId: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [form, setForm] = useState({ fecha: '', motivo: '', userId: '' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const load = async () => { setItems(await getAusenciasDocente(cursoId)); setDocentes(await getDocentesCurso(cursoId)); };
  useEffect(() => { load(); setPage(1); }, [cursoId]);
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const filtered = items.filter(a => (a.first_name ? `${a.last_name}, ${a.first_name}` : `Docente #${a.user_id}`).toLowerCase().includes(filterText.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = String(a[sortKey] || '').toLowerCase();
    const bv = String(b[sortKey] || '').toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Table.Th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort(field)}>
      <Group gap={4} wrap="nowrap">
        {children}
        {sortKey === field ? (sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />) : <Box w={12} />}
      </Group>
    </Table.Th>
  );
  return (
    <Box>
      <Paper p="sm" withBorder mb="sm" radius="md">
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs" verticalSpacing="sm">
          <TextInput label="Fecha" type="date" size="xs" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.currentTarget.value })} />
          <TextInput label="Motivo" size="xs" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.currentTarget.value })} />
          <NativeSelect label="Docente" size="xs" data={[{ label: 'Seleccionar', value: '' }, ...docentes.filter((d: any) => d.rol === 'docente').map((d: any) => ({ label: `${d.last_name}, ${d.first_name}`, value: String(d.user_id) }))]} value={form.userId} onChange={(e) => setForm({ ...form, userId: e.currentTarget.value })} />
          <Button size="xs" leftSection={<IconPlus size={12} />} onClick={async () => { if (!form.fecha || !form.userId) return; await createAusenciaDocente(cursoId, form.fecha, form.motivo, parseInt(form.userId)); setForm({ fecha: '', motivo: '', userId: '' }); load(); }} mt={22}>Agregar</Button>
        </SimpleGrid>
      </Paper>
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Box className="table-scroll">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <SortHeader field="fecha">Fecha</SortHeader>
                <SortHeader field="last_name">Docente</SortHeader>
                <SortHeader field="motivo">Motivo</SortHeader>
                <Table.Th w={50}>Acc.</Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th colSpan={4}>
                  <TextInput size="xs" placeholder="Filtrar docente..." value={filterText} onChange={e => setFilterText(e.currentTarget.value)} />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginated.map((a: any) => (
                <Table.Tr key={a.id}>
                  <Table.Td><Text size="sm">{new Date(a.fecha).toLocaleDateString()}</Text></Table.Td>
                  <Table.Td><Text size="sm">{a.first_name ? `${a.last_name}, ${a.first_name}` : `Docente #${a.user_id}`}</Text></Table.Td>
                  <Table.Td><Text size="sm">{a.motivo || '-'}</Text></Table.Td>
                  <Table.Td><ActionIcon variant="subtle" color="red" size="sm" onClick={() => setConfirmDeleteId(a.id)}><IconTrash size={13} /></ActionIcon></Table.Td>
                </Table.Tr>
              ))}
              {paginated.length === 0 && <Table.Tr><Table.Td colSpan={4}><Text ta="center" c="dimmed" py="md">Sin ausencias</Text></Table.Td></Table.Tr>}
            </Table.Tbody>
          </Table>
        </Box>
        {totalPages > 1 && <Group justify="center" py="sm"><Pagination total={totalPages} value={page} onChange={setPage} size="sm" /></Group>}
      </Paper>
      <Modal opened={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirmar" size="xs">
        <Text size="sm" mb="md">�Eliminar ausencia?</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button size="xs" color="red" onClick={async () => { await deleteAusenciaDocente(confirmDeleteId!); setConfirmDeleteId(null); load(); }}>Eliminar</Button>
        </Group>
      </Modal>
    </Box>
  );
}

function DiasNoLaborablesList({ cursoId }: { cursoId: number | null }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ fecha: '', motivo: '', tipo: 'feriado', aplica_todos: 1 });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const load = async () => setItems(await getDiasNoLaborables(cursoId || undefined));
  useEffect(() => { load(); setPage(1); }, [cursoId]);
  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const filtered = items.filter(d => d.motivo?.toLowerCase().includes(filterText.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    if (!sortKey) return 0;
    const av = String(a[sortKey] || '').toLowerCase();
    const bv = String(b[sortKey] || '').toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Table.Th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort(field)}>
      <Group gap={4} wrap="nowrap">
        {children}
        {sortKey === field ? (sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />) : <Box w={12} />}
      </Group>
    </Table.Th>
  );
  return (
    <Box>
      <Paper p="sm" withBorder mb="sm" radius="md">
        <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="xs" verticalSpacing="sm">
          <TextInput label="Fecha" type="date" size="xs" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.currentTarget.value })} />
          <TextInput label="Motivo" size="xs" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.currentTarget.value })} />
          <NativeSelect label="Tipo" size="xs" data={['Feriado', 'Paro', 'Suspensi�n']} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.currentTarget.value })} />
          <NativeSelect label="Aplica" size="xs" data={['Todos los cursos', 'Solo este curso']} value={String(form.aplica_todos)} onChange={(e) => setForm({ ...form, aplica_todos: parseInt(e.currentTarget.value) })} />
          <Button size="xs" leftSection={<IconPlus size={12} />} onClick={async () => { if (!form.fecha || !form.motivo) return; await createDiaNoLaborable({ ...form, curso_id: cursoId || undefined }); setForm({ fecha: '', motivo: '', tipo: 'feriado', aplica_todos: 1 }); load(); }} mt={22}>Agregar</Button>
        </SimpleGrid>
      </Paper>
      <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
        <Box className="table-scroll">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <SortHeader field="fecha">Fecha</SortHeader>
                <SortHeader field="motivo">Motivo</SortHeader>
                <SortHeader field="tipo">Tipo</SortHeader>
                <Table.Th>�Aplica?</Table.Th>
                <Table.Th w={50}>Acc.</Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th colSpan={5}>
                  <TextInput size="xs" placeholder="Filtrar motivo..." value={filterText} onChange={e => setFilterText(e.currentTarget.value)} />
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {paginated.map((d: any) => (
                <Table.Tr key={d.id}>
                  <Table.Td><Text size="sm">{new Date(d.fecha).toLocaleDateString()}</Text></Table.Td>
                  <Table.Td><Text size="sm">{d.motivo}</Text></Table.Td>
                  <Table.Td><Badge variant="light" color={d.tipo === 'feriado' ? 'blue' : d.tipo === 'paro' ? 'red' : 'yellow'} size="xs">{d.tipo}</Badge></Table.Td>
                  <Table.Td><Text size="sm">{d.aplica_todos ? 'Todos' : 'Este curso'}</Text></Table.Td>
                  <Table.Td><ActionIcon variant="subtle" color="red" size="sm" onClick={() => setConfirmDeleteId(d.id)}><IconTrash size={13} /></ActionIcon></Table.Td>
                </Table.Tr>
              ))}
              {paginated.length === 0 && <Table.Tr><Table.Td colSpan={5}><Text ta="center" c="dimmed" py="md">Sin d�as no laborables</Text></Table.Td></Table.Tr>}
            </Table.Tbody>
          </Table>
        </Box>
        {totalPages > 1 && <Group justify="center" py="sm"><Pagination total={totalPages} value={page} onChange={setPage} size="sm" /></Group>}
      </Paper>
      <Modal opened={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirmar" size="xs">
        <Text size="sm" mb="md">�Eliminar d�a no laborable?</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button size="xs" color="red" onClick={async () => { await deleteDiaNoLaborable(confirmDeleteId!); setConfirmDeleteId(null); load(); }}>Eliminar</Button>
        </Group>
      </Modal>
    </Box>
  );
}

export default function EventosPanel() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [subtab, setSubtab] = useState<string>('eventos');
  useEffect(() => { getCursos().then(setCursos); }, []);
  return (
    <Box>
      <Title order={5} mb="sm">Eventos y Ausencias</Title>
      <Group mb="sm">
        <SearchableSelect options={cursos.map((c: any) => ({ value: c.id, label: `${c.nombre} (${c.anio}/${c.division})` }))} value={selectedCursoId} onChange={setSelectedCursoId} placeholder="Buscar curso..." width="280px" />
      </Group>
      <Tabs value={subtab} onChange={(v) => v && setSubtab(v)} mb="sm">
        <Tabs.List>
          <Tabs.Tab value="eventos" leftSection={<IconCalendar size={13} />}>Eventos</Tabs.Tab>
          <Tabs.Tab value="ausencias" leftSection={<IconCalendar size={13} />}>Ausencias Docente</Tabs.Tab>
          <Tabs.Tab value="no_laborables" leftSection={<IconCalendar size={13} />}>No Laborables</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      {subtab === 'eventos' && selectedCursoId && <EventosEspecialesList cursoId={selectedCursoId} />}
      {subtab === 'ausencias' && selectedCursoId && <AusenciasDocenteList cursoId={selectedCursoId} />}
      {subtab === 'no_laborables' && <DiasNoLaborablesList cursoId={selectedCursoId} />}
      {!selectedCursoId && subtab !== 'no_laborables' && <Text c="dimmed" ta="center" py="md">Seleccionar un curso</Text>}
    </Box>
  );
}
