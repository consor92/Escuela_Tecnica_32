import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './administracion.module.css';
import { 
    FaChartBar, 
    FaCheckCircle, 
    FaHistory, 
    FaServer,
    FaPlus,
    FaArrowRight,
    FaNewspaper,
    FaLink
} from 'react-icons/fa';
import Link from 'next/link';

const Dashboard = () => {
    const [fileCount, setFileCount] = useState(0);
    const [statsData, setStatsData] = useState({ totalVisits: 0 });
    const [logs, setLogs] = useState([]);
    const [systemInfo, setSystemInfo] = useState(null);
    const [data, setData] = useState({ news: [], alumnos: { resources: [] }, profesores: { resources: [] } });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newsRes, alumnosRes, profesoresRes, filesRes, statsRes, logsRes, sysRes] = await Promise.all([
                    fetch('/api/newsData'),
                    fetch('/api/alumnosData'),
                    fetch('/api/profesoresData'),
                    fetch('/api/admin/files'),
                    fetch('/api/stats'),
                    fetch('/api/admin/logs'),
                    fetch('/api/admin/system')
                ]);
                
                setData({ news: await newsRes.json(), alumnos: await alumnosRes.json(), profesores: await profesoresRes.json() });
                setFileCount((await filesRes.json()).length);
                setStatsData(await statsRes.json());
                setLogs(await logsRes.json());
                setSystemInfo(await sysRes.json());
            } catch (e) {
                console.error('Error loading dashboard data:', e);
            }
        };
        fetchData();
        
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/admin/system');
                if (res.ok) setSystemInfo(await res.json());
            } catch (e) {
                console.error('Error refreshing system data:', e);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const stats = [
        { label: 'Visitas Totales', value: statsData.totalVisits, icon: <FaChartBar />, color: '#ef4444', link: '/administracion' },
        { label: 'Noticias Publicadas', value: data.news.length, icon: <FaNewspaper />, color: '#3b82f6', link: '/administracion/noticias' },
        { label: 'Recursos Académicos', value: (data.alumnos.resources?.length || 0) + (data.profesores.resources?.length || 0), icon: <FaCheckCircle />, color: '#10b981', link: '/administracion/alumnos' },
        { label: 'Archivos en Servidor', value: fileCount, icon: <FaLink />, color: '#8b5cf6', link: '/administracion/multimedia' },
    ];

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' ' + 
               date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
    };

    const recentActivity = [
        ...(logs?.map(log => ({
            action: log.action,
            user: log.user || 'Admin',
            timestamp: new Date(log.date).getTime(),
            time: formatTime(log.date),
            type: log.type || 'info'
        })) || [])
    ].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <AdminLayout title="Panel General">
            <div className={styles.dashboardContainer}>
                
                <div className={styles.dashboardGrid}>
                    {stats.map((stat, index) => (
                        <Link key={index} href={stat.link} className={styles.statCard}>
                            <div className={styles.statIcon} style={{ backgroundColor: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className={styles.statInfo}>
                                <h3>{stat.value}</h3>
                                <p>{stat.label}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className={styles.mainGrid}>
                    <div className={styles.column}>
                        <div className={styles.contentCard}>
                            <div className={styles.cardHeader}>
                                <h3><FaHistory /> Actividad Reciente</h3>
                            </div>
                            <div className={styles.activityListScroll}>
                                {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                                    <div key={i} className={styles.activityItem}>
                                        <div className={`${styles.activityDot} ${styles[act.type]}`}></div>
                                        <div className={styles.activityText}>
                                            <p>{act.action}</p>
                                            <span>Por <strong>{act.user}</strong> • {act.time}</span>
                                        </div>
                                    </div>
                                )) : <p>No hay actividad registrada.</p>}
                            </div>
                        </div>
                    </div>

                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h3><FaServer /> Estado del Sistema</h3>
                        </div>
                        {systemInfo ? (
                            <div className={styles.healthList}>
                                <div className={styles.healthItem}><span>Memoria:</span><small>{systemInfo.memory.used} / {systemInfo.memory.total} GB ({systemInfo.memory.percentage}%)</small></div>
                                <div className={styles.healthItem}><span>Uso CPU:</span><span>{systemInfo.cpuUsage}%</span></div>
                                <div className={styles.healthItem}><span>Disco:</span><span>{systemInfo.disk}</span></div>
                                <div className={styles.healthItem}><span>ID Contenedor:</span><small>{systemInfo.containerId?.substring(0, 12) || 'N/A'}</small></div>
                                <div className={styles.healthItem}><span>Arquitectura:</span><small>{systemInfo.arch}</small></div>
                                <div className={styles.healthItem}><span>Tiempo encendido:</span><small>{systemInfo.uptime}</small></div>
                            </div>
                        ) : <p>Cargando datos del servidor...</p>}
                    </div>
                </div>

                <div className={styles.welcomeSection}>
                    <h2>Acciones Rápidas</h2>
                    <div className={styles.quickActions}>
                        <Link href="/administracion/noticias" className={styles.actionBtn}><FaPlus /> Crear Noticia</Link>
                        <Link href="/administracion/configuracion" className={styles.actionBtn}>Actualizar Alerta</Link>
                        <Link href="/administracion/multimedia" className={styles.actionBtn}>Subir Multimedia</Link>
                        <Link href="/" className={styles.actionBtnOut}>Ver Web <FaArrowRight /></Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
