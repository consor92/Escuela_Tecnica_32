import React, { useState, useEffect } from 'react'
import Style from './Disciplines.module.css'
import Link from 'next/link';
import AliceCarousel from 'react-alice-carousel';
import { IoChevronForwardSharp } from "react-icons/io5";
import { Fade } from 'react-reveal';
import { BsFillCircleFill } from "react-icons/bs";
import { useRouter } from 'next/router';
import 'react-alice-carousel/lib/alice-carousel.css';

const urls = {
  "mecanica": [
    '/images/mecanica_1.jpeg', '/images/mecanica_2.jpeg', '/images/mecanica_3.jpeg', '/images/mecanica_4.jpeg', '/images/mecanica_5.jpeg'
  ],
  "computacion": [
    '/images/computacion_1.jpeg', '/images/computacion_2.png', '/images/computacion_3.png', '/images/computacion_4.jpeg', '/images/computacion_5.jpeg',
  ],
  "automotores": [
    '/images/automotores_1.jpeg', '/images/automotores_2.jpeg', '/images/automotores_3.png', '/images/automotores_4.jpeg'
  ]
}

const allDisciplines = [
  { id: 'computacion', label: 'Computación' },
  { id: 'automotores', label: 'Automotores' },
  { id: 'mecanica', label: 'Mecánica' },
];

const SubjectModal = ({ subject, onClose }) => {
  if (!subject) return null;
  return (
    <div className={Style.modalOverlay} onClick={onClose}>
      <div className={Style.modalContent} onClick={e => e.stopPropagation()}>
        <header className={Style.modalHeader}>
          <h3>{subject.name} {subject.es_troncal && <span className={Style.troncalBadge}>TRONCAL</span>}</h3>
          <button className={Style.modalClose} onClick={onClose}>×</button>
        </header>
        <div className={Style.modalBody}>
          <div className={Style.scrollableDescription}>
             <p className={Style.label}>Descripción:</p>
             <p>{subject.descripcion || 'Sin descripción disponible.'}</p>
          </div>
          <p className={Style.hours}><strong>Horas semanales:</strong> {subject.hs || subject.horas_semanales}</p>
          <p className={Style.dept}><strong>Departamento:</strong> {subject.departamento || 'N/A'}</p>
          <div className={Style.tags}>
            {subject.temas_troncales?.map((t, i) => <span key={i} className={Style.tag}>{t}</span>)}
          </div>
          {subject.pdf_link && subject.pdf_link !== '#' && (
            <a href={subject.pdf_link} target="_blank" rel="noreferrer" className={Style.downloadBtn}>
              Descargar Programa PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const Disciplines = ({ props, showAs }) => {
  const [showText, setShowText] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [imgIndices, setImgIndices] = useState([0, 1]); 
  const router = useRouter();

  const disciplineId = props?.id || router.query.id;
  const currentDisciplineUrls = urls[disciplineId] || [];

  useEffect(() => {
    if (currentDisciplineUrls.length > 1) {
      const interval = setInterval(() => {
        setImgIndices(prev => [
          (prev[0] + 1) % currentDisciplineUrls.length,
          (prev[1] + 1) % currentDisciplineUrls.length
        ]);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentDisciplineUrls]);

  const handleChangeDiscipline = (e) => {
    const selectDiscipline = e.target.value
    if (selectDiscipline) {
      router.push(`/discipline/${selectDiscipline.toLowerCase()}`);
    }
  }

  if (showAs === 'allDisciplines' || showAs === 'index') {
    return (
      <div id='disciplines' className={Style.container}>
        {props?.map((item, key) =>
          <Link key={key} href={`discipline/${item.id}`} className={Style[`container__${item.id}`]}
            onMouseEnter={() => setShowText(item.titleUppercase)}
            onMouseLeave={() => setShowText('')}
          >
            <h1 style={{ opacity: showText === item.titleUppercase ? 0 : 1, transition: 'opacity 0.2s ease' }}>{item.titleUppercase}</h1>
            <h1 style={{ opacity: showText === item.titleUppercase ? 1 : 0, transition: 'opacity 0.2s ease' }}>DESCUBRE MAS...</h1>
          </Link>
        )}
      </div>
    )
  }

  if (showAs === 'discipline') {
    return (
      <div className={Style.containerPage}>
        {selectedSubject && <SubjectModal subject={selectedSubject} onClose={() => setSelectedSubject(null)} />}
        
        <div className={Style.headerSection}>
          <div className={Style[`containerPage__${props.id}`]}>
            <div className={Style.selectorContainer}>
              <h2 className={Style.containerPage_subtitle}>Mira otra especialidades</h2>
              <select className={Style.containerPage__title} onChange={handleChangeDiscipline} value={props.id}>
                <option value="" disabled>Especialidad</option>
                {allDisciplines.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <section className={Style.containerPage__discipline__info}>
          <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Titulo Oficial Tecnico {props.title} (6 años)</h2>
          <h3>Resolución Nº {props.resolucion} - Ministerio de Educación</h3>
        </section>

        <section className={Style.infoSection}>
          <div className={Style.infoContent}>
            <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Por que estudiar {props.titleUppercase}</h2>
            <div className={Style.textWithLine}><p>{props.text_about_part1}</p></div>
            <div className={Style.textWithLine}><p>{props.text_about_part2}</p></div>
          </div>
          <div className={Style.infoImageContainer}>
            <Fade right duration={1500}>
              <div className={Style.imageWrapper}>
                <div className={Style.dynamicPhoto} style={{ backgroundImage: `url(${currentDisciplineUrls[imgIndices[0]]})` }}></div>
                <div className={Style.redCurve}></div>
              </div>
            </Fade>
          </div>
        </section>

        <section className={Style.fullWidthTextSection}>
          <div className={Style.infoContentCenter}>
            <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />{props.titleUppercase} es considerada una carrera del futuro?</h2>
            <div className={Style.textWithLine}><p>{props.text_future_part1}</p></div>
            <div className={Style.textWithLine}><p>{props.text_future_part2}</p></div>
          </div>
        </section>

        <section className={Style.infoSection}>
          <div className={Style.infoImageContainer}>
             <Fade left duration={1500}>
               <div className={Style.imageWrapper}>
                 <div className={`${Style.dynamicPhoto} ${Style.photoLeft}`} style={{ backgroundImage: `url(${currentDisciplineUrls[imgIndices[1] % currentDisciplineUrls.length]})` }}></div>
                 <div className={`${Style.redCurve} ${Style.curveLeft}`}></div>
               </div>
             </Fade>
          </div>
          <div className={Style.infoContent}>
            <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Practicas Profesionalizantes durante la carrera</h2>
            <div className={Style.textWithLine}><p>{props.text_practice_part1}</p></div>
          </div>
        </section>

        <section className={Style.containerPage__discipline__study}>
          <h2> Plan de estudio <span className={Style.discipline__study__line}></span></h2>
          <div className={Style.studyContainer}>
            {props.subjectPerYear?.map((item, key) => (
              <div key={key} className={Style.yearCard}>
                <div className={Style.yearHeader}>
                  <h4 className={Style.yearLabel}>{item.year}</h4>
                  <span className={Style.yearSubLabel}>{key < 2 ? "Ciclo Básico" : `${key - 1}° Superior`}</span>
                </div>
                <div className={Style.subjectsList}>
                  {item.subjectName?.map((subject, k) => (
                    <span key={k} className={Style.subjectItem} onClick={() => subject.descripcion && setSelectedSubject(subject)}>
                      <BsFillCircleFill className={Style.bullet} /> 
                      <span>{subject.name} {subject.descripcion && <small>🔍</small>}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }
}

export default Disciplines;
