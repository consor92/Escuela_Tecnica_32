'use client';
import { useState, useEffect } from 'react';
import { Paper, Group, Button, Table, Title, Text, TextInput, NativeSelect, ActionIcon, Box, SimpleGrid, Modal } from '@mantine/core';
// @ts-expect-error
import IconClock from '@tabler/icons-react/dist/esm/icons/IconClock';
// @ts-expect-error
import IconPlus from '@tabler/icons-react/dist/esm/icons/IconPlus';
// @ts-expect-error
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash';
import { getCursos, getHorarios, createHorario, deleteHorario } from '../actions';
import SearchableSelect from '@/components/SearchableSelect';

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function HorariosPanel() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [horarios, setHorarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ dia_semana: 1, hora_inicio: '08:00', hora_fin: '09:00', hs_reloj: 1, hs_catedra: 1 });
  useEffect(() => { getCursos().then(setCursos); }, []);
  useEffect(() => { if (selectedCursoId) { setLoading(true); getHorarios(selectedCursoId).then((data) => { setHorarios(data); setLoading(false); }); } else setHorarios([]); }, [selectedCursoId]);
  const handleCreate = async () => { if (!selectedCursoId) return; await createHorario({ ...form, curso_id: selectedCursoId }); setHorarios(await getHorarios(selectedCursoId)); };
  const handleDelete = (id: number) => setConfirmDeleteId(id);

  return (
    <Box>
      <Title order={5} mb="sm">Horarios por Curso</Title>
      <Group mb="sm">
        <SearchableSelect options={cursos.map((c: any) => ({ value: c.id, label: `${c.nombre} - ${c.especialidad_nombre} (${c.anio} / ${c.division})` }))} value={selectedCursoId} onChange={setSelectedCursoId} placeholder="Buscar curso..." width="280px" />
      </Group>

      {selectedCursoId && (
        <>
          <Paper p="sm" withBorder mb="sm" radius="md">
            <SimpleGrid cols={{ base: 2, sm: 6 }} spacing="xs" verticalSpacing="sm">
              <NativeSelect label="Día" size="xs" data={diasSemana} value={String(form.dia_semana - 1)} onChange={(e) => setForm({ ...form, dia_semana: parseInt(e.currentTarget.value) + 1 })} />
              <TextInput label="Inicio" type="time" size="xs" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.currentTarget.value })} />
              <TextInput label="Fin" type="time" size="xs" value={form.hora_fin} onChange={(e) => setForm({ ...form, hora_fin: e.currentTarget.value })} />
              <TextInput label="Hs Reloj" type="number" step="0.25" size="xs" value={form.hs_reloj} onChange={(e) => setForm({ ...form, hs_reloj: parseFloat(e.currentTarget.value) })} />
              <TextInput label="Hs Cátedra" type="number" step="0.25" size="xs" value={form.hs_catedra} onChange={(e) => setForm({ ...form, hs_catedra: parseFloat(e.currentTarget.value) })} />
              <Button size="xs" leftSection={<IconPlus size={12} />} onClick={handleCreate} mt={22}>Agregar</Button>
            </SimpleGrid>
          </Paper>

          {loading ? <Text c="dimmed" ta="center" py="md">Cargando...</Text> : (
            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
              <Box className="table-scroll">
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Día</Table.Th>
                      <Table.Th>Inicio</Table.Th>
                      <Table.Th>Fin</Table.Th>
                      <Table.Th>Hs Reloj</Table.Th>
                      <Table.Th>Hs Cát.</Table.Th>
                      <Table.Th w={60}>Acc.</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {horarios.map((h: any) => (
                      <Table.Tr key={h.id}>
                        <Table.Td><Text size="sm">{diasSemana[h.dia_semana - 1]}</Text></Table.Td>
                        <Table.Td><Text size="sm">{h.hora_inicio?.substring(0, 5)}</Text></Table.Td>
                        <Table.Td><Text size="sm">{h.hora_fin?.substring(0, 5)}</Text></Table.Td>
                        <Table.Td><Text size="sm">{h.hs_reloj}</Text></Table.Td>
                        <Table.Td><Text size="sm">{h.hs_catedra}</Text></Table.Td>
                        <Table.Td><ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(h.id)}><IconTrash size={13} /></ActionIcon></Table.Td>
                      </Table.Tr>
                    ))}
                    {horarios.length === 0 && <Table.Tr><Table.Td colSpan={6}><Text ta="center" c="dimmed" py="md">Sin horarios</Text></Table.Td></Table.Tr>}
                  </Table.Tbody>
                </Table>
              </Box>
            </Paper>
          )}
        </>
      )}
      <Modal opened={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirmar" size="xs">
        <Text size="sm" mb="md">¿Eliminar este horario?</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button size="xs" color="red" onClick={async () => { await deleteHorario(confirmDeleteId!); setConfirmDeleteId(null); if (selectedCursoId) setHorarios(await getHorarios(selectedCursoId)); }}>Eliminar</Button>
        </Group>
      </Modal>
    </Box>
  );
}
