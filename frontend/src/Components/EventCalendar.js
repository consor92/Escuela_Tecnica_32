
import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './EventCalendar.module.css';
import dataCalendar from '../data/calendar_events.json';

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getEventMap = (events) => {
  const eventMap = new Map();
  events.forEach(event => {
    const dateStr = event.date;
    if (!eventMap.has(dateStr)) {
      eventMap.set(dateStr, []);
    }
    eventMap.get(dateStr).push(event);
  });
  return eventMap;
};

const EventCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [eventMap, setEventMap] = useState(new Map());

  useEffect(() => {
    if (dataCalendar && Array.isArray(dataCalendar)) {
      const parsedEvents = dataCalendar.map(event => ({
        ...event,
        date: typeof event.date === 'string' ? event.date : formatDate(new Date(event.date))
      }));
      setEventMap(getEventMap(parsedEvents));
    }
  }, []);

  const dateHasEvent = (dateToChecK) => {
    return eventMap.has(formatDate(dateToChecK));
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
  };

  const selectedDateEvents = useMemo(() => {
    return eventMap.get(formatDate(date)) || [];
  }, [date, eventMap]);

  const tileContent = ({ date, view }) => {
    if (view === 'month' && dateHasEvent(date)) {
      return (
        <div className={styles.eventDotContainer}>
          <div className={styles.eventDot}></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarWrapper}>
        <Calendar
          onChange={handleDateChange}
          value={date}
          tileContent={tileContent}
          locale="es-AR"
          navigationLabel={({ label }) => label.toUpperCase()}
          prevLabel="‹"
          nextLabel="›"
          prev2Label={null}
          next2Label={null}
          showNeighboringMonth={false}
        />
      </div>

      <div className={styles.eventListContainer}>
        <header className={styles.eventHeader}>
          <span>Eventos agendados</span>
          <h3>{date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
        </header>
        
        <div className={styles.eventList}>
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map((event, index) => (
              <div key={index} className={styles.eventItem}>
                <strong className={styles.eventTitle}>{event.title}</strong>
                <p className={styles.eventDescription}>{event.description}</p>
              </div>
            ))
          ) : (
            <div className={styles.noEventsMessage}>
              No hay eventos para esta fecha.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
