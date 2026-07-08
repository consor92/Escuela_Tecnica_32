'use client';
import { useState, useEffect } from 'react';
import { Paper, Group, Button, Table, Badge, TextInput, Title, Text, Modal, NativeSelect, ActionIcon, Box, Tooltip, Pagination } from '@mantine/core';
import { notifications } from '@mantine/notifications';
// @ts-expect-error
import IconPlus from '@tabler/icons-react/dist/esm/icons/IconPlus';
// @ts-expect-error
import IconPencil from '@tabler/icons-react/dist/esm/icons/IconPencil';
// @ts-expect-error
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash';
// @ts-expect-error
import IconSearch from '@tabler/icons-react/dist/esm/icons/IconSearch';
// @ts-expect-error
import IconArrowUp from '@tabler/icons-react/dist/esm/icons/IconArrowUp';
// @ts-expect-error
import IconArrowDown from '@tabler/icons-react/dist/esm/icons/IconArrowDown';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from './actions';

const roleNames: Record<number, string> = { 2: 'Alumno', 3: 'Docente', 4: 'Preceptor', 5: 'Referente' };
const roleColors: Record<number, string> = { 2: 'gray', 3: 'blue', 4: 'teal', 5: 'violet' };

const rolesOpts = [
  { label: 'Alumno', value: '2' },
  { label: 'Docente', value: '3' },
  { label: 'Preceptor', value: '4' },
  { label: 'Referente', value: '5' },
];

const PAGE_SIZE = 20;

export default function UsuariosPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [form, setForm] = useState({ username: '', password: '', first_name: '', last_name: '', role_id: 3, dni: '', email: '', telefono: '' });
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => { setLoading(true); const d = await getUsuarios(); setUsers(d); setLoading(false); };

  const openCreate = () => { setEditUser(null); setForm({ username: '', password: '', first_name: '', last_name: '', role_id: 3, dni: '', email: '', telefono: '' }); setModalOpen(true); };
  const openEdit = (u: any) => { setEditUser(u); setForm({ username: u.username, password: '', first_name: u.first_name, last_name: u.last_name, role_id: u.role_id, dni: u.dni || '', email: u.email || '', telefono: u.telefono || '' }); setModalOpen(true); };

  const handleSave = async () => {
    const payload = { ...form };
    if (editUser) { const { password: pw, ...rest } = payload; await updateUsuario(editUser.id, pw ? payload : rest); }
    else await createUsuario(payload);
    setModalOpen(false); loadUsers();
  };

  const remove = async (id: number) => {
    await deleteUsuario(id);
    notifications.show({ title: 'Usuario eliminado', message: '', color: 'red' });
    setConfirmDelete(null);
    loadUsers();
  };

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const filtered = [...users]
    .filter(u => `${u.last_name} ${u.first_name} ${u.username}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (!sortKey) return 0;
      if (sortKey === 'role_id') return sortDir === 'asc' ? a.role_id - b.role_id : b.role_id - a.role_id;
      const av = String(a[sortKey] || '').toLowerCase();
      const bv = String(b[sortKey] || '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box>
      <Group justify="space-between" mb="sm">
        <Box>
          <Title order={5}>Gestión de Usuarios</Title>
          <Text size="xs" c="dimmed">Alumnos, docentes, preceptores y referentes</Text>
        </Box>
        <Button size="xs" leftSection={<IconPlus size={12} />} onClick={openCreate}>Nuevo Usuario</Button>
      </Group>

      <TextInput placeholder="Buscar usuarios..." size="xs" leftSection={<IconSearch size={14} />}
        value={search} onChange={(e) => setSearch(e.currentTarget.value)} mb="sm" />

      {loading ? <Text c="dimmed" ta="center" py="md">Cargando...</Text> : (
        <>
          <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <Box className="table-scroll">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('last_name')}>
                      <Group gap={4} wrap="nowrap">Nombre {sortKey === 'last_name' ? (sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />) : <Box w={12} />}</Group>
                    </Table.Th>
                    <Table.Th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('username')}>
                      <Group gap={4} wrap="nowrap">Usuario {sortKey === 'username' ? (sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />) : <Box w={12} />}</Group>
                    </Table.Th>
                    <Table.Th w={90}>DNI</Table.Th>
                    <Table.Th w={100}>Contacto</Table.Th>
                    <Table.Th w={90} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('role_id')}>
                      <Group gap={4} wrap="nowrap">Rol {sortKey === 'role_id' ? (sortDir === 'asc' ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />) : <Box w={12} />}</Group>
                    </Table.Th>
                    <Table.Th w={80}>Acc.</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paged.map(u => (
                    <Table.Tr key={u.id}>
                      <Table.Td><Text size="sm" fw={500}>{u.last_name}, {u.first_name}</Text></Table.Td>
                      <Table.Td><Text size="sm">{u.username}</Text></Table.Td>
                      <Table.Td><Text size="sm">{u.dni || '-'}</Text></Table.Td>
                      <Table.Td><Text size="sm">{u.telefono || '-'}</Text></Table.Td>
                      <Table.Td><Badge color={roleColors[u.role_id]} variant="light" size="sm">{roleNames[u.role_id]}</Badge></Table.Td>
                      <Table.Td>
                        <Group gap={2}>
                          <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => openEdit(u)}><IconPencil size={13} /></ActionIcon>
                          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setConfirmDelete(u.id)}><IconTrash size={13} /></ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {paged.length === 0 && <Table.Tr><Table.Td colSpan={6}><Text ta="center" c="dimmed" py="md">Sin resultados</Text></Table.Td></Table.Tr>}
                </Table.Tbody>
              </Table>
            </Box>
          </Paper>
          {totalPages > 1 && <Group justify="center" mt="sm"><Pagination total={totalPages} value={page} onChange={setPage} size="sm" /></Group>}
        </>
      )}

      <Modal opened={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar eliminación" size="sm">
        <Text size="sm" mb="md">¿Estás seguro de eliminar este usuario?</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button size="xs" color="red" onClick={() => remove(confirmDelete!)}>Eliminar</Button>
        </Group>
      </Modal>

      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'Editar Usuario' : 'Nuevo Usuario'} size="sm">
        <Group grow mb="xs">
          <TextInput label="Nombre" size="xs" value={form.first_name} onChange={(e) => setForm(p => ({ ...p, first_name: e.currentTarget.value }))} />
          <TextInput label="Apellido" size="xs" value={form.last_name} onChange={(e) => setForm(p => ({ ...p, last_name: e.currentTarget.value }))} />
        </Group>
        <TextInput label="Usuario" size="xs" value={form.username} onChange={(e) => setForm(p => ({ ...p, username: e.currentTarget.value }))} mb="xs" />
        <TextInput label={editUser ? 'Nueva contraseña' : 'Contraseña'} size="xs" type="password" value={form.password} onChange={(e) => setForm(p => ({ ...p, password: e.currentTarget.value }))} mb="xs" />
        <Group grow mb="xs">
          <TextInput label="DNI" size="xs" value={form.dni} onChange={(e) => setForm(p => ({ ...p, dni: e.currentTarget.value }))} />
          <NativeSelect label="Rol" size="xs" data={rolesOpts} value={String(form.role_id)} onChange={(e) => setForm(p => ({ ...p, role_id: parseInt(e.currentTarget.value) }))} />
        </Group>
        <Group grow mb="sm">
          <TextInput label="Email" size="xs" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.currentTarget.value }))} />
          <TextInput label="Teléfono" size="xs" value={form.telefono} onChange={(e) => setForm(p => ({ ...p, telefono: e.currentTarget.value }))} />
        </Group>
        <Button size="sm" onClick={handleSave} fullWidth>{editUser ? 'Actualizar' : 'Crear Usuario'}</Button>
      </Modal>
    </Box>
  );
}
