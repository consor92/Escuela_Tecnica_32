import React from 'react'
import Style from './HomeIndex.module.css'

const homeIndex = () => {
  return (
    <div className={Style.container}>
      <div className={Style.heroCard}>
        <p className={Style.tagline} aria-label="Formando a los jóvenes del mañana">
          <span className={Style.media}>FORMANDO</span><br/>
          <span className={Style.small}>A LOS</span><br/>
          <span className={Style.accent}>JÓVENES DEL MAÑANA.</span>
        </p>
      </div>
    </div>
  )
}

export default homeIndex  