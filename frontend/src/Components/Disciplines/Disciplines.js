import React, { useState, useEffect } from 'react'
import Style from './Disciplines.module.css'
import Link from 'next/link';
import AliceCarousel from 'react-alice-carousel';
import { IoChevronForwardSharp } from "react-icons/io5";
import { BsFillCircleFill } from "react-icons/bs";
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import 'react-alice-carousel/lib/alice-carousel.css';

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
  const [config, setConfig] = useState(null);
  const [showText, setShowText] = useState('')
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [imgIndices, setImgIndices] = useState([0, 1]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/configData')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Error fetching config:', err));
  }, []);

  // Usar el carousel dinámico desde los props
  const currentDisciplineUrls = props?.carousel || [];
  const disciplineId = props?.id || 'computacion';

  useEffect(() => {
    // Resetear índices cuando la disciplina cambia
    setImgIndices([0, 1]);
  }, [props?.id]);

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

  if (showAs === 'discipline' && config) {
    return (
      <div className={Style.containerPage}>
        {selectedSubject && <SubjectModal subject={selectedSubject} onClose={() => setSelectedSubject(null)} />}
        
        <div className={Style.headerSection}>
          <div className={Style[`containerPage__${disciplineId}`]}>
            <div className={Style.selectorContainer}>
              <h2 className={Style.containerPage_subtitle}>Mira otra especialidades</h2>
              <select className={Style.containerPage__title} onChange={handleChangeDiscipline} value={disciplineId}>
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
          {props.turnos && (
            <div className={Style.turnosContainer}>
              {props.turnos.TM && <span className={Style.turnoBadge}>TM</span>}
              {props.turnos.TT && <span className={Style.turnoBadge}>TT</span>}
              {props.turnos.TV && <span className={Style.turnoBadge}>TV</span>}
            </div>
          )}
        </section>

        <section className={Style.infoSection}>
          <div className={Style.infoContent}>
            <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Por que estudiar {props.titleUppercase}</h2>
            <div className={Style.textWithLine}><p>{props.text_about_part1}</p></div>
            <div className={Style.textWithLine}><p>{props.text_about_part2}</p></div>
          </div>
          <div className={Style.infoImageContainer}>
            {currentDisciplineUrls.length > 0 && (
              <div 
                key={`${props.id}-1`}
                className={`${Style.imageWrapper} ${Style.fadeInImage}`}
                style={{ width: '100%', height: '100%' }}
              >
                <div className={Style.dynamicPhoto} style={{ backgroundImage: `url(${currentDisciplineUrls[imgIndices[0]]})` }}></div>
                <div className={Style.redCurve}></div>
              </div>
            )}
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
             {currentDisciplineUrls.length > 1 && (
               <div
                  key={`${props.id}-2`}
                  className={`${Style.imageWrapper} ${Style.fadeInImage}`}
                  style={{ width: '100%', height: '100%' }}
                >
                 <div className={`${Style.dynamicPhoto} ${Style.photoLeft}`} style={{ backgroundImage: `url(${currentDisciplineUrls[imgIndices[1] % currentDisciplineUrls.length]})` }}></div>
                 <div className={`${Style.redCurve} ${Style.curveLeft}`}></div>
               </div>
             )}
          </div>
          <div className={Style.infoContent}>
            <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Practicas Profesionalizantes durante la carrera</h2>
            <div className={Style.textWithLine}><p>{props.text_practice_part1}</p></div>
          </div>
        </section>

        {config.sections.show_perfil_profesional && (
          <section className={Style.fullWidthTextSection}>
            <div className={Style.infoContentCenter}>
              <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Perfil Profesional</h2>
              <div className={Style.textWithLine}><p>{props.perfil_profesional}</p></div>
            </div>
          </section>
        )}

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
  return null;
}

export default Disciplines;
