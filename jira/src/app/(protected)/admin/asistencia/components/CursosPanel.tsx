'use client';
import { useState, useEffect } from 'react';
import { Paper, Group, Button, Table, Title, Text, TextInput, NativeSelect, ActionIcon, Box, Badge, SimpleGrid, Modal } from '@mantine/core';
// @ts-expect-error
import IconPlus from '@tabler/icons-react/dist/esm/icons/IconPlus';
// @ts-expect-error
import IconPencil from '@tabler/icons-react/dist/esm/icons/IconPencil';
// @ts-expect-error
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash';
// @ts-expect-error
import IconDeviceFloppy from '@tabler/icons-react/dist/esm/icons/IconDeviceFloppy';
import { getCursos, createCurso, updateCurso, deleteCurso, getEspecialidades } from '../actions';

const turnos = ['maÃ±ana', 'tarde', 'vespertino', 'noche'];

export default function CursosPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ nombre: '', descripcion: '', anio: 1, especialidad_id: '', division: '', turno: 'maÃ±ana', ciclo_lectivo: new Date().getFullYear() });
  const load = async () => { setLoading(true); const [data, esp] = await Promise.all([getCursos(), getEspecialidades()]); setItems(data); setEspecialidades(esp); setLoading(false); };
  useEffect(() => { load(); }, []);
  const resetForm = () => setForm({ nombre: '', descripcion: '', anio: 1, especialidad_id: '', division: '', turno: 'maÃ±ana', ciclo_lectivo: new Date().getFullYear() });
  const handleCreate = async () => { if (!form.nombre || !form.especialidad_id) return; await createCurso(form); resetForm(); setShowForm(false); load(); };
  const handleUpdate = async () => { if (!form.nombre || !form.especialidad_id || !editId) return; await updateCurso(editId, form); setEditId(null); resetForm(); setShowForm(false); load(); };
  const handleDelete = (id: number) => setConfirmDeleteId(id);
  const startEdit = (item: any) => { setEditId(item.id); setForm({ nombre: item.nombre, descripcion: item.descripcion || '', anio: item.anio, especialidad_id: item.especialidad_id, division: item.division || '', turno: item.turno || 'maÃ±ana', ciclo_lectivo: item.ciclo_lectivo }); setShowForm(true); };

  return (
    <Box>
      <Group justify="space-between" mb="sm">
        <Title order={5}>Cursos</Title>
        <Button size="xs" leftSection={showForm ? null : <IconPlus size={12} />} onClick={() => { setShowForm(!showForm); setEditId(null); resetForm(); }} variant={showForm ? 'light' : 'filled'}>
          {showForm ? 'Cancelar' : 'Nuevo Curso'}
        </Button>
      </Group>

      {showForm && (
        <Paper p="sm" withBorder mb="sm" radius="md">
          <SimpleGrid cols={{ base: 1, sm: 4 }} spacing="xs">
            <TextInput label="Nombre" size="xs" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.currentTarget.value })} />
            <TextInput label="DescripciÃ³n" size="xs" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.currentTarget.value })} />
            <NativeSelect label="Grado" size="xs" data={['1Â°', '2Â°', '3Â°', '4Â°', '5Â°', '6Â°']} value={`${form.anio}Â°`} onChange={(e) => setForm({ ...form, anio: parseInt(e.currentTarget.value) })} />
            <NativeSelect label="Especialidad" size="xs" data={[{ label: 'Seleccionar...', value: '' }, ...especialidades.map((e: any) => ({ label: e.nombre, value: String(e.id) }))]} value={String(form.especialidad_id)} onChange={(e) => setForm({ ...form, especialidad_id: e.currentTarget.value })} />
            <TextInput label="DivisiÃ³n" size="xs" placeholder="1ra, 2da..." value={form.division} onChange={(e) => setForm({ ...form, division: e.currentTarget.value })} />
            <NativeSelect label="Turno" size="xs" data={turnos.map(t => t.charAt(0).toUpperCase() + t.slice(1))} value={form.turno} onChange={(e) => setForm({ ...form, turno: e.currentTarget.value })} />
            <TextInput label="Ciclo lectivo" size="xs" type="number" value={form.ciclo_lectivo} onChange={(e) => setForm({ ...form, ciclo_lectivo: parseInt(e.currentTarget.value) })} />
          </SimpleGrid>
          <Group justify="flex-end" mt="sm">
            <Button size="xs" leftSection={<IconDeviceFloppy size={12} />} onClick={editId ? handleUpdate : handleCreate}>{editId ? 'Guardar' : 'Crear'}</Button>
          </Group>
        </Paper>
      )}

      {loading ? <Text c="dimmed" ta="center" py="md">Cargando...</Text> : (
        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          <Box className="table-scroll">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th>Especialidad</Table.Th>
                  <Table.Th>Grado</Table.Th>
                  <Table.Th>Div.</Table.Th>
                  <Table.Th>Turno</Table.Th>
                  <Table.Th>Ciclo</Table.Th>
                  <Table.Th w={120}>CÃ³digo</Table.Th>
                  <Table.Th w={80}>Acc.</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item: any) => (
                  <Table.Tr key={item.id}>
                    <Table.Td><Text size="sm" fw={500}>{item.nombre}</Text></Table.Td>
                    <Table.Td><Badge variant="light" color="violet" size="xs">{item.especialidad_nombre}</Badge></Table.Td>
                    <Table.Td><Text size="sm">{item.anio}Â°</Text></Table.Td>
                    <Table.Td><Text size="sm">{item.division}</Text></Table.Td>
                    <Table.Td><Text size="sm">{item.turno}</Text></Table.Td>
                    <Table.Td><Text size="sm">{item.ciclo_lectivo}</Text></Table.Td>
                    <Table.Td><Text size="xs" style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>{item.codigo_automatricula}</Text></Table.Td>
                    <Table.Td>
                      <Group gap={2}>
                        <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => startEdit(item)}><IconPencil size={13} /></ActionIcon>
                        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(item.id)}><IconTrash size={13} /></ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {items.length === 0 && <Table.Tr><Table.Td colSpan={8}><Text ta="center" c="dimmed" py="md">No hay cursos</Text></Table.Td></Table.Tr>}
              </Table.Tbody>
            </Table>
          </Box>
        </Paper>
      )}
      <Modal opened={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirmar" size="xs">
        <Text size="sm" mb="md">Â¿Eliminar este curso?</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button size="xs" color="red" onClick={async () => { await deleteCurso(confirmDeleteId!); setConfirmDeleteId(null); load(); }}>Eliminar</Button>
        </Group>
      </Modal>
    </Box>
  );
}
