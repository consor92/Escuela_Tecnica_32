import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminConfigClient from './AdminConfigClient';

export default async function AdminConfigPage() {
  const session = await getSession();
  if (!session || session.user.role_id !== 1) redirect('/login');

  return <AdminConfigClient />;
}
