'use client';
import { useState, useEffect } from 'react';
import { Group, Button, Table, Paper, Title, Select, ActionIcon, Tooltip, Text, Box } from '@mantine/core';
// @ts-expect-error
import IconUserPlus from '@tabler/icons-react/dist/esm/icons/IconUserPlus';
// @ts-expect-error
import IconPlus from '@tabler/icons-react/dist/esm/icons/IconPlus';
// @ts-expect-error
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash';
// @ts-expect-error
import IconRefresh from '@tabler/icons-react/dist/esm/icons/IconRefresh';
// @ts-expect-error
import IconDeviceFloppy from '@tabler/icons-react/dist/esm/icons/IconDeviceFloppy';
import { getCursos, getDocentesCurso, assignDocente, removeDocente, getDocentesDisponibles, asignarReferentesATodosLosCursos, updateDocenteDias } from '../actions';
import SearchableSelect from '@/components/SearchableSelect';

const DIAS = [
  { num: 1, label: 'L' }, { num: 2, label: 'M' }, { num: 3, label: 'M' },
  { num: 4, label: 'J' }, { num: 5, label: 'V' },
];

function DiasCheckbox({ value, onChange }: { value: number[]; onChange: (d: number[]) => void }) {
  const toggle = (num: number) => onChange(value.includes(num) ? value.filter(v => v !== num) : [...value, num]);
  return (
    <Group gap={3}>
      {DIAS.map(d => (
        <Paper key={d.num} p={0}
          style={{
            width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 4, cursor: 'pointer', userSelect: 'none', fontSize: '0.7rem', fontWeight: 600,
            background: value.includes(d.num) ? 'var(--mantine-color-violet-6)' : 'var(--mantine-color-default)',
            color: value.includes(d.num) ? '#fff' : 'inherit',
          }}
          onClick={() => toggle(d.num)}
        >
          {d.label}
        </Paper>
      ))}
    </Group>
  );
}

export default function DocentesPanel() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [disponibles, setDisponibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [asignarUserId, setAsignarUserId] = useState<number | null>(null);
  const [asignarRol, setAsignarRol] = useState<string | null>('docente');
  const [asignarDias, setAsignarDias] = useState<number[]>([1, 2, 3, 4, 5]);
  const [editDias, setEditDias] = useState<Record<number, number[]>>({});

  useEffect(() => { getCursos().then(setCursos); getDocentesDisponibles().then(setDisponibles); }, []);
  useEffect(() => {
    if (selectedCursoId) {
      setLoading(true);
      getDocentesCurso(selectedCursoId).then((data) => { setDocentes(data); setEditDias({}); setLoading(false); });
    } else setDocentes([]);
  }, [selectedCursoId]);

  const handleAssign = async () => {
    if (!selectedCursoId || asignarUserId === null) return;
    await assignDocente(selectedCursoId, asignarUserId, asignarRol || 'docente', diasToString(asignarDias));
    setAsignarUserId(null); setAsignarRol('docente'); setAsignarDias([1, 2, 3, 4, 5]);
    setDocentes(await getDocentesCurso(selectedCursoId));
  };
  const handleRemove = async (id: number) => { await removeDocente(id); if (selectedCursoId) setDocentes(await getDocentesCurso(selectedCursoId)); };
  const handleSaveDias = async (id: number) => { const selected = editDias[id]; if (!selected || selectedCursoId === null) return; await updateDocenteDias(id, diasToString(selected)); setDocentes(await getDocentesCurso(selectedCursoId)); };
  const getDiasLabels = (ds: string | null): string => { const d = stringToDias(ds); if (d.length >= 5) return 'Todos'; if (d.length === 0) return 'Ninguno'; return DIAS.filter(dia => d.includes(dia.num)).map(dia => dia.label).join(' '); };

  return (
    <Box>
      <Title order={5} mb="sm">Docentes por Curso</Title>
      <Group mb="sm">
        <SearchableSelect options={cursos.map((c: any) => ({ value: c.id, label: `${c.nombre} - ${c.especialidad_nombre} (${c.anio}/${c.division})` }))} value={selectedCursoId} onChange={setSelectedCursoId} placeholder="Buscar curso..." width="280px" />
        <Button size="xs" variant="light" leftSection={<IconRefresh size={12} />}
          onClick={async () => { await asignarReferentesATodosLosCursos(); if (selectedCursoId) setDocentes(await getDocentesCurso(selectedCursoId)); }}>
          Asignar referentes
        </Button>
      </Group>

      {selectedCursoId && (
        <>
          <Paper p="sm" withBorder mb="sm" radius="md">
            <Group align="end" gap="sm">
              <Box>
                <Text size="xs" fw={600} mb={2}>Docente</Text>
                <SearchableSelect options={disponibles.map((u: any) => ({ value: u.id, label: `${u.last_name}, ${u.first_name}` }))} value={asignarUserId} onChange={setAsignarUserId} placeholder="Buscar..." width="200px" isClearable />
              </Box>
              <Box>
                <Text size="xs" fw={600} mb={2}>Rol</Text>
                <Select data={['docente', 'preceptor']} value={asignarRol} onChange={setAsignarRol} w={110} size="xs" />
              </Box>
              <Box>
                <Text size="xs" fw={600} mb={2}>D�as</Text>
                <DiasCheckbox value={asignarDias} onChange={setAsignarDias} />
              </Box>
              <Button size="xs" leftSection={<IconPlus size={12} />} onClick={handleAssign}>Asignar</Button>
            </Group>
          </Paper>

          {loading ? <Text c="dimmed" ta="center" py="md">Cargando...</Text> : (
            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
              <Box className="table-scroll">
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Nombre</Table.Th>
                      <Table.Th>Rol</Table.Th>
                      <Table.Th w={160}>D�as</Table.Th>
                      <Table.Th w={70}>Acc.</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {docentes.map((d: any) => {
                      const editing = editDias[d.id] !== undefined;
                      return (
                        <Table.Tr key={d.id}>
                          <Table.Td><Text size="sm">{d.last_name}, {d.first_name}</Text></Table.Td>
                          <Table.Td><Text size="sm" c="dimmed">{d.rol}</Text></Table.Td>
                          <Table.Td>
                            {editing ? (
                              <Group gap={4}>
                                <DiasCheckbox value={editDias[d.id]} onChange={(v) => setEditDias(p => ({ ...p, [d.id]: v }))} />
                                <ActionIcon variant="light" size="sm" onClick={() => handleSaveDias(d.id)}><IconDeviceFloppy size={12} /></ActionIcon>
                              </Group>
                            ) : (
                              <Text size="sm" style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                                onClick={() => setEditDias(p => ({ ...p, [d.id]: stringToDias(d.dias_semana) }))}>
                                {getDiasLabels(d.dias_semana)}
                              </Text>
                            )}
                          </Table.Td>
                          <Table.Td>
                            <Tooltip label="Quitar">
                              <ActionIcon variant="light" color="red" size="sm" onClick={() => handleRemove(d.id)}><IconTrash size={13} /></ActionIcon>
                            </Tooltip>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                    {docentes.length === 0 && <Table.Tr><Table.Td colSpan={4}><Text ta="center" c="dimmed" py="md">Sin docentes asignados</Text></Table.Td></Table.Tr>}
                  </Table.Tbody>
                </Table>
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

function diasToString(dias: number[]): string {
  return dias.length === 0 || dias.length === 5 ? '' : dias.sort((a, b) => a - b).join(',');
}

function stringToDias(s: string | null | undefined): number[] {
  if (!s) return [1, 2, 3, 4, 5];
  return s.split(',').map(Number).filter(n => !isNaN(n));
}
