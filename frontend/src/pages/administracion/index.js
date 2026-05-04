import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './administracion.module.css';
import { 
    FaChartBar, 
    FaCheckCircle, 
    FaExclamationCircle, 
    FaLink, 
    FaHistory, 
    FaServer,
    FaPlus,
    FaArrowRight,
    FaDatabase,
    FaDownload
} from 'react-icons/fa';
import Link from 'next/link';

const Dashboard = () => {
    const [fileCount, setFileCount] = useState(0);
    const [backupFiles, setBackupFiles] = useState([]);
    const [data, setData] = useState({ news: [], alumnos: { resources: [], projects: [] }, profesores: { resources: [] } });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [newsRes, alumnosRes, profesoresRes, filesRes, backupRes] = await Promise.all([
                    fetch('/api/newsData'),
                    fetch('/api/alumnosData'),
                    fetch('/api/profesoresData'),
                    fetch('/api/admin/files'),
                    fetch('/api/admin/backup')
                ]);
                
                const news = await newsRes.json();
                const alumnos = await alumnosRes.json();
                const profesores = await profesoresRes.json();
                const files = await filesRes.json();
                const bFiles = await backupRes.json();
                
                setData({ news, alumnos, profesores });
                setFileCount(files.length);
                setBackupFiles(bFiles);
            } catch (e) {
                console.error('Error loading dashboard data:', e);
            }
        };
        fetchData();
    }, []);

    const downloadBackup = async (fileName) => {
        const res = await fetch('/api/admin/backup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName })
        });
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
    };

    const stats = [
        { label: 'Noticias Publicadas', value: data.news.length, icon: <FaChartBar />, color: '#3b82f6', link: '/administracion/noticias' },
        { label: 'Recursos Académicos', value: data.alumnos.resources.length + data.profesores.resources.length, icon: <FaCheckCircle />, color: '#10b981', link: '/administracion/alumnos' },
        { label: 'Proyectos Escolares', value: data.alumnos.projects.length, icon: <FaExclamationCircle />, color: '#f59e0b', link: '/administracion/alumnos' },
        { label: 'Archivos en Servidor', value: fileCount, icon: <FaLink />, color: '#8b5cf6', link: '/administracion/multimedia' },
    ];

    const recentActivity = [
        { action: 'Nueva noticia publicada', user: 'Admin', time: 'Hace 15 min', type: 'news' },
        { action: 'Se actualizó el programa de 5to año', user: 'Prof. Gómez', time: 'Hace 1 hora', type: 'doc' },
        { action: 'Modo mantenimiento desactivado', user: 'Admin', time: 'Hoy 10:30', type: 'system' },
        { action: 'Se agregaron 4 fotos al carrusel', user: 'Admin', time: 'Ayer', type: 'media' },
    ];

    return (
        <AdminLayout title="Panel General">
            <div className={styles.dashboardContainer}>
                
                {/* GRILLA DE ESTADÍSTICAS */}
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
                    {/* COLUMNA IZQUIERDA */}
                    <div className={styles.column}>
                        {/* ACTIVIDAD RECIENTE */}
                        <div className={styles.contentCard}>
                            <div className={styles.cardHeader}>
                                <h3><FaHistory /> Actividad Reciente</h3>
                            </div>
                            <div className={styles.activityList}>
                                {recentActivity.map((act, i) => (
                                    <div key={i} className={styles.activityItem}>
                                        <div className={`${styles.activityDot} ${styles[act.type]}`}></div>
                                        <div className={styles.activityText}>
                                            <p>{act.action}</p>
                                            <span>Por {act.user} • {act.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA (ESTADO DEL SISTEMA) */}
                    <div className={styles.contentCard}>
                        <div className={styles.cardHeader}>
                            <h3><FaServer /> Estado del Sistema</h3>
                        </div>
                        <div className={styles.healthList}>
                            <div className={styles.healthItem}>
                                <span>Servidor:</span>
                                <span className={styles.online}>En línea</span>
                            </div>
                            <div className={styles.healthItem}>
                                <span>Almacenamiento:</span>
                                <div className={styles.storageBar}>
                                    <div className={styles.storageFill} style={{width: '35%'}}></div>
                                </div>
                                <small>350MB / 1GB</small>
                            </div>
                            <div className={styles.healthItem}>
                                <span>Último backup:</span>
                                <span>Hoy 04:00 AM</span>
                            </div>
                            <div className={styles.healthItem}>
                                <span>Versión:</span>
                                <span>v1.2.0 Stable</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACCESOS RÁPIDOS */}
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
