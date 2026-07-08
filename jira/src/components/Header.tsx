'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Group, ActionIcon, Menu, Text, Paper, Avatar, Tooltip, Flex, Box, Divider, useMantineColorScheme } from '@mantine/core';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconLogout from '@tabler/icons-react/dist/esm/icons/IconLogout';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconLayoutDashboard from '@tabler/icons-react/dist/esm/icons/IconLayoutDashboard';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconUser from '@tabler/icons-react/dist/esm/icons/IconUser';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconShieldCheck from '@tabler/icons-react/dist/esm/icons/IconShieldCheck';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconBell from '@tabler/icons-react/dist/esm/icons/IconBell';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconBellFilled from '@tabler/icons-react/dist/esm/icons/IconBellFilled';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconInfoCircle from '@tabler/icons-react/dist/esm/icons/IconInfoCircle';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconAlertTriangle from '@tabler/icons-react/dist/esm/icons/IconAlertTriangle';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconAlertCircle from '@tabler/icons-react/dist/esm/icons/IconAlertCircle';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconSchool from '@tabler/icons-react/dist/esm/icons/IconSchool';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconEye from '@tabler/icons-react/dist/esm/icons/IconEye';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconFileSpreadsheet from '@tabler/icons-react/dist/esm/icons/IconFileSpreadsheet';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconUserPlus from '@tabler/icons-react/dist/esm/icons/IconUserPlus';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconSun from '@tabler/icons-react/dist/esm/icons/IconSun';
// @ts-expect-error - direct imports bypass turbopack barrel bug
import IconMoon from '@tabler/icons-react/dist/esm/icons/IconMoon';

export default function Header({ user }: { user: any }) {
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [notifCount, setNotifCount] = useState(0);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [showAllNotifs, setShowAllNotifs] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDark = colorScheme === 'dark';

  useEffect(() => { setMounted(true); fetchNotifs(); const i = setInterval(fetchNotifs, 30000); return () => clearInterval(i); }, []);

  const fetchNotifs = async (all?: boolean) => {
    try { const scope = (all !== undefined ? all : showAllNotifs) ? 'all' : 'unread'; const r = await fetch('/api/notificaciones?scope=' + scope); const d = await r.json(); if (d.notificaciones) { setNotifs(d.notificaciones); if (!all && !showAllNotifs) setNotifCount(d.count || 0); } } catch {}
  };

  const navLinks: Record<number, { href: string; label: string; icon: any; color?: string }[]> = {
     1: [
      { href: '/admin', label: 'Grupos', icon: IconShieldCheck },
      { href: '/admin/scrum-eval', label: 'Jira', icon: IconLayoutDashboard },
      { href: '/admin/config', label: 'Config', icon: IconUserPlus },
      { href: '/admin/usuarios', label: 'Usuarios', icon: IconUser },
      { href: '/docente', label: 'Asistencia', icon: IconSchool, color: '#10b981' },
    ],
    3: [{ href: '/docente', label: 'Registrar Asistencia', icon: IconSchool }],
    4: [{ href: '/preceptor', label: 'Preceptor', icon: IconEye }],
    5: [{ href: '/referente', label: 'Referente', icon: IconFileSpreadsheet }],
     2: [
      { href: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
    ],
  };
  const links = navLinks[user.role_id] || navLinks[2];
  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <Box style={{
      position: 'sticky', top: 0, zIndex: 1000,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      background: isDark ? 'rgba(20,22,28,0.82)' : 'rgba(255,255,255,0.78)',
      borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
    }}>
      <Flex justify="space-between" align="center" px="md" h={56} maw={1440} mx="auto">
        <Group gap="md">
          <Group gap={8}>
            <Avatar size="sm" radius="md" color="violet" variant="filled"><IconShieldCheck size={16} /></Avatar>
            <Text fw={800} size="sm" visibleFrom="sm" style={{ letterSpacing: '-0.03em' }}>Sistema</Text>
          </Group>
          <Group gap={2} visibleFrom="xs">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Paper key={link.href} component={Link} href={link.href} p="xs" px="sm"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', cursor: 'pointer',
                    background: active ? 'var(--mantine-color-violet-light)' : 'transparent',
                    color: active ? 'var(--mantine-color-violet-light-color)' : 'var(--mantine-color-dimmed)',
                    fontWeight: active ? 600 : 450, fontSize: '0.8125rem',
                    borderRadius: 'var(--mantine-radius-default)', transition: 'all 0.15s',
                  }}>
                  <link.icon size={14} />
                  <Text visibleFrom="sm" size="sm">{link.label}</Text>
                </Paper>
              );
            })}
          </Group>
        </Group>

        <Group gap={4}>
          <Menu width={420} position="bottom-end" shadow="lg" withinPortal={false} closeOnItemClick={false}>
            <Menu.Target>
              <Tooltip label={notifCount > 0 ? `${notifCount} notificaciones sin leer` : 'Notificaciones'}>
                <ActionIcon variant={notifCount > 0 ? 'filled' : 'subtle'} color={notifCount > 0 ? 'red' : 'gray'} size="lg" style={{ position: 'relative' }}>
                  {notifCount > 0 ? <IconBellFilled size={18} /> : <IconBell size={18} />}
                  {notifCount > 0 && (
                    <Box style={{
                      position: 'absolute', top: -6, right: -6,
                      background: '#e53e3e', color: '#fff',
                      borderRadius: '50%', minWidth: 20, height: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800,
                      boxShadow: '0 0 0 2px var(--mantine-color-body)',
                    }}>
                      {notifCount > 9 ? '9+' : notifCount}
                    </Box>
                  )}
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Box px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                <Flex justify="space-between" align="center">
                  <Group gap={6}>
                    <Text size="sm" fw={700}>Notificaciones</Text>
                    {!showAllNotifs && notifCount > 0 && <Box px={6} py={2} style={{ background: '#e53e3e', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 800, lineHeight: 1.4 }}>{notifCount} sin leer</Box>}
                  </Group>
                  <Group gap={8}>
                    <Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={() => { setShowAllNotifs(v => { const nv = !v; setTimeout(() => fetchNotifs(nv), 0); return nv; }); }}>
                      {showAllNotifs ? 'Solo sin leer' : 'Ver leídas'}
                    </Text>
                    {!showAllNotifs && notifs.length > 0 && (
                      <Text size="xs" c="blue" style={{ cursor: 'pointer' }} onClick={async () => {
                        await fetch('/api/notificaciones', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAll: true }) });
                        fetchNotifs();
                      }}>Marcar todas</Text>
                    )}
                  </Group>
                </Flex>
              </Box>
              {notifs.length === 0 ? (
                <Box px="md" py="xl">
                  <Text ta="center" c="dimmed" size="sm">{showAllNotifs ? 'No hay notificaciones' : 'No hay notificaciones nuevas'}</Text>
                </Box>
              ) : (
                <Box style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {notifs.map((n: any) => (
                    <Box key={n.id} px="md" py="sm"
                      style={{
                        borderLeft: n.tipo === 'alerta' ? '4px solid #e53e3e' : n.tipo === 'advertencia' ? '4px solid #d69e2e' : '4px solid #3182ce',
                        borderBottom: '1px solid var(--mantine-color-default-border)',
                        cursor: 'pointer', transition: 'background 0.15s',
                        background: showAllNotifs && !n.leida ? 'var(--mantine-color-violet-light)' : 'transparent',
                      }}
                      onClick={async () => {
                        if (!n.leida) { await fetch('/api/notificaciones', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id }) }); fetchNotifs(); }
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--mantine-color-gray-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = showAllNotifs && !n.leida ? 'var(--mantine-color-violet-light)' : 'transparent'}>
                      <Flex gap={10} align="flex-start">
                        <Box mt={2}>
                          {n.tipo === 'alerta' ? <IconAlertCircle size={16} color="#e53e3e" /> : n.tipo === 'advertencia' ? <IconAlertTriangle size={16} color="#d69e2e" /> : <IconInfoCircle size={16} color="#3182ce" />}
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" fw={600} lineClamp={1}>{n.titulo}{!n.leida && <Box component="span" ml={6} px={4} style={{ background: '#e53e3e', color: '#fff', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>NUEVA</Box>}</Text>
                          <Text size="xs" c="dimmed" lineClamp={2} style={{ marginTop: 2 }}>{n.mensaje}</Text>
                          <Text size="xs" c="dimmed" style={{ marginTop: 4, opacity: 0.6 }}>
                            {new Date(n.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </Box>
                      </Flex>
                    </Box>
                  ))}
                </Box>
              )}
              {notifs.length >= 10 && (
                <Box px="md" py="sm" ta="center" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                  <Text size="xs" c="dimmed">Mostrando últimas 10 notificaciones</Text>
                </Box>
              )}
            </Menu.Dropdown>
          </Menu>

          <Tooltip label={isDark ? 'Modo claro' : 'Modo oscuro'}>
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={toggleColorScheme}>
              {mounted ? (isDark ? <IconSun size={18} /> : <IconMoon size={18} />) : <Box w={18} h={18} />}
            </ActionIcon>
          </Tooltip>

          <Divider orientation="vertical" mx={2} />

          <Text visibleFrom="sm" size="sm" fw={500} c="dimmed">{user.username}</Text>

          <Tooltip label="Cerrar sesión">
            <ActionIcon variant="subtle" color="gray" size="lg" component="a" href="/logout">
              <IconLogout size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Flex>
    </Box>
  );
}
