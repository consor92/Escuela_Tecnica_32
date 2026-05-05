import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './logs.module.css';
import { FaHistory, FaFilter, FaDownload } from 'react-icons/fa';

const LogsAdmin = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/logs')
            .then(res => res.json())
            .then(data => {
                setLogs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching logs:', err);
                setLoading(false);
            });
    }, []);

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + 
               date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <AdminLayout title="Registro de Actividad">
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.info}>
                        <h2>Logs del Sistema</h2>
                        <p>Monitoreo completo de todas las acciones dentro del panel.</p>
                    </div>
                    <button className={styles.exportBtn}><FaDownload /> Exportar CSV</button>
                </div>

                <div className={styles.tableCard}>
                    {loading ? <p style={{padding: '20px'}}>Cargando registros...</p> : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Fecha y Hora</th>
                                    <th>Usuario</th>
                                    <th>Acción Realizada</th>
                                    <th>Tipo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? logs.map(log => (
                                    <tr key={log.id}>
                                        <td className={styles.date}>{formatTime(log.date)}</td>
                                        <td><strong>{log.user}</strong></td>
                                        <td>{log.action}</td>
                                        <td className={styles.type}>
                                            <span className={`${styles.badge} ${styles[log.type]}`}>
                                                {log.type.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>No hay registros disponibles.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default LogsAdmin;
