'use client';
import { useState, useEffect } from 'react';
import { Paper, Group, Button, Table, Title, Text, ActionIcon, Tooltip, Box, Modal, Stack } from '@mantine/core';
// @ts-expect-error
import IconUsers from '@tabler/icons-react/dist/esm/icons/IconUsers';
// @ts-expect-error
import IconPlus from '@tabler/icons-react/dist/esm/icons/IconPlus';
// @ts-expect-error
import IconTrash from '@tabler/icons-react/dist/esm/icons/IconTrash';
// @ts-expect-error
import IconArrowRight from '@tabler/icons-react/dist/esm/icons/IconArrowRight';
import { getCursos, getAlumnosCurso, inscribirAlumno, desinscribirAlumno, moverAlumno, getAlumnosDisponibles, getAlumnoDetalle } from '../actions';
import SearchableSelect from '@/components/SearchableSelect';

export default function AlumnosPanel() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<number | null>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [disponibles, setDisponibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inscribirUserId, setInscribirUserId] = useState<number | null>(null);
  const [moverAlumnoId, setMoverAlumnoId] = useState<number | null>(null);
  const [moverCursoId, setMoverCursoId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  useEffect(() => { getCursos().then(setCursos); getAlumnosDisponibles().then(setDisponibles); }, []);
  useEffect(() => { if (selectedCursoId) { setLoading(true); getAlumnosCurso(selectedCursoId).then((data) => { setAlumnos(data); setLoading(false); }); } else setAlumnos([]); }, [selectedCursoId]);
  const cursoOpts = cursos.map((c: any) => ({ value: c.id, label: `${c.nombre} - ${c.especialidad_nombre} (${c.anio}/${c.division})` }));
  const disponibleOpts = disponibles.map((u: any) => ({ value: u.id, label: `${u.last_name}, ${u.first_name}` }));
  const cursoDestinoOpts = cursos.filter(c => c.id !== selectedCursoId).map((c: any) => ({ value: c.id, label: `${c.nombre} (${c.anio}/${c.division})` }));
  const handleInscribir = async () => { if (!selectedCursoId || !inscribirUserId) return; await inscribirAlumno(selectedCursoId, inscribirUserId); setInscribirUserId(null); setAlumnos(await getAlumnosCurso(selectedCursoId)); };
  const handleDesinscribir = (id: number) => setConfirmDeleteId(id);
  const handleMover = async () => { if (!moverAlumnoId || !moverCursoId) return; await moverAlumno(moverAlumnoId, moverCursoId); setMoverAlumnoId(null); setMoverCursoId(null); if (selectedCursoId) setAlumnos(await getAlumnosCurso(selectedCursoId)); };
  const handleVerDetalle = async (userId: number) => { setDetalle(await getAlumnoDetalle(userId)); };

  return (
    <Box>
      <Title order={5} mb="sm">Alumnos por Curso</Title>
      <Group mb="sm">
        <SearchableSelect options={cursoOpts} value={selectedCursoId} onChange={setSelectedCursoId} placeholder="Buscar curso..." width="280px" />
      </Group>
      {selectedCursoId && (
        <>
          <Paper p="sm" withBorder mb="sm" radius="md">
            <Group align="end" gap="sm">
              <Box>
                <Text size="xs" fw={600} mb={2}>Alumno a inscribir</Text>
                <SearchableSelect options={disponibleOpts} value={inscribirUserId} onChange={setInscribirUserId} placeholder="Buscar alumno..." width="240px" isClearable />
              </Box>
              <Button size="xs" leftSection={<IconPlus size={12} />} onClick={handleInscribir} disabled={!inscribirUserId}>Inscribir</Button>
            </Group>
          </Paper>

          {loading ? <Text c="dimmed" ta="center" py="md">Cargando...</Text> : (
            <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
              <Box className="table-scroll">
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Nombre</Table.Th>
                      <Table.Th>F. Inscripci�n</Table.Th>
                      <Table.Th w={280}>Acciones</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {alumnos.map((a: any) => (
                      <Table.Tr key={a.id}>
                        <Table.Td>
                          <Text size="sm" style={{ cursor: 'pointer', color: 'var(--mantine-color-anchor)', textDecoration: 'underline' }} onClick={() => handleVerDetalle(a.user_id)}>
                            {a.last_name}, {a.first_name}
                          </Text>
                        </Table.Td>
                        <Table.Td><Text size="sm">{a.fecha_inscripcion ? new Date(a.fecha_inscripcion).toLocaleDateString() : '-'}</Text></Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            <Tooltip label="Desinscribir">
                              <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDesinscribir(a.id)}><IconTrash size={13} /></ActionIcon>
                            </Tooltip>
                            {moverAlumnoId === a.id ? (
                              <>
                                <SearchableSelect options={cursoDestinoOpts} value={moverCursoId} onChange={setMoverCursoId} placeholder="Curso destino..." width="140px" />
                                <Button size="xs" onClick={handleMover} disabled={!moverCursoId}><IconArrowRight size={12} /> Mover</Button>
                                <Button size="xs" variant="light" onClick={() => { setMoverAlumnoId(null); setMoverCursoId(null); }}>X</Button>
                              </>
                            ) : (
                              <Button size="xs" variant="light" leftSection={<IconArrowRight size={12} />} onClick={() => setMoverAlumnoId(a.id)}>Reasignar</Button>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                    {alumnos.length === 0 && <Table.Tr><Table.Td colSpan={3}><Text ta="center" c="dimmed" py="md">Sin alumnos inscritos</Text></Table.Td></Table.Tr>}
                  </Table.Tbody>
                </Table>
              </Box>
            </Paper>
          )}
        </>
      )}

      <Modal opened={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} title="Confirmar" size="xs">
        <Text size="sm" mb="md">�Desinscribir? Se borrar�n registros.</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmDeleteId(null)}>Cancelar</Button>
          <Button size="xs" color="red" onClick={async () => { await desinscribirAlumno(confirmDeleteId!); setConfirmDeleteId(null); if (selectedCursoId) setAlumnos(await getAlumnosCurso(selectedCursoId)); }}>Eliminar</Button>
        </Group>
      </Modal>
      <Modal opened={!!detalle} onClose={() => setDetalle(null)} title={detalle ? `${detalle.first_name} ${detalle.last_name}` : ''} size="sm">
        {detalle && (
          <Stack gap="xs">
            {[{ label: 'Email', val: detalle.email }, { label: 'DNI', val: detalle.dni }, { label: 'Tel�fono', val: detalle.telefono }, { label: 'Tel. alternativo', val: detalle.telefono_alternativo }, { label: 'Direcci�n', val: detalle.direccion }, { label: 'CUIL', val: detalle.cuil }, { label: 'Nacionalidad', val: detalle.nacionalidad }, { label: 'G�nero', val: detalle.genero }, { label: 'F. nacimiento', val: detalle.fecha_nacimiento ? new Date(detalle.fecha_nacimiento).toLocaleDateString() : '-' }, { label: 'Legacy ID', val: detalle.legacy_id || '-' }].map((r, i) => (
              <Group key={i} justify="space-between">
                <Text size="sm" fw={600}>{r.label}</Text>
                <Text size="sm">{r.val || '-'}</Text>
              </Group>
            ))}
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
