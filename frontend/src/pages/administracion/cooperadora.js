import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './cooperadora.module.css';
import { 
    FaSave, 
    FaPlus, 
    FaTrash, 
    FaUniversity, 
    FaMoneyBillWave, 
    FaNewspaper, 
    FaClock, 
    FaEnvelope, 
    FaInstagram,
    FaFileUpload,
    FaInfoCircle
} from 'react-icons/fa';

const CooperadoraAdmin = () => {
    const [coopData, setCoopData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [expandedNovedades, setExpandedNovedades] = useState([]);

    useEffect(() => {
        fetch('/api/admin/getData?fileName=novedades_cooperadora.json')
            .then(res => res.json())
            .then(data => setCoopData(data))
            .catch(err => console.error('Error cargando cooperadora:', err));
    }, []);

    const toggleNovedad = (id) => {
        setExpandedNovedades(prev => 
            prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
        );
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    if (!coopData) return <AdminLayout title="Gestión de Cooperadora"><div className={styles.container}>Cargando...</div></AdminLayout>;

    const info = coopData.info || {
        banco: '', cbu: '', alias: '', titular: '', cuit: '',
        email: '', instagram: '', horarios: '', cuotaAnual: '', cuotaMarzo: '', cuotaMayo: ''
    };
    
    const novedades = Array.isArray(coopData) ? coopData : (coopData.novedades || []);

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setCoopData({
            ...coopData,
            info: { ...info, [name]: value }
        });
    };

    const handleNovedadChange = (id, field, value) => {
        setCoopData({
            ...coopData,
            novedades: novedades.map(n => n.id === id ? { ...n, [field]: value } : n)
        });
    };

    const addNovedad = () => {
        const newId = novedades.length > 0 ? Math.max(...novedades.map(n => n.id)) + 1 : 1;
        setCoopData({
            ...coopData,
            novedades: [{ 
                id: newId, 
                title: "Nueva Novedad", 
                fecha: new Date().toISOString().split('T')[0], 
                text: "", 
                url: "/images/logo_coope.png" 
            }, ...novedades]
        });
        setExpandedNovedades(prev => [...prev, newId]);
    };

    const handleFileUpload = async (e, id) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const response = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: reader.result,
                        fileName: file.name,
                        type: 'cooperadora_novedad'
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    handleNovedadChange(id, 'url', data.url);
                } else {
                    showNotification('Error al subir imagen', 'error');
                }
                setIsUploading(false);
            };
        } catch (error) {
            showNotification('Error al subir imagen', 'error');
            setIsUploading(false);
        }
    };

    const saveChanges = async () => {
        try {
            const response = await fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: 'novedades_cooperadora.json',
                    data: coopData
                })
            });
            const result = await response.json();
            if (response.ok) {
                showNotification('¡Cambios guardados correctamente!');
            } else {
                showNotification('Error al guardar: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error saving data:', error);
            showNotification('Error al guardar los datos.', 'error');
        }
    };

    return (
        <AdminLayout title="Gestión de Cooperadora">
            <div className={styles.container}>
                
                {/* INFORMACIÓN INSTITUCIONAL */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <FaUniversity />
                        <h2 className={styles.sectionTitle}>Datos Bancarios y Contacto</h2>
                    </div>
                    
                    <div className={styles.configGrid}>
                        <div className={styles.card}>
                            <h3>Cuenta Bancaria</h3>
                            <div className={styles.formGroup}>
                                <label>Banco:</label>
                                <input type="text" name="banco" value={info.banco} onChange={handleInfoChange} />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>CBU:</label>
                                    <input type="text" name="cbu" value={info.cbu} onChange={handleInfoChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>ALIAS:</label>
                                    <input type="text" name="alias" value={info.alias} onChange={handleInfoChange} />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Titular de la Cuenta:</label>
                                <input type="text" name="titular" value={info.titular} onChange={handleInfoChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>CUIT:</label>
                                <input type="text" name="cuit" value={info.cuit} onChange={handleInfoChange} />
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h3>Contacto y Atención</h3>
                            <div className={styles.formGroup}>
                                <label><FaEnvelope /> Email de Contacto:</label>
                                <input type="text" name="email" value={info.email} onChange={handleInfoChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label><FaInstagram /> Instagram URL:</label>
                                <input type="text" name="instagram" value={info.instagram} onChange={handleInfoChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label><FaClock /> Horarios de Atención:</label>
                                <input type="text" name="horarios" value={info.horarios} onChange={handleInfoChange} />
                            </div>
                            <div className={styles.divider}></div>
                            <h3><FaMoneyBillWave /> Valores de Cuota</h3>
                            <div className={styles.formGroup}>
                                <label>Cuota Anual ($):</label>
                                <input type="text" name="cuotaAnual" value={info.cuotaAnual} onChange={handleInfoChange} />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Marzo ($):</label>
                                    <input type="text" name="cuotaMarzo" value={info.cuotaMarzo} onChange={handleInfoChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Mayo ($):</label>
                                    <input type="text" name="cuotaMayo" value={info.cuotaMayo} onChange={handleInfoChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* NOVEDADES */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <FaNewspaper />
                        <h2 className={styles.sectionTitle}>Novedades de Cooperadora</h2>
                        <button className={styles.addBtn} onClick={addNovedad}><FaPlus /> Nueva Novedad</button>
                    </div>
                    
                    <div className={styles.novedadesGrid}>
                        {novedades.map((n) => (
                            <div key={n.id} className={styles.novedadCard}>
                                <div className={styles.cardHeader} onClick={() => toggleNovedad(n.id)} style={{cursor: 'pointer', marginBottom: expandedNovedades.includes(n.id) ? '1rem' : '0'}}>
                                    <h3 style={{margin: 0, fontSize: '1.2rem', color: 'var(--admin-text)'}}>{n.title}</h3>
                                    <div style={{display: 'flex', gap: '10px'}}>
                                        <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); setCoopData({...coopData, novedades: novedades.filter(nov => nov.id !== n.id)}); }}>
                                            <FaTrash />
                                        </button>
                                        <span style={{fontSize: '1.2rem'}}>{expandedNovedades.includes(n.id) ? '▲' : '▼'}</span>
                                    </div>
                                </div>
                                {expandedNovedades.includes(n.id) && (
                                    <div className={styles.novedadDetails}>
                                        <div className={styles.novedadImageSide}>
                                            <div className={styles.formGroup}>
                                                <label>Título:</label>
                                                <input 
                                                    type="text" 
                                                    className={styles.novedadTitleInput} 
                                                    value={n.title} 
                                                    onChange={(e) => handleNovedadChange(n.id, 'title', e.target.value)} 
                                                />
                                            </div>
                                            <div className={styles.previewBox}>
                                                <img src={n.url} alt={n.title} />
                                                <label className={styles.uploadOverlay}>
                                                    <FaFileUpload /> Cambiar
                                                    <input type="file" hidden onChange={(e) => handleFileUpload(e, n.id)} />
                                                </label>
                                            </div>
                                            <div className={styles.formGroup} style={{marginTop: '1rem'}}>
                                                <label>Fecha:</label>
                                                <input type="text" value={n.fecha} onChange={(e) => handleNovedadChange(n.id, 'fecha', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className={styles.novedadDataSide}>
                                            <div className={styles.formGroup}>
                                                <label>Descripción:</label>
                                                <textarea 
                                                    value={n.text} 
                                                    onChange={(e) => handleNovedadChange(n.id, 'text', e.target.value)} 
                                                    style={{minHeight: '100px'}}
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>Enlace a archivo (URL):</label>
                                                <input 
                                                    type="text" 
                                                    value={n.fileUrl || ''} 
                                                    placeholder="https://..."
                                                    onChange={(e) => handleNovedadChange(n.id, 'fileUrl', e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* BARRA FLOTANTE */}
                <div className={styles.floatingBar}>
                    <div className={styles.barInfo}>
                        <FaInfoCircle />
                        <p>Gestión de Cooperadora: <strong>Datos Bancarios y {novedades.length} novedades</strong></p>
                    </div>
                    <div className={styles.barActions}>
                        <button className={styles.saveBtn} onClick={saveChanges}>
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
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

export default CooperadoraAdmin;
