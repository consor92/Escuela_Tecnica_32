import React, { useState } from 'react';
import styles from './Inscripciones.module.css'
import Link from 'next/link';



const Inscripciones = () => {

  const [showText, setShowText] = useState('')

  const handleMouseEnter = (text) => {
    setShowText(text)
  }

  const handleMouseLeave = () => {
    setShowText('')
  }
  return (
    <div id='inscripciones' className={styles.container}>
      {/* <h2 className={styles.container__titleVertical}>INSCRIPCIONES</h2> */}
      <h1 className={styles.title}>Comienza estudiar con nosotros<span></span></h1>
      <div className={styles.content}>
        <a href={'https://buenosaires.gob.ar/educacion/estudiantes/inscripcionescolar'} target="_blank" className={styles.content__image}
          onMouseEnter={() => handleMouseEnter(`ingresa`)}
          onMouseLeave={() => handleMouseLeave()}>
          <div style={{ opacity: showText === '' ? 1 : 0, transition: `opacity 0.3s ease` }}>
            <h2>Construye tu futuro...</h2>
            <p>Nuestros programas curriculares y actividades te permitirán desarrollar tus habilidades y talentos.¡Inscríbete hoy y únete a nuestra comunidad!.</p>
          </div>
          <h2 className={styles.content__title__inscripcion} style={{ opacity: showText === 'ingresa' ? 1 : 0, transition: `opacity 0.3s ease` }}>INSCRIBITE</h2>
        </a>
      </div >
    </div >
  );
};

export default Inscripciones;

