import React, { useState } from 'react';
import styles from './ContactModal.module.css';

const ContactModal = ({ email, onClose }) => {
  const [status, setStatus] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEnabled) return;
    
    setStatus('enviando');
    
    // Simulación de envío
    setTimeout(() => {
      setStatus('exito');
      setTimeout(onClose, 2000);
    }, 1500);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h3>Enviar consulta a: {email}</h3>
          <button className={styles.close} onClick={onClose}>×</button>
        </header>
        {status === 'exito' ? (
          <div className={styles.success}>
            <p>¡Mensaje enviado con éxito!</p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {!isEnabled && (
              <div className={styles.disabledOverlay}>
                <p>Para evitar spam, por favor habilite el formulario.</p>
                <button type="button" onClick={() => setIsEnabled(true)} className={styles.enableBtn}>
                  Habilitar Formulario
                </button>
              </div>
            )}
            <div className={styles.field}>
              <label>Nombre y Apellido</label>
              <input type="text" required placeholder="Tu nombre..." disabled={!isEnabled} />
            </div>
            <div className={styles.field}>
              <label>Tu Email</label>
              <input type="email" required placeholder="tu@email.com" disabled={!isEnabled} />
            </div>
            <div className={styles.field}>
              <label>Mensaje</label>
              <textarea required placeholder="Escribe tu consulta aquí..." rows="5" disabled={!isEnabled}></textarea>
            </div>
            <button type="submit" className={styles.submit} disabled={status === 'enviando' || !isEnabled}>
              {status === 'enviando' ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;
