import React from 'react'
import Style from './Footer.module.css'
import Link from 'next/link';


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
              Dirección: <Link href="https://www.google.com/maps?q=Teodoro+Garc%C3%ADa+3899,+C1427ECG+CABA" target="_blank" className={Style.link}>Teodoro García 3899, C1427ECG CABA</Link>
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
              Teléfono: <a href="tel:+541145519121" className={Style.link}>4551-9121</a>, <a href="tel:+541145554026" className={Style.link}>4555-4026</a>, <a href="tel:+541145554034" className={Style.link}>4555-4034</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
