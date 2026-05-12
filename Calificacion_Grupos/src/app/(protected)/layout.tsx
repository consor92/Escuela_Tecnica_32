import { getSession } from '@/lib/auth';
import Header from '@/components/Header';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <Header user={session.user} />
      <main>{children}</main>
    </>
  );
}
