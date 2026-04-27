
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './TestCalendarModal.module.css';
import dynamic from 'next/dynamic';

const EventCalendar = dynamic(() => import('./EventCalendar'), { ssr: false });


const TestCalendarModal = ({ openFromNavBar, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Si viene desde NavBar, el control es externo
  const showModal = openFromNavBar !== undefined ? openFromNavBar : isOpen;

  // Controlar el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (showModal) {
      // Obtener el ancho actual de la barra de scroll
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Bloquear scroll y compensar el ancho perdido
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      // Restaurar scroll normal
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup: restaurar al desmontar el componente
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showModal]);

  if (!showModal) return null;

  return createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Calendario Escolar 2025<span></span></h2>
        <div className={styles.calendarContainer}>
          <EventCalendar />
        </div>
        <div className={styles.closeButtonContainer}>
          <button onClick={closeModal} className={styles.closeButton}>
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    typeof window !== 'undefined' ? document.body : null
  );
};

export default TestCalendarModal;
