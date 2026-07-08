import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminAsistenciaClient from './AdminAsistenciaClient';

export default async function AdminAsistenciaPage() {
  const session = await getSession();
  if (!session || session.user.role_id !== 1) redirect('/login');

  return <AdminAsistenciaClient />;
}
