import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
    FaHome, FaCog, FaNewspaper, FaUsers, FaGraduationCap, 
    FaChalkboardTeacher, FaHandHoldingHeart, FaTools, FaImage,
    FaMoon, FaSun, FaHistory, FaDatabase, FaComments
} from 'react-icons/fa';
import styles from './AdminLayout.module.css';
import ProfileModal from './ProfileModal';

const AdminLayout = ({ children, title }) => {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        const expiry = localStorage.getItem('adminSessionExpiry');
        const passwordChangeRequired = localStorage.getItem('adminPasswordChangeRequired');

        if (!isLoggedIn || (expiry && new Date() > new Date(expiry))) {
            handleLogout();
            return;
        }

        if (passwordChangeRequired === 'true' && router.pathname !== '/administracion/cambiar-password') {
            router.push('/administracion/cambiar-password');
            return;
        }

        const email = localStorage.getItem('adminUserEmail');
        setUserEmail(email || 'Admin');

        const savedTheme = localStorage.getItem('admin-theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.documentElement.classList.add('dark-theme');
        }
    }, [router]);

    const handleLogout = async () => {
        const email = localStorage.getItem('adminUserEmail');
        if (email) {
            try {
                await fetch('/api/updateUserAuth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, type: 'logout' })
                });
            } catch (error) {
                console.error('Error logging logout:', error);
            }
        }
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminUserEmail');
        router.push('/administracion/login');
    };

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark-theme');
            localStorage.setItem('admin-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-theme');
            localStorage.setItem('admin-theme', 'light');
        }
    };

    const menuItems = [
        { name: 'Dashboard', icon: <FaHome />, path: '/administracion' },
        { name: 'Configuración & Alertas', icon: <FaCog />, path: '/administracion/configuracion' },
        { name: 'Noticias', icon: <FaNewspaper />, path: '/administracion/noticias' },
        { name: 'Especialidades', icon: <FaTools />, path: '/administracion/especialidades' },
        { name: 'Autoridades', icon: <FaUsers />, path: '/administracion/autoridades' },
        { name: 'Alumnos', icon: <FaGraduationCap />, path: '/administracion/alumnos' },
        { name: 'Profesores', icon: <FaChalkboardTeacher />, path: '/administracion/profesores' },
        { name: 'Cooperadora', icon: <FaHandHoldingHeart />, path: '/administracion/cooperadora' },
        { name: 'Multimedia', icon: <FaImage />, path: '/administracion/multimedia' },
        { name: 'Calendario Escolar', icon: <FaHistory />, path: '/administracion/calendario' },
        { name: 'Usuarios', icon: <FaUsers />, path: '/administracion/usuarios' },
        { name: 'Backup y Restauración', icon: <FaDatabase />, path: '/administracion/backup' },
        { name: 'Sugerencias', icon: <FaComments />, path: '/administracion/sugerencias' },
        { name: 'Registro de Actividad', icon: <FaHistory />, path: '/administracion/logs' },
    ];

    return (
        <div className={`${styles.adminContainer} ${darkMode ? styles.dark : ''}`}>
            <aside className={styles.sidebar}>
                <div className={styles.logoArea}>
                    <img src="/logoet32.ico" alt="ET 32 Logo" className={styles.logo} />
                    <span>Panel Admin</span>
                </div>
                <nav className={styles.nav}>
                    {menuItems.map((item) => (
                        <Link 
                            key={item.path} 
                            href={item.path}
                            className={`${styles.navItem} ${router.pathname === item.path ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.name}</span>
                        </Link>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <Link href="/" className={styles.backButton}>
                        Volver a la Web
                    </Link>
                </div>
            </aside>
            <main className={styles.content}>
                <header className={styles.topbar}>
                    <h1>{title || 'Administración ET 32'}</h1>
                    <div className={styles.topbarActions}>
                        <button onClick={toggleDarkMode} className={styles.themeToggle} title={darkMode ? 'Modo Claro' : 'Modo Oscuro'}>
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                        <div className={styles.userProfile}>
                            <div className={styles.userInfo}>
                                <span className={styles.userName}>{userEmail.split('@')[0]}</span>
                                <span className={styles.userRole}>SuperAdmin</span>
                            </div>
                            <div className={styles.avatar} onClick={() => setShowProfile(true)} style={{cursor: 'pointer'}}>
                                {userEmail ? userEmail[0].toUpperCase() : 'A'}
                            </div>
                        </div>
                    </div>
                </header>
                {showProfile && (
                    <ProfileModal 
                        user={{ 
                            name: userEmail.split('@')[0], 
                            role: 'SuperAdmin', 
                            email: userEmail 
                        }}
                        onClose={() => setShowProfile(false)}
                        onLogout={handleLogout}
                    />
                )}
                <section className={styles.pageBody}>
                    {children}
                </section>
            </main>
        </div>
    );
};

export default AdminLayout;