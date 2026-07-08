'use client';
import { useState, useEffect } from 'react';
import { Paper, Group, Button, Table, Title, Text, TextInput, ActionIcon, Box, Modal } from '@mantine/core';
// @ts-expect-error
import IconPlus from '@tabler/icons-react/dist/esm/icons/IconPlus';
// @ts-expect-error
import IconPencil from '@tabler/icons-react/dist/esm/icons/IconPencil';
// @ts-expect-error
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash';
// @ts-expect-error
import IconDeviceFloppy from '@tabler/icons-react/dist/esm/icons/IconDeviceFloppy';
// @ts-expect-error
import IconX from '@tabler/icons-react/dist/esm/icons/IconX';
import { getEspecialidades, createEspecialidad, updateEspecialidad, deleteEspecialidad } from '../actions';

export default function EspecialidadesPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const load = async () => { setLoading(true); setItems(await getEspecialidades()); setLoading(false); };
  useEffect(() => { load(); }, []);
  const handleCreate = async () => { if (!nuevoNombre.trim()) return; await createEspecialidad(nuevoNombre.trim()); setNuevoNombre(''); load(); };
  const handleUpdate = async (id: number) => { if (!editNombre.trim()) return; await updateEspecialidad(id, editNombre.trim()); setEditId(null); load(); };
  const handleDelete = (id: number) => setConfirmDeleteId(id);

  return (
    <Box>
      <Group justify="space-between" mb="sm">
        <Title order={5}>Especialidades</Title>
        <Group gap="xs">
          <TextInput placeholder="Nombre..." value={nuevoNombre} onChange={(e) => setNuevoNombre(e.currentTarget.value)} size="xs" />
          <Button size="xs" leftSection={<IconPlus size={12} />} onClick={handleCreate}>Agregar</Button>
        </Group>
      </Group>
      {loading ? <Text c="dimmed" ta="center" py="md">Cargando...</Text> : (
        <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
          <Box className="table-scroll">
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Nombre</Table.Th>
                  <Table.Th w={160}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item: any) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      {editId === item.id ? (
                        <TextInput value={editNombre} onChange={(e) => setEditNombre(e.currentTarget.value)} size="xs" />
                      ) : <Text size="sm">{item.nombre}</Text>}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        {editId === item.id ? (
                          <>
                            <Button size="xs" leftSection={<IconDeviceFloppy size={12} />} onClick={() => handleUpdate(item.id)}>Guardar</Button>
                            <Button size="xs" variant="light" onClick={() => setEditId(null)}>Cancelar</Button>
                          </>
                        ) : (
                          <>
                            <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => { setEditId(item.id); setEditNombre(item.nombre); }}><IconPencil size={13} /></ActionIcon>
                            <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(item.id)}><IconTrash size={13} /></ActionIcon>
                          </>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {items.length === 0 && <Table.Tr><Table.Td colSpan={2}><Text ta="center" c="dimmed" py="md">No hay especialidades</Text></Table.Td></Table.Tr>}
              </Table.Tbody>
            </Table>
          </Box>
        </Paper>
      )}
      <Modal opened={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirmar" size="xs">
        <Text size="sm" mb="md">Â¿Eliminar esta especialidad?</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button size="xs" color="red" onClick={async () => { await deleteEspecialidad(confirmDeleteId!); setConfirmDeleteId(null); load(); }}>Eliminar</Button>
        </Group>
      </Modal>
    </Box>
  );
}
