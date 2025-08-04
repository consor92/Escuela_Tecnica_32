import React, { useState } from 'react'
import Style from './Disciplines.module.css'
import Link from 'next/link';
import Image from 'next/image';
import AliceCarousel from 'react-alice-carousel';
import { IoChevronForwardSharp } from "react-icons/io5";
import { Zoom, Fade } from 'react-reveal';
import { BsFillCircleFill } from "react-icons/bs";
import { useRouter } from 'next/router';
import 'react-alice-carousel/lib/alice-carousel.css';

const url1 = 'https://cdn.wallpapersafari.com/95/49/RBudz6.jpg'
const url2 = 'https://cutewallpaper.org/28/cool-africa-wallpaper/1306022341.jpg'
const url3 = 'https://raw.githubusercontent.com/imagezzzz/blog_background/main/42.jpg'
const url4 = 'https://www.cbc.ca/kids/images/wild_and_wonderful_asian_animals_header_1140.jpg'
const url5 = 'https://e1.pxfuel.com/desktop-wallpaper/389/672/desktop-wallpaper-nosey-giraffe-long-neck.jpg'

const items = [
  <div key={1} className={Style.discipline__photo__two} style={{ backgroundImage: `url(${url1})` }}></div>,
  <div key={2} className={Style.discipline__photo__two} style={{ backgroundImage: `url(${url2})` }}></div>,
  <div key={3} className={Style.discipline__photo__two} style={{ backgroundImage: `url(${url3})` }}></div>,
  <div key={4} className={Style.discipline__photo__two} style={{ backgroundImage: `url(${url4})` }}></div>,
  <div key={5} className={Style.discipline__photo__two} style={{ backgroundImage: `url(${url5})` }}></div>,
];

const allDisciplines = [
  { id: 'computacion', label: 'Computación' },
  { id: 'automotores', label: 'Automotores' },
  { id: 'mecanica', label: 'Mecánica' },
];

const Disciplines = ({ props, showAs }) => {

  const [showText, setShowText] = useState('')
  const [valueSelect, setValueSelect] = useState('')
  const router = useRouter();

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
        {/* <h2 className={Style.container__titleVertical}>ESPECIALIDADES</h2> */}
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

        <section className={Style.containerPage__discipline__info}>
          <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Titulo Oficial Tecnico {props.title} (6 años)</h2>
          <h3>Resolución Nº ${props.resolucion}/SSGECP/2012 - Ministerio de educacion</h3>
        </section>

        <section className={Style.containerPage__discipline__about}>
          <h2> <IoChevronForwardSharp style={{ color: 'var(--font-color--redIntense)', height: '25', width: '25' }} />Por que estudiar {props.titleUppercase}</h2>
          <p>{props.text_about_part1}</p>
          <p>{props.text_about_part2}</p>
        </section>

        <section className={Style.containerPage__discipline__photo}>
          <Fade left duration={3000}>
            <div className={Style.discipline__photo__one}></div>
          </Fade>
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

        <section className={Style.containerPage__discipline__workshopStuden}>
          <h2>Trabajos de nuestros alumnos  <span className={Style.discipline__workshopStuden__line}></span> </h2>
          <div className={Style.container_discipline}>
            <Zoom duration={3000}>
              {props.imagesData?.map((item, key) =>
                <Image key={key} src={`${item.url}`} width={200} height={300}></Image>
              )}
            </Zoom>
          </div>
        </section>

        <section className={Style.containerPage__discipline__study}>
          <h2> Plan de estudio <span className={Style.discipline__study__line}></span></h2>
          <div className={Style.discipline__study__infoSubject}>
            {
              props.subjectPerYear?.map((item, key) => {
                return (
                  <div key={key} className={Style.study__infoSubject__info}>
                    <h2>{item.year}</h2>
                    <Image
                      src={`${item.imageUrl}`}
                      className={Style.study__infoSubject__image}
                      width={318}
                      height={200}></Image>
                    {
                      item.subjectName?.map((subject, key) => {
                        return (
                          <h3 key={key}><BsFillCircleFill style={{ color: 'var(--font-color--redIntense)', height: '7', width: '7' }} />&nbsp;&nbsp;{subject.name}</h3>
                        )
                      })
                    }
                  </div>
                )
              })
            }
          </div>
        </section>

      </div>
    )
  }

}


export default Disciplines;

