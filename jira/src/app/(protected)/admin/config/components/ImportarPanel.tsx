'use client';
import { useState } from 'react';
import { Paper, Group, Button, Title, Text, Box, Alert, List, ThemeIcon, Modal } from '@mantine/core';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconAlertTriangle from '@tabler/icons-react/dist/esm/icons/IconAlertTriangle';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconPlayerPlay from '@tabler/icons-react/dist/esm/icons/IconPlayerPlay';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconCircleCheck from '@tabler/icons-react/dist/esm/icons/IconCircleCheck';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconCircleX from '@tabler/icons-react/dist/esm/icons/IconCircleX';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconLoader from '@tabler/icons-react/dist/esm/icons/IconLoader';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconInfoCircle from '@tabler/icons-react/dist/esm/icons/IconInfoCircle';
import { importarLegacy } from '../actions';

export default function ImportarPanel() {
  const [resultados, setResultados] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleImportar = () => setConfirmOpen(true);

  return (
    <Box>
      <Title order={5} mb="sm">Importación Legacy</Title>

      <Alert icon={<IconInfoCircle size={16} />} color="yellow" variant="light" mb="sm" py="sm">
        Importa datos de la BD legacy (<em>epiz_27864677_encuentro</em>): usuarios, cursos, inscripciones y asistencia (17.407 registros). Los registros legacy = PRESENTES; lo no registrado = ausente.
      </Alert>

      <Button leftSection={loading ? <IconLoader size={14} /> : <IconPlayerPlay size={14} />} onClick={handleImportar} disabled={loading} size="sm">
        {loading ? 'Importando...' : 'Iniciar Importación'}
      </Button>

      {error && <Alert icon={<IconCircleX size={16} />} color="red" variant="light" mt="sm" py="sm">{error}</Alert>}

      {resultados.length > 0 && (
        <Paper withBorder radius="md" p="sm" mt="sm" bg="green.0">
          <Group gap="sm" mb="xs">
            <IconCircleCheck size={16} color="var(--mantine-color-green-7)" />
            <Text size="sm" fw={600} c="green.8">Resultados</Text>
          </Group>
          <List spacing="xs" size="sm">
            {resultados.map((r, i) => (<List.Item key={i} icon={<ThemeIcon color="green" size={14} variant="light" radius="xl"><IconCircleCheck size={10} /></ThemeIcon>}>{r}</List.Item>))}
          </List>
        </Paper>
      )}

      <Paper withBorder radius="md" p="sm" mt="sm">
        <Text size="sm" fw={600} mb="xs">Datos legacy disponibles:</Text>
        <List spacing="xs" size="xs" c="dimmed">
          <List.Item>444 usuarios</List.Item>
          <List.Item>26 cursos (2019-2026)</List.Item>
          <List.Item>17.407 registros de asistencia</List.Item>
          <List.Item>Roles Alumno/Profesor</List.Item>
        </List>
      </Paper>

      <Modal opened={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmar" size="xs">
        <Text size="sm" mb="md">¿Importar datos legacy? Se migrarán usuarios, cursos y asistencia.</Text>
        <Group justify="flex-end" gap="sm">
          <Button size="xs" variant="light" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button size="xs" color="blue" onClick={async () => { setConfirmOpen(false); setLoading(true); setError(null); setResultados([]); try { const res = await importarLegacy(); setResultados(res.resultados || []); } catch (e: any) { setError(e.message); } setLoading(false); }}>Importar</Button>
        </Group>
      </Modal>
    </Box>
  );
}
