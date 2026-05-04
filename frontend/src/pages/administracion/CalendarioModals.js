import React, { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import styles from './calendario.module.css';

export const EventModal = ({ onClose, onSave, eventData }) => {
    const [event, setEvent] = useState(eventData || { 
        title: '', 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date().toISOString().split('T')[0], 
        type: 'Evento' 
    });

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <header><h3>{eventData ? 'Editar Evento' : 'Nuevo Evento'}</h3><button onClick={onClose}><FaTimes /></button></header>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}><label>Título:</label><input type="text" value={event.title} onChange={(e) => setEvent({...event, title: e.target.value})} /></div>
                    <div className={styles.row}>
                        <div className={styles.formGroup}><label>Inicio:</label><input type="date" value={event.startDate} onChange={(e) => setEvent({...event, startDate: e.target.value})} /></div>
                        <div className={styles.formGroup}><label>Fin:</label><input type="date" value={event.endDate} onChange={(e) => setEvent({...event, endDate: e.target.value})} /></div>
                    </div>
                    <div className={styles.formGroup}><label>Categoría:</label><select value={event.type} onChange={(e) => setEvent({...event, type: e.target.value})}>
                        <option>Evento</option><option>Examen</option><option>Acto</option><option>Feriado</option><option>Aviso importante</option>
                    </select></div>
                </div>
                <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className={styles.saveBtn} onClick={() => { onSave(event); onClose(); }}>Guardar Evento</button>
                </footer>
            </div>
        </div>
    );
};
