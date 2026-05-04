import React from 'react'
import Style from './HomeIndex.module.css'
import Image from 'next/image'
import Link from 'next/link'

const homeIndex = () => {
  return (
    <>
      <div className={Style.container}>
        <Image
          src="/images/bg__HomeIndex.png"
          alt="Fondo de la Escuela Técnica 32"
          fill
          priority
          quality={85}
          className={Style.backgroundImage}
        />
        <div className={Style.overlay} />
        <div className={Style.heroCard}>
          <p className={Style.tagline} aria-label="Formando a los jóvenes del mañana">
            <span className={Style.media}>FORMANDO</span><br/>
            <span className={Style.small}>A LOS</span><br/>
            <span className={Style.accent}>JÓVENES DEL MAÑANA.</span>
          </p>
        </div>
      </div>
    </>
  )
}

export default homeIndex  