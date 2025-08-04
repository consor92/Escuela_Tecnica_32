import React, { useState } from 'react'
import Style from './NavBar.module.css'
import Link from 'next/link'
import { HiMenu } from 'react-icons/hi'
import { useRouter } from 'next/router'

const NavBar = ({ page }) => {
  const [sideBarOpen, setSideBarOpen] = useState(false)
  const router = new useRouter()
  const handleOpenSideBar = () => {
    setSideBarOpen(!sideBarOpen)
  }

  const handleNavigateToAnchor = async (hash) => {
    setSideBarOpen(false)

    if (router.pathname !== '/') {
      await router.push(`/#${hash}`)
    } else {
      // Si ya estás en /, simplemente hacé scroll
      const element = document.getElementById(hash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        router.push(`/#${hash}`)
      }
    }
  }

  return (
    <div className={Style.container}>
      <Link href='/' className={Style.container__EscuelaTecnica}>
        <>
          <div className={Style.escuelaTecnica_Img}></div>
          <div className={Style.escuelaTecnica_info}>
            <h2>LA GLORIOSA 32</h2>
            <h3>Gral Jose de San Martin ET32 DE14</h3>
          </div>
        </>
      </Link>
      <div className={`${Style.container__navBar} ${sideBarOpen ? Style.container__navBarOpen : Style.container__navBarClosed}`}>
        <div className={Style.container__navBarTop}>
          <nav>
            <Link href='' onClick={handleOpenSideBar}>
              CALENDARIO
            </Link>
            {/* <Link href='' onClick={handleOpenSideBar}>
              NOTICIAS
            </Link> */}
            <Link href='' onClick={handleOpenSideBar} >
              AUTORIDADES
            </Link>
            <Link href='' onClick={handleOpenSideBar}>
              AULA VIRTUAL
            </Link>
          </nav>
        </div>
        <div className={Style.container__navBarBottom}>
          <nav>
            <button onClick={() => handleNavigateToAnchor('disciplines')}>ESPECIALIDADES</button>
            <button onClick={() => handleNavigateToAnchor('inscripciones')}>INSCRIPCIONES</button>
            <button onClick={() => handleNavigateToAnchor('sections')}>INFRAESTRUCTURA</button>
            <button onClick={() => handleNavigateToAnchor('cooperadora')}>COOPERADORA</button>

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