import React, { useState } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './logs.module.css';
import { FaHistory, FaFilter, FaDownload } from 'react-icons/fa';

const LogsAdmin = () => {
    const [logs, setLogs] = useState([
        { id: 1, user: 'Admin Principal', action: 'Editó Especialidad: Computación', date: '2026-04-29 14:30', ip: '192.168.1.15' },
        { id: 2, user: 'Secretaría', action: 'Subió PDF: Reglamento 2026', date: '2026-04-29 12:15', ip: '192.168.1.20' },
        { id: 3, user: 'Admin Principal', action: 'Creó usuario: Coordinación', date: '2026-04-28 09:00', ip: '192.168.1.15' },
        { id: 4, user: 'Coordinación', action: 'Eliminó proyecto: Feria 2024', date: '2026-04-27 18:45', ip: '192.168.1.55' },
    ]);

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
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Usuario</th>
                                <th>Acción Realizada</th>
                                <th>Dirección IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id}>
                                    <td className={styles.date}>{log.date}</td>
                                    <td><strong>{log.user}</strong></td>
                                    <td>{log.action}</td>
                                    <td className={styles.ip}>{log.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default LogsAdmin;
