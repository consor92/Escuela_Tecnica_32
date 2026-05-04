import React, { useState, useEffect } from 'react';
import styles from './AlertBanner.module.css';

const AlertBanner = ({ onVisibilityChange }) => {
  const [config, setConfig] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    fetch('/api/configData')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Error fetching config:', err));
  }, []);

  useEffect(() => {
    const alerts = config?.alerts;
    if (alerts) {
      const todayStr = new Date().toLocaleDateString('sv-SE');
      const allAlerts = [];

      // 1. Añadir alerta principal si es válida y activa
      if (alerts.active && alerts.start_date && alerts.end_date && todayStr >= alerts.start_date && todayStr <= alerts.end_date) {
        allAlerts.push({ message: alerts.message });
      }

      // 2. Añadir alertas de la lista si están activas y en rango
      if (alerts.list) {
        const activeList = alerts.list.filter(alert => 
          alert.active &&
          alert.start_date <= todayStr && 
          alert.end_date >= todayStr
        );
        allAlerts.push(...activeList);
      }

      setActiveAlerts(allAlerts);
      if (onVisibilityChange) onVisibilityChange(allAlerts.length > 0);
    } else {
      setActiveAlerts([]);
      if (onVisibilityChange) onVisibilityChange(false);
    }
  }, [config, onVisibilityChange]);

  if (activeAlerts.length === 0 || !config) return null;

  // Unimos los mensajes de todas las alertas activas
  const separatorChar = '\u00A0'.repeat(20) + ' • ' + '\u00A0'.repeat(20);
  const messages = activeAlerts.map(a => a.message).join(separatorChar);
  
  const separator = separatorChar;
  const marqueeText = Array(3).fill(messages).join(separator) + separator;

  return (
    <div className={`${styles.banner} ${styles[config.alerts.type] || styles.info}`}>
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeContent}>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
