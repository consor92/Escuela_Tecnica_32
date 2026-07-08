import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Box } from '@mantine/core';
import UsuariosPanel from './UsuariosPanel';

export default async function UsuariosPage() {
  const session = await getSession();
  if (!session || session.user.role_id !== 1) redirect('/login');
  return (
    <Box py="md" px="md" maw={1440} mx="auto">
      <UsuariosPanel />
    </Box>
  );
}
