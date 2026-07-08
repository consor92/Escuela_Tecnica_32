'use client';
import { useState } from 'react';
import { Title, Text, Group, Paper, Stack, UnstyledButton, ThemeIcon, Box, Avatar, Flex } from '@mantine/core';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconSchool from '@tabler/icons-react/dist/esm/icons/IconSchool';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconUsers from '@tabler/icons-react/dist/esm/icons/IconUsers';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconClock from '@tabler/icons-react/dist/esm/icons/IconClock';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconCalendar from '@tabler/icons-react/dist/esm/icons/IconCalendar';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconUserPlus from '@tabler/icons-react/dist/esm/icons/IconUserPlus';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconAlertTriangle from '@tabler/icons-react/dist/esm/icons/IconAlertTriangle';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconChartBar from '@tabler/icons-react/dist/esm/icons/IconChartBar';
import EspecialidadesPanel from './components/EspecialidadesPanel';
import CursosPanel from './components/CursosPanel';
import DocentesPanel from './components/DocentesPanel';
import HorariosPanel from './components/HorariosPanel';
import AlumnosPanel from './components/AlumnosPanel';
import EventosPanel from './components/EventosPanel';
import ComputoPanel from './components/ComputoPanel';
import ImportarPanel from './components/ImportarPanel';

const tabs = [
  { key: 'especialidades', label: 'Especialidades', icon: IconSchool, desc: 'Áreas', color: 'violet' },
  { key: 'cursos', label: 'Cursos', icon: IconUsers, desc: 'Divisiones', color: 'blue' },
  { key: 'horarios', label: 'Horarios', icon: IconClock, desc: 'Días y horas', color: 'cyan' },
  { key: 'docentes', label: 'Docentes', icon: IconUserPlus, desc: 'Asignaciones', color: 'teal' },
  { key: 'alumnos', label: 'Alumnos', icon: IconUsers, desc: 'Inscripciones', color: 'green' },
  { key: 'eventos', label: 'Eventos', icon: IconCalendar, desc: 'Salidas', color: 'orange' },
  { key: 'computo', label: 'Cómputo', icon: IconChartBar, desc: 'Reportes', color: 'pink' },
  { key: 'importar', label: 'Importar', icon: IconAlertTriangle, desc: 'Legacy', color: 'red' },
];

export default function AdminAsistenciaClient() {
  const [tab, setTab] = useState<string>('especialidades');

  return (
    <Box py="md" px="md" maw={1440} mx="auto">
      <Paper p={0} radius="md" withBorder style={{ overflow: 'hidden' }}>
        <Flex direction={{ base: 'column', sm: 'row' }}>
          {/* Sidebar */}
          <Box w={{ base: '100%', sm: 220 }} p="sm" bg="var(--mantine-color-body)"
            style={{ borderRight: '1px solid var(--mantine-color-default-border)', flexShrink: 0 }}>
            <Group gap="sm" mb="md" px="xs">
              <Avatar size="sm" radius="md" color="violet" variant="filled">
                <IconSchool size={16} />
              </Avatar>
              <Box>
                <Text fw={700} size="sm">Asistencia</Text>
                <Text size="xs" c="dimmed">Panel admin</Text>
              </Box>
            </Group>
            <Stack gap={2}>
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <UnstyledButton key={t.key} onClick={() => setTab(t.key)}
                    px="sm" py={8}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--mantine-radius-default)',
                      background: active ? 'var(--mantine-color-violet-light)' : 'transparent',
                      color: active ? 'var(--mantine-color-violet-light-color)' : 'var(--mantine-color-dimmed)',
                      fontWeight: active ? 600 : 400, fontSize: '0.875rem',
                      transition: 'all 0.1s',
                    }}
                  >
                    <ThemeIcon variant={active ? 'filled' : 'light'} color={t.color} size="sm">
                      <t.icon size={13} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={active ? 600 : 400} lh={1.3}>{t.label}</Text>
                      <Text size="xs" c="dimmed" lh={1.2}>{t.desc}</Text>
                    </Box>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </Box>

          {/* Content */}
          <Box p="md" style={{ flex: 1, overflow: 'auto', minHeight: '70vh' }}>
            {tab === 'especialidades' && <EspecialidadesPanel />}
            {tab === 'cursos' && <CursosPanel />}
            {tab === 'horarios' && <HorariosPanel />}
            {tab === 'docentes' && <DocentesPanel />}
            {tab === 'alumnos' && <AlumnosPanel />}
            {tab === 'eventos' && <EventosPanel />}
            {tab === 'computo' && <ComputoPanel />}
            {tab === 'importar' && <ImportarPanel />}
          </Box>
        </Flex>
      </Paper>
    </Box>
  );
}
