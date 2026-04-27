import React, { useState, useEffect } from 'react';
import styles from './AlertBanner.module.css';
import config from '../data/config.json';

const AlertBanner = ({ onVisibilityChange }) => {
  const { alerts } = config;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (alerts && alerts.active) {
      // Obtenemos la fecha de hoy en formato YYYY-MM-DD
      const todayStr = new Date().toLocaleDateString('sv-SE');
      
      // Si existe rango de fechas, validamos si hoy está dentro
      if (alerts.start_date && alerts.end_date) {
        if (todayStr >= alerts.start_date && todayStr <= alerts.end_date) {
          setIsVisible(true);
          if (onVisibilityChange) onVisibilityChange(true);
        } else {
          setIsVisible(false);
          if (onVisibilityChange) onVisibilityChange(false);
        }
      } 
      // Si solo existe una fecha única (retrocompatibilidad)
      else if (alerts.date) {
        if (alerts.date === todayStr) {
          setIsVisible(true);
          if (onVisibilityChange) onVisibilityChange(true);
        } else {
          setIsVisible(false);
          if (onVisibilityChange) onVisibilityChange(false);
        }
      }
    } else {
      setIsVisible(false);
      if (onVisibilityChange) onVisibilityChange(false);
    }
  }, [alerts, onVisibilityChange]);

  const handleClose = () => {
    setIsVisible(false);
    if (onVisibilityChange) onVisibilityChange(false);
  };

  if (!isVisible) return null;

  const separator = '\u00A0'.repeat(20) + ' • ' + '\u00A0'.repeat(20);
  const marqueeText = Array(3).fill(alerts.message).join(separator) + separator;

  return (
    <div className={`${styles.banner} ${styles[alerts.type] || styles.info}`}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>
      <button className={styles.closeBtn} onClick={handleClose} aria-label="Cerrar alerta">
        ×
      </button>
    </div>
  );
};

export default AlertBanner;
