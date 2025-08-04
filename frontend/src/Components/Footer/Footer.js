import React from 'react'
import Style from './Footer.module.css'


export const Footer = () => {
  return (
    <div className={Style.container}>
      <div className={Style.container__msg}>
        <div className={Style.images}>
          {/* <Image src={"/Assets/Images/mapa.png"} width={318} height={300}></Image> */}
        </div>
        <div className={Style.msg}>
          <p className={Style.text}>
            Escuela Tecnica 32 DE14 “Gral Jose de San Martin”
          </p>
          <div className={Style.containerIconText}>
            <div className={`${Style.icon} ${Style.icon1}`}></div>
            <p className={Style.textSecondary}>
              Teodoro García 3899, C1427ECG CABA
            </p>
          </div>
          <div className={Style.containerIconText}>
            <div className={`${Style.icon} ${Style.icon2}`}></div>
            <p className={Style.textSecondary}>
              19-39-42-44-47-63-65-71-76-87-90-93-108-111-119-127-176
            </p>
          </div>
          <div className={Style.containerIconText}>
            <div className={`${Style.icon} ${Style.icon3}`}></div>
            <p className={Style.textSecondary}>
              Linea B Est. Lacroze, Ferrocarril Urquiza Est. Federico Lacroze
            </p>
          </div>
          <div className={Style.containerIconText}>
            <div className={`${Style.icon} ${Style.icon4}`}></div>
            <p className={Style.textSecondary}>
              4551-9121 4555-4026/4034
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
