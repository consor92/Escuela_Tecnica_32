
import { FaRegCalendarAlt } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './EventCalendar.module.css';
import dataCalendar from '../pages/calendar_events.json';

console.log('CALENDARIO - Data importada:', dataCalendar);

function getEventsForMonth(events, date) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return events.filter(e => {
    const [y, m] = e.date.split('-');
    return parseInt(y) === year && parseInt(m) === month;
  });
}


const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState(dataCalendar || []);
  const [monthEvents, setMonthEvents] = useState([]);

  useEffect(() => {
    console.log('Events cargados:', events);
    setMonthEvents(getEventsForMonth(events, currentDate));
  }, [currentDate, events]);

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(currentDate);
    newDate.setMonth(newMonth);
    setCurrentDate(newDate);
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.monthSelector}>
        <select value={currentDate.getMonth()} onChange={handleMonthChange}>
          {months.map((m, idx) => (
            <option value={idx} key={m}>{m}</option>
          ))}
        </select>
      </div>
      <div className={styles.calendarAndEvents}>
        <Calendar
          value={currentDate}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              const isToday = date.toDateString() === new Date().toDateString();
              const hasEvent = monthEvents.some(e => {
                const [y, m, d] = e.date.split('-');
                return (
                  parseInt(y) === date.getFullYear() &&
                  parseInt(m) === date.getMonth() + 1 &&
                  parseInt(d) === date.getDate()
                );
              });
              if (isToday) return styles.todayDay;
              return hasEvent ? styles.eventDay : styles.defaultDay;
            }
          }}
          prevLabel={null}
          nextLabel={null}
          prev2Label={null}
          next2Label={null}
          showNeighboringMonth={false}
          navigationLabel={() => null}
          navigationAriaLabel={null}
          className={styles.noNav}
        />
        <div >
          {monthEvents.length === 0 ? (
            <div className={styles.eventList}>
              <p>No hay eventos para este mes.</p>
            </div>
          ) : (
            <div className={styles.eventListComplete}>
              <ul>
                {monthEvents.map((e, i) => {
                  const day = parseInt(e.date.split('-')[2], 10);
                  return (
                    <li key={i}>
                      <span className={styles.eventDayBox}>{day}</span>
                      <span>
                        <strong className={styles.eventTitle}>{e.title}</strong><br />
                        <span>{e.description}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

      </div>


    </div>
  );
};

export default EventCalendar;
