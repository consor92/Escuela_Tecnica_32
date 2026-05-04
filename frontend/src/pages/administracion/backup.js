import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './administracion.module.css';
import { FaDatabase, FaDownload, FaUpload } from 'react-icons/fa';

const BackupPage = () => {
    const [backupFiles, setBackupFiles] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [activeTab, setActiveTab] = useState('backup');

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    const loadFiles = () => {
        fetch('/api/admin/backup')
            .then(res => res.json())
            .then(data => {
                console.log('Datos recibidos del servidor:', data);
                setBackupFiles(Array.isArray(data) ? data : []);
            })
            .catch(err => console.error('Error cargando archivos:', err));
    };

    useEffect(() => {
        loadFiles();
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

    const restoreBackup = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let successCount = 0;
        let errorCount = 0;

        for (const file of files) {
            try {
                const content = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => resolve(event.target.result);
                    reader.readAsText(file);
                });

                const res = await fetch('/api/admin/backup', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName: file.name, content })
                });

                if (res.ok) successCount++;
                else errorCount++;
            } catch (error) {
                errorCount++;
            }
        }

        if (successCount > 0) showNotification(`${successCount} archivo(s) restaurados correctamente`);
        if (errorCount > 0) showNotification(`${errorCount} archivo(s) fallaron`, 'error');
        loadFiles();
    };

    return (
        <AdminLayout title="Backup y Restauración">
            <div className={styles.container}>
                <div className={styles.internalTabs}>
                    <button onClick={() => setActiveTab('backup')} className={activeTab === 'backup' ? styles.activeTab : ''}>Backup (Descargar)</button>
                    <button onClick={() => setActiveTab('restore')} className={activeTab === 'restore' ? styles.activeTab : ''}>Restaurar (Subir)</button>
                </div>

                <div className={styles.contentArea}>
                    {activeTab === 'backup' && (
                        <div className={styles.tableCard}>
                            <div style={{padding: '1.2rem'}}>
                                <h3><FaDatabase /> Descargar Copia de Seguridad</h3>
                                <p>Lista de archivos JSON disponibles en el servidor.</p>
                            </div>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Archivo</th>
                                        <th>Tamaño</th>
                                        <th>Última Modificación</th>
                                        <th>Estado</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backupFiles.map((file, i) => (
                                        <tr key={i}>
                                            <td>{file.name}</td>
                                            <td>{(file.size / 1024).toFixed(2)} KB</td>
                                            <td>{new Date(file.mtime).toLocaleString()}</td>
                                            <td><span className={styles.roleBadge} style={{backgroundColor: '#dcfce7', color: '#10b981'}}>Disponible</span></td>
                                            <td>
                                                <button onClick={() => downloadBackup(file.name)} className={styles.resetBtn}>
                                                    <FaDownload /> Descargar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'restore' && (
                        <div className={styles.tableCard} style={{padding: '2rem'}}>
                            <h3><FaUpload /> Restaurar Datos</h3>
                            <p>Sube archivos JSON para reemplazar los datos actuales en el servidor. <strong>¡Ten cuidado! Esta acción sobrescribirá los datos actuales.</strong></p>
                            <input type="file" multiple accept=".json" onChange={restoreBackup} style={{marginTop: '1.5rem'}} />
                        </div>
                    )}
                </div>
                
                {notification.message && (
                    <div style={{
                        position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px',
                        backgroundColor: notification.type === 'error' ? '#e74c3c' : '#27ae60', color: 'white',
                        borderRadius: '5px', zIndex: 1000, fontWeight: 'bold'
                    }}>
                        {notification.message}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default BackupPage;