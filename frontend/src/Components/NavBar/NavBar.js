import React, { useState, useEffect } from 'react'
import Style from './NavBar.module.css'
import Link from 'next/link'
import dynamic from 'next/dynamic';
import { HiMenu } from 'react-icons/hi'
import { useRouter } from 'next/router'

const CalendarModalTrigger = dynamic(() => import('./CalendarModalTrigger'), { ssr: false });
const NavBar = ({ page, isAlertVisible }) => {
  const [config, setConfig] = useState(null);
  const [sideBarOpen, setSideBarOpen] = useState(false)
  const router = new useRouter()

  useEffect(() => {
    fetch('/api/configData')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Error fetching config:', err));
  }, []);

  const sections = config?.sections || {};

  const handleOpenSideBar = () => {
    setSideBarOpen(!sideBarOpen)
  }

  const navTop = isAlertVisible ? '40px' : '0';

  const handleNavigateToAnchor = async (hash) => {
    setSideBarOpen(false)

    if (router.pathname !== '/') {
      await router.push(`/#${hash === 'novedades' ? 'novedades-title' : hash}`)
    } else {
      const targetId = hash === 'novedades' ? 'novedades-title' : hash;
      const element = document.getElementById(targetId)
      if (element) {
        const elementRect = element.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        
        let targetScrollPos;
        if (hash === 'inscripciones') {
          // Centrar en la ventana
          const offset = (window.innerHeight - elementRect.height) / 2;
          targetScrollPos = absoluteElementTop - offset;
        } else {
          // Justo al inicio (restando la altura del navbar, aprox 80px)
          targetScrollPos = absoluteElementTop - 80;
        }
        
        window.scrollTo({
          top: targetScrollPos,
          behavior: 'smooth'
        });
      }
    }
  }

  return (
    <div className={Style.container} style={{ top: navTop }}>
      <Link href='/' className={Style.container__EscuelaTecnica}>
        <>
          <div className={Style.container__EscuelaTecnica_Img}>
             <img 
                src="/images/logoET32.png" 
                alt="Logo ET32" 
                style={{ width: '90px', height: '90px', objectFit: 'contain' }}
                className={Style.logoMain}
             />
          </div>
          <div className={Style.escuelaTecnica_info}>
            <h2>E.T. N° 32</h2>
            <h3>Gral José de San Martín ET32 DE14</h3>
          </div>
        </>
      </Link>
      <div className={`${Style.container__navBar} ${sideBarOpen ? Style.container__navBarOpen : Style.container__navBarClosed}`}>
        <div className={Style.container__navBarTop}>
          <nav>
            {sections.calendario && <CalendarModalTrigger handleOpenSideBar={handleOpenSideBar} />}
            {sections.autoridades && <Link href="/autoridades" onClick={handleOpenSideBar}>AUTORIDADES</Link>}
            {sections.alumnos && <Link href="/alumnos" onClick={handleOpenSideBar}>ALUMNOS</Link>}
            {sections.profesores && <Link href="/profesores" onClick={handleOpenSideBar}>PROFESORES</Link>}
            {sections.emergencia && <Link href="/emergencia" onClick={handleOpenSideBar} className={Style.emergenciaLink}>PROTOCOLOS DE EMERGENCIAS</Link>}
          </nav>
        </div>
        <div className={Style.container__navBarBottom}>
          <nav>
            {sections.novedades && <button onClick={() => handleNavigateToAnchor('novedades')}>NOVEDADES</button>}
            {sections.especialidades && <button onClick={() => handleNavigateToAnchor('disciplines')}>ESPECIALIDADES</button>}
            {sections.inscripciones && <button onClick={() => handleNavigateToAnchor('inscripciones')}>INSCRIPCIONES</button>}
            {sections.infraestructura && <button onClick={() => handleNavigateToAnchor('sections')}>INFRAESTRUCTURA</button>}
            {sections.cooperadora && <button onClick={() => handleNavigateToAnchor('cooperadora')}>COOPERADORA</button>}
            {sections.contacto && <button onClick={() => handleNavigateToAnchor('contacto')}>CONTACTO</button>}
            {sections.historia && <Link href="/historia" onClick={handleOpenSideBar} className={Style.historyLink}>HISTORIA</Link>}
          </nav>
        </div>
      </div>
      <button onClick={handleOpenSideBar} className={Style.container__sideBar}>
        <HiMenu size={40} />
      </button>
    </div>
  )
}

export default NavBar



// {page === 'home' ?
//   <a href='#disciplines' onClick={handleOpenSideBar}>ESPECIALIDADES</a>
//   :
//   <Link href='/#disciplines' onClick={handleOpenSideBar}> ESPECIALIDADES</Link>
// }

// <a href='#inscripciones' onClick={handleOpenSideBar}>INSCRIPCIONES</a>

// <Link href='#sections' onClick={handleOpenSideBar} >
//   INFRAESTRUCTURA
// </Link>

// <a href='#cooperadora' onClick={handleOpenSideBar}>COOPERADORA</a>