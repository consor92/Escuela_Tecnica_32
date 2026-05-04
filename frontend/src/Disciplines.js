import React, { useState } from 'react'
import Style from './Disciplines.module.css'
import Link from 'next/link';
import Image from 'next/image';
import AliceCarousel from 'react-alice-carousel';
import { IoChevronForwardSharp } from "react-icons/io5";
import { BsFillCircleFill } from "react-icons/bs";
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import 'react-alice-carousel/lib/alice-carousel.css';

const urls = {
  "mecanica": {
    url1: '/images/mecanica_1.jpeg',
    url2: '/images/mecanica_2.jpeg',
    url3: '/images/mecanica_3.jpeg',
    url4: '/images/mecanica_4.jpeg',
    url5: '/images/mecanica_5.jpeg'
  },
  "computacion": {
    url1: '/images/computacion_1.jpeg',
    url2: '/images/computacion_2.png',
    url3: '/images/computacion_3.png',
    url4: '/images/computacion_4.jpeg',
    url5: '/images/computacion_5.jpeg',
  },
  "automotores": {
    url1: '/images/automotores_1.jpeg',
    url2: '/images/automotores_2.jpeg',
    url3: '/images/automotores_3.png',
    url4: '/images/automotores_4.jpeg'
  }
}

const allDisciplines = [
  { id: 'computacion', label: 'Computación' },
  { id: 'automotores', label: 'Automotores' },
  { id: 'mecanica', label: 'Mecánica' },
];

const Disciplines = ({ props, showAs }) => {
  const [showText, setShowText] = useState('')
  const [valueSelect, setValueSelect] = useState('')
  const router = useRouter();

  const { id: disciplineName } = router.query;
  const currentDisciplineUrls = urls[disciplineName] || {};
  
  const items = Object.values(currentDisciplineUrls).map((imageUrl, index) => (
    <div 
      key={index + 1} 
      className={Style.discipline__photo__two} 
      style={{ 
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        height: '500px',
        minHeight: '400px'
      }}
    ></div>
  ));

  const handleMouseEnter = (text) => {
    setShowText(text)
  }

  const handleMouseLeave = () => {
    setShowText('')
  }

  const handleChangeDiscipline = (e) => {
    const selectDiscipline = e.target.value
    if (selectDiscipline) {
      setValueSelect(selectDiscipline)
      router.push(`/discipline/${selectDiscipline.toLowerCase()}`);
    }
  }

  if (showAs === 'allDisciplines') {
    return (
      <div id='disciplines' className={Style.container}>
        {props?.map((item, key) =>
          <Link key={key} href={`discipline/${item.id}`} className={Style[`container__${item.id}`]}
            onMouseEnter={() => handleMouseEnter(`${item.titleUppercase}`)}
            onMouseLeave={() => handleMouseLeave()}
          >
            <h1 style={{ opacity: showText === `${item.titleUppercase}` ? 0 : 1, transition: 'opacity 0.2s ease' }}>{item.titleUppercase}</h1>
            <h1 style={{ opacity: showText === `${item.titleUppercase}` ? 1 : 0, transition: 'opacity 0.2s ease' }}>DESCUBRE MAS...</h1>
          </Link>
        )}
      </div>
    )
  }

  if (showAs === 'discipline') {
    return (
      <div className={Style.containerPage}>
        <div className={Style[`containerPage__${props.id}`]}>
          <h2 className={Style.containerPage_subtitle}>Mira otra especialidades</h2>
          <select className={Style.containerPage__title} onChange={handleChangeDiscipline} value={valueSelect}>
            <option value="" disabled>Especialidad</option>
            {allDisciplines.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={Style[`fotoPortada_${props.id}`]}></div>
       
        <section className={Style.containerPage__discipline__info}>
          <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Titulo Oficial Tecnico {props.title} (6 años)</h2>
          <h3>Resolución Nº {props.resolucion} - Ministerio de educacion</h3>
        </section>

        <section className={Style.containerPage__discipline__about}>
          <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Por que estudiar {props.titleUppercase}</h2>
          <p>{props.text_about_part1}</p>
          <p>{props.text_about_part2}</p>
        </section>

        <section className={Style.containerPage__discipline__photo}>
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 3 }}
            viewport={{ once: true }}
            style={{ width: '100%' }}
          >
            <div className={Style[`discipline_${props.id}`]}></div>
          </motion.div>
        </section>

        <section className={Style.containerPage__discipline__future}>
          <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />{props.titleUppercase} es considerada una carrera del futuro?</h2>
          <p>{props.text_future_part1}</p>
          <p>{props.text_future_part2}</p>
        </section>

        <section className={Style.containerPage__discipline__photo}>
          <AliceCarousel
            autoPlay
            autoPlayControls={false}
            autoPlayStrategy="none"
            autoPlayInterval={1000}
            animationDuration={3500}
            animationType="fadeout"
            infinite
            touchTracking={false}
            disableDotsControls
            disableButtonsControls
            responsive={{
              768: {
                items: 1,
                itemsFit: 'cover',
              }
            }}
            items={items}
          />
        </section>

        <section className={Style.containerPage__discipline__practice}>
          <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Practicas Profesionalizantes durante la carrera</h2>
          <p>{props.text_practice_part1}</p>
        </section>

        <section className={Style.containerPage__discipline__study} style={{ paddingBottom: '0', marginBottom: '0' }}>
          <h2> Plan de estudio <span className={Style.discipline__study__line}></span></h2>
          <div className={Style.discipline__study__infoSubject} style={{ padding: '20px', marginBottom: '0' }}>
            {
              props.subjectPerYear?.map((item, key) => {
                return (
                  <div key={key} className={Style.study__infoSubject__info} style={{ marginBottom: '10px' , height: '600px'}}>
                    <h2>{item.year}</h2>
                    {
                      item.subjectName?.map((subject, key) => {
                        return (
                          <h3 key={key}><BsFillCircleFill style={{ color: 'var(--font-color--redIntense)', height: '7', width: '7' }} />&nbsp;&nbsp;{subject.name}</h3>
                        );
                      })
                    }
                  </div>
                );
              })
            }
          </div>
        </section>
      </div>
    )
  }
}

export default Disciplines;
