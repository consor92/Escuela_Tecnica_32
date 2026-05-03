import React from 'react';
import historiaData from '../data/historia.json';
import styles from './Historia.module.css';
import Link from 'next/link';

const Historia = () => {
  const { linea_de_tiempo } = historiaData;
  
  // Seleccionamos algunos hitos representativos para la Home (ej: primero, uno intermedio y el último)
  // O simplemente los primeros 3 para mantener un orden cronológico inicial.
  const featuredHistory = linea_de_tiempo ? linea_de_tiempo.slice(0, 3) : [];

  return (
    <section id="historia" className={styles.container}>
      <h2 className={styles.title}>Nuestra Historia</h2>
      <p className={styles.intro}>
        Un recorrido por los hitos que forjaron la identidad de la Escuela Técnica 32 "Gral. José de San Martín".
      </p>
      <div className={styles.grid}>
        {featuredHistory.map((item, i) => (
          <div key={i} className={styles.card}>
            <span className={styles.periodBadgeHome}>{item.periodo}</span>
            <h3>{item.titulo}</h3>
            <p>{item.subtitulo}</p>
            {/* Usamos imágenes genéricas de infra para las cards de la home */}
            <img src={`/images/infra${(i % 6) + 1}.png`} alt={item.titulo} />
          </div>
        ))}
      </div>
      <Link href="/historia" className={styles.link}>Conocé la historia completa</Link>
    </section>
  );
};

export default Historia;
