
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import styles from './CalendarModalTrigger.module.css';

const TestCalendarModal = dynamic(() => import('../TestCalendarModal'), { ssr: false });

const CalendarModalTrigger = ({ handleOpenSideBar }) => {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    if (handleOpenSideBar) {
      handleOpenSideBar();
      setTimeout(() => setOpen(true), 50); // Espera a que el sidebar cierre (ajusta el tiempo si es necesario)
    } else {
      setOpen(true);
    }
  };
  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={styles.calendarBtn}
      >
        CALENDARIO
      </button>
      {open && <TestCalendarModal openFromNavBar onClose={() => setOpen(false)} />}
    </>
  );
};

export default CalendarModalTrigger;
