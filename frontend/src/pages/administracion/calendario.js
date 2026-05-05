import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './calendario.module.css';
import { FaSave, FaPlus, FaTrash, FaCalendarCheck, FaFilter } from 'react-icons/fa';
import { EventModal } from '../../Components/Admin/CalendarioModals/CalendarioModals';

const CalendarioAdmin = () => {
    const [events, setEvents] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [filterMonth, setFilterMonth] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [notification, setNotification] = useState({ message: '', type: 'success' });

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/getData?fileName=calendar_events.json').then(res => res.json()),
            fetch('/api/configData').then(res => res.json())
        ]).then(([eventsData, configData]) => {
            if (Array.isArray(eventsData)) {
                setEvents(eventsData.map((e, index) => ({
                    ...e, 
                    id: e.id || index,
                    startDate: e.date, 
                    endDate: e.endDate || e.date
                })));
            } else {
                console.error('eventsData no es un arreglo:', eventsData);
                setEvents([]);
            }
            setConfig(configData);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Cargando...</div>;

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    const saveEvent = (eventData) => {
        if (eventData.id) {
            setEvents(events.map(e => e.id === eventData.id ? eventData : e));
        } else {
            const eventToSave = { ...eventData, id: Date.now(), date: eventData.startDate };
            setEvents([eventToSave, ...events]);
        }
    };

    const filteredEvents = events.filter(ev => {
        const d = new Date(ev.startDate);
        const matchMonth = filterMonth === 'all' || d.getMonth() === parseInt(filterMonth);
        const matchYear = filterYear === 'all' || d.getFullYear() === parseInt(filterYear);
        return matchMonth && matchYear;
    });

    const saveEvents = async () => {
        const user = localStorage.getItem('adminUserEmail') || 'Admin';
        try {
            const eventsToSave = events.map(({ startDate, endDate, ...e }) => ({
                ...e,
                date: startDate,
                endDate: endDate
            }));

            // ... (alertas importantes logic se mantiene igual)
            const nuevasAlertas = events
                .filter(e => e.type === 'Aviso importante')
                .map(e => ({
                    active: true,
                    start_date: e.startDate,
                    end_date: e.endDate,
                    message: e.title,
                    type: 'info'
                }));
            
            const updatedConfig = { 
                ...config, 
                alerts: { 
                    ...config.alerts, 
                    list: nuevasAlertas 
                } 
            };

            // Guardar eventos
            const resEvents = await fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: 'calendar_events.json',
                    data: eventsToSave,
                    user,
                    description: `Actualizó la agenda institucional (${eventsToSave.length} eventos registrados)`
                })
            });

            // Guardar config (si hubo cambios en alertas)
            const resConfig = await fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fileName: 'config.json',
                    data: updatedConfig,
                    user,
                    description: 'Sincronizó alertas importantes desde el calendario'
                })
            });

            if (resEvents.ok && resConfig.ok) {
                showNotification('¡Calendario y alertas guardados!');
            } else {
                showNotification('Error al guardar.', 'error');
            }
        } catch (error) {
            console.error('Error saving events:', error);
            showNotification('Error al guardar.', 'error');
        }
    };

    return (
        <AdminLayout title="Calendario Escolar">
            {(showModal || editingEvent) && (
                <EventModal 
                    onClose={() => { setShowModal(false); setEditingEvent(null); }} 
                    onSave={saveEvent} 
                    eventData={editingEvent}
                />
            )}
            
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.info}>
                        <h2>Agenda Institucional</h2>
                        <p>Gestioná fechas de exámenes, actos, feriados y eventos especiales.</p>
                    </div>
                    
                    <div className={styles.controls}>
                        <div className={styles.filterBar}>
                            <FaFilter />
                            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                <option value="all">Meses</option>
                                {Array.from({length: 12}).map((_, i) => (
                                    <option key={i} value={i}>{new Date(2026, i).toLocaleString('es', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                <option value="all">Años</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>
                        <button className={styles.addBtn} onClick={() => setShowModal(true)}><FaPlus /> Agregar Evento</button>
                    </div>
                </div>

                <div className={styles.tableCard}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Evento</th>
                                <th>Categoría</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map((ev, index) => (
                            <tr key={ev.id || index} onClick={() => setEditingEvent(ev)} style={{cursor: 'pointer'}}>
                                <td>{ev.startDate}</td>
                                <td>{ev.endDate}</td>
                                <td><strong>{ev.title}</strong></td>
                                <td>{ev.type}</td>
                                <td><button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); setEvents(events.filter(event => event.id !== ev.id)); }}><FaTrash /></button></td>
                            </tr>
                            ))}                        </tbody>
                    </table>
                </div>

                <div className={styles.floatingBar}>
                    <div className={styles.barInfo}><FaCalendarCheck /> <p><strong>{events.length} eventos</strong> en agenda.</p></div>
                    <button className={styles.saveBtn} onClick={saveEvents}><FaSave /> Guardar Cambios</button>
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

export default CalendarioAdmin;
