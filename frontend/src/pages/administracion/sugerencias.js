import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './administracion.module.css';
import { FaComments, FaTrash } from 'react-icons/fa';

const SugerenciasAdmin = () => {
    const [sugerencias, setSugerencias] = useState([]);
    const [selectedSugerencia, setSelectedSugerencia] = useState(null);

    useEffect(() => {
        fetch('/api/admin/getData?fileName=sugerencias.json')
            .then(res => res.json())
            .then(data => setSugerencias(Array.isArray(data) ? data : []))
            .catch(err => console.error('Error cargando sugerencias:', err));
    }, []);

    const deleteSugerencia = (id, e) => {
        e.stopPropagation();
        if (confirm('¿Eliminar esta sugerencia?')) {
            const nuevas = sugerencias.filter(s => s.id !== id);
            setSugerencias(nuevas);
            fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: 'sugerencias.json', data: nuevas })
            });
        }
    };

    return (
        <AdminLayout title="Sugerencias de Usuarios">
            <div className={styles.container}>
                <div className={styles.tableCard}>
                    <div style={{padding: '1.2rem'}}>
                        <h3><FaComments /> Sugerencias Recibidas</h3>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Email</th>
                                <th>Mensaje</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sugerencias.map((s, i) => (
                                <tr key={i} onClick={() => setSelectedSugerencia(s)} style={{cursor: 'pointer'}}>
                                    <td>{s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}</td>
                                    <td>{s.email}</td>
                                    <td style={{ maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.message}</td>
                                    <td>
                                        <button className={styles.deleteBtn} onClick={(e) => deleteSugerencia(s.id, e)}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedSugerencia && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedSugerencia(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <header>
                                <h3>Detalle de Sugerencia</h3>
                                <button onClick={() => setSelectedSugerencia(null)}>×</button>
                            </header>
                            <div className={styles.modalBody}>
                                <div className={styles.formGroup}>
                                    <label>Email:</label>
                                    <p>{selectedSugerencia.email}</p>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Fecha:</label>
                                    <p>{new Date(selectedSugerencia.date).toLocaleString()}</p>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Mensaje:</label>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '1rem', border: '1px solid var(--admin-border)', borderRadius: '10px', background: 'var(--admin-bg)' }}>
                                        {selectedSugerencia.message}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default SugerenciasAdmin;