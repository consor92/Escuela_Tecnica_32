'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, User, ShieldCheck } from 'lucide-react';

export default function Header({ user }: { user: any }) {
  const router = useRouter();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = (e: any) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    router.push('/logout');
  };

  return (
    <header>
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={24} /> <span className="hide-mobile">Sistema</span>
        </h2>
        <nav style={{ display: 'flex', gap: '15px' }}>
          {user.role_id === 1 ? (
            <>
              <Link href="/admin" className="btn" style={{ color: 'white', padding: '5px 10px' }}>Admin</Link>
              <Link href="/admin/scrum-eval" className="btn" style={{ color: 'white', padding: '5px 10px', background: 'var(--primary-color)' }}>Jira</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="btn" style={{ color: 'white', padding: '5px 10px' }}><LayoutDashboard size={18} /></Link>
              <Link href="/profile" className="btn" style={{ color: 'white', padding: '5px 10px' }}><User size={18} /></Link>
            </>
          )}
        </nav>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <label className="switch theme-toggle">
          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
          <span className="switch-slider"></span>
        </label>
        
        <div className="user-info hide-mobile" style={{ fontSize: '0.85rem', textAlign: 'right' }}>
          <strong>{user.username}</strong>
        </div>

        <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '8px' }}>
          <LogOut size={18} />
        </button>
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </header>
  );
}
