import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './configuracion.module.css';
import { 
    FaSave, 
    FaPhone, 
    FaEnvelope, 
    FaMapMarkerAlt, 
    FaSearch, 
    FaInstagram, 
    FaFacebook, 
    FaGlobe,
    FaExclamationTriangle,
    FaTools,
    FaChartLine
} from 'react-icons/fa';

const Configuracion = () => {
    const [config, setConfig] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetch('/api/admin/getData?fileName=config.json')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Error cargando configuración:', err));
    }, []);

    const handleSave = async () => {
        const user = localStorage.getItem('adminUserEmail') || 'Admin';
        
        // Determinar qué cambió principalmente para la descripción
        let description = 'Actualizó la configuración general';
        if (config.alerts?.active) description = `Actualizó y activó alerta crítica: "${config.alerts.message.substring(0, 30)}..."`;
        else if (config.maintenance) description = 'Activó el modo mantenimiento del sitio';
        else if (!config.maintenance && config.maintenance !== undefined) description = 'Desactivó el modo mantenimiento';

        try {
            const response = await fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fileName: 'config.json', 
                    data: config,
                    user,
                    description
                }),
            });
            if (response.ok) showNotification('Configuración guardada exitosamente.');
            else showNotification('Error al guardar.', 'error');
        } catch (error) {
            console.error('Error saving:', error);
            showNotification('Error al guardar.', 'error');
        }
    };

    const handleToggleSection = (section) => {
        setConfig({
            ...config,
            sections: {
                ...config.sections,
                [section]: !config.sections[section]
            }
        });
    };

    const handleAlertChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig({
            ...config,
            alerts: {
                ...config.alerts,
                [name]: type === 'checkbox' ? checked : value
            }
        });
    };

    const handleNestedChange = (category, field, value) => {
        setConfig({
            ...config,
            [category]: {
                ...config[category],
                [field]: value
            }
        });
    };

    if (!config) return <div>Cargando...</div>;

    const alertStyles = {
        info: { bg: '#3498db', icon: 'info' },
        warning: { bg: '#f1c40f', icon: 'warning' },
        danger: { bg: '#e74c3c', icon: 'danger' }
    };

    return (
        <AdminLayout title="Configuración Global">
            <div className={styles.container}>
                
                {/* MODO MANTENIMIENTO */}
                <section className={styles.section}>
                    <div className={`${styles.maintenanceCard} ${config.maintenance ? styles.activeMaintenance : ''}`}>
                        <div className={styles.maintenanceInfo}>
                            <FaTools />
                            <div>
                                <h3>Modo Mantenimiento</h3>
                                <p>Si se activa, los usuarios verán una página de "Sitio en Construcción".</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setConfig({...config, maintenance: !config.maintenance})}
                            className={config.maintenance ? styles.btnOn : styles.btnOff}
                        >
                            {config.maintenance ? 'ACTIVADO' : 'DESACTIVADO'}
                        </button>
                    </div>
                </section>

                <div className={styles.configGrid}>
                    {/* COLUMNA IZQUIERDA: ALERTAS Y SECCIONES */}
                    <div className={styles.column}>
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FaExclamationTriangle className={styles.iconAlert} />
                                <h2>Alertas y Comunicados Críticos</h2>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.formGroup}>
                                    <label className={styles.switchLabel}>
                                        <span>Estado de la Alerta:</span>
                                        <button 
                                            onClick={() => setConfig({...config, alerts: {...config.alerts, active: !config.alerts?.active}})}
                                            className={config.alerts?.active ? styles.btnOn : styles.btnOff}
                                        >
                                            {config.alerts?.active ? 'ACTIVADO' : 'DESACTIVADO'}
                                        </button>
                                    </label>
                                </div>
                                
                                {config.alerts?.active && (
                                    <div className={styles.alertPreview} style={{ backgroundColor: alertStyles[config.alerts?.type || 'info'].bg }}>
                                        <strong>VISTA PREVIA:</strong> {config.alerts?.message || 'Sin mensaje cargado...'}
                                    </div>
                                )}

                                <div className={styles.formGroup}>
                                    <label>Mensaje:</label>
                                    <textarea 
                                        name="message" 
                                        value={config.alerts?.message || ''} 
                                        onChange={handleAlertChange}
                                    />
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo:</label>
                                        <select name="type" value={config.alerts?.type || 'info'} onChange={handleAlertChange}>
                                            <option value="info">Info (Azul)</option>
                                            <option value="warning">Advertencia (Amarillo)</option>
                                            <option value="danger">Urgente (Rojo)</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Expira:</label>
                                        <input type="date" name="end_date" value={config.alerts?.end_date || ''} onChange={handleAlertChange} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h2>Módulos del Sitio</h2>
                            <div className={styles.sectionsGrid}>
                                {Object.keys(config.sections || {}).map((section) => (
                                    <div key={section} className={styles.toggleCard}>
                                        <span>{section === 'show_perfil_profesional' ? 'Perfil profesional' : section.replace('_', ' ')}</span>
                                        <button 
                                            onClick={() => handleToggleSection(section)}
                                            className={config.sections?.[section] ? styles.btnOn : styles.btnOff}
                                        >
                                            {config.sections?.[section] ? 'ON' : 'OFF'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* COLUMNA DERECHA: SEO, CONTACTO Y REDES */}
                    <div className={styles.column}>
                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FaSearch />
                                <h2>SEO e Identidad</h2>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.formGroup}>
                                    <label>Título del Sitio:</label>
                                    <input type="text" value={config.seo?.title || ''} onChange={(e) => handleNestedChange('seo', 'title', e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Descripción Meta:</label>
                                    <textarea value={config.seo?.description || ''} onChange={(e) => handleNestedChange('seo', 'description', e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label><FaChartLine /> Google Analytics ID:</label>
                                    <input type="text" value={config.analytics || ''} onChange={(e) => setConfig({...config, analytics: e.target.value})} placeholder="G-XXXXXXXXXX" />
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <FaGlobe />
                                <h2>Redes Sociales y Contacto</h2>
                            </div>
                            <div className={styles.card}>
                                <div className={styles.formGroup}>
                                    <label><FaMapMarkerAlt /> Dirección:</label>
                                    <input type="text" value={config.contact?.address || ''} onChange={(e) => handleNestedChange('contact', 'address', e.target.value)} />
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label><FaPhone /> Teléfonos:</label>
                                        <input type="text" value={config.contact?.phones?.join(', ') || ''} onChange={(e) => handleNestedChange('contact', 'phones', e.target.value.split(', '))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label><FaEnvelope /> Emails:</label>
                                        <input type="text" value={config.contact?.emails?.join(', ') || ''} onChange={(e) => handleNestedChange('contact', 'emails', e.target.value.split(', '))} />
                                    </div>
                                </div>
                                <div className={styles.toggleCard}>
                                    <span>Formulario de Contacto:</span>
                                    <button 
                                        onClick={() => setConfig({...config, contact: {...config.contact, enable_contact_form: !config.contact?.enable_contact_form}})}
                                        className={config.contact?.enable_contact_form ? styles.btnOn : styles.btnOff}
                                    >
                                        {config.contact?.enable_contact_form ? 'ON' : 'OFF'}
                                    </button>
                                </div>
                                <div className={styles.divider}></div>
                                <h3>Información de Transporte</h3>
                                <div className={styles.formGroup}>
                                    <label>Colectivos:</label>
                                    <input type="text" value={config.contact?.transport?.colectivos || ''} onChange={(e) => handleNestedChange('contact', 'transport', {...config.contact.transport, colectivos: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Trenes/Subtes:</label>
                                    <input type="text" value={config.contact?.transport?.trenes_subtes || ''} onChange={(e) => handleNestedChange('contact', 'transport', {...config.contact.transport, trenes_subtes: e.target.value})} />
                                </div>
                                <div className={styles.divider}></div>
                                <div className={styles.formGroup}>
                                    <label><FaInstagram /> Instagram (Link):</label>
                                    <input type="text" value={config.contact?.social?.instagram || ''} onChange={(e) => handleNestedChange('contact', 'social', {...config.contact.social, instagram: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Instagram API Token:</label>
                                    <input type="password" value={config.contact?.social?.instagram_api_token || ''} onChange={(e) => handleNestedChange('contact', 'social', {...config.contact.social, instagram_api_token: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label><FaFacebook /> Facebook (Link):</label>
                                    <input type="text" value={config.contact?.social?.facebook || ''} onChange={(e) => handleNestedChange('contact', 'social', {...config.contact.social, facebook: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Facebook App ID:</label>
                                    <input type="text" value={config.contact?.social?.facebook_app_id || ''} onChange={(e) => handleNestedChange('contact', 'social', {...config.contact.social, facebook_app_id: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Facebook App Secret:</label>
                                    <input type="password" value={config.contact?.social?.facebook_app_secret || ''} onChange={(e) => handleNestedChange('contact', 'social', {...config.contact.social, facebook_app_secret: e.target.value})} />
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        <FaSave /> Guardar Cambios Globales
                    </button>
                </div>

                {notification.message && (
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        padding: '15px 25px',
                        backgroundColor: notification.type === 'error' ? '#e74c3c' : '#27ae60',
                        color: 'white',
                        borderRadius: '5px',
                        zIndex: 1000,
                        fontWeight: 'bold'
                    }}>
                        {notification.message}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Configuracion;
