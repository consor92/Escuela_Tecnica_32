import React, { useState } from 'react'
import Style from './cooperadora.module.css'
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/alice-carousel.css';
import itemCoop from '@/pages/api/itemCoop';

const itemsImg = itemCoop.map(item => (
  <div
    key={item.index}
    className={Style.image}
    style={{ backgroundImage: `url(${item.url})` }}
  ></div>
));

const itemsText = itemCoop.map(item => (
  <>
    <h2 key={item.index} className={Style.msg__title}>
      {item?.title}
    </h2>
    <div className={Style.msg__info}>
      {/* <p className={Style.info__decoration}>“</p> */}
      <p className={Style.info__text}>{item.text}</p>
    </div>
  </>
))


const Cooperadora = () => {
  const responsive = {
  600: { items: 1 },
}
  return (
    <div id='cooperadora' className={Style.container}>
      <h1 className={Style.title}>Asociacion Cooperadora<span></span></h1>
      <div className={Style.coopIntro}>
        <div className={Style.row}>
          <div className={Style.col + ' ' + Style.textCenter}>
            <img
              src="/images/logo_coope.png"
              alt="Logo Cooperadora"
              width={220}
              height={220}
              className={Style.logoBig}
            />
          </div>

          <div className={Style.col}>
            <h2 className={Style.headTitle}>Asociación Cooperadora Técnica N°32</h2>

            <p><strong>Queridas Familias:</strong></p>

            <p>Somos la Asociación Cooperadora de la escuela y les damos la bienvenida a la comunidad de la Técnica N°32.</p>

            <p>Nuestra misión es ayudar en la escuela y acompañar a sus hijos en sus trayectos escolares.</p>

            <p>Año tras año, la Asociación Cooperadora colabora con la compra y entrega de herramientas, materiales, repuestos, insumos y máquinas que ayudan al buen funcionamiento de la escuela.</p>

            <p>Por esta razón, Necesitamos de su colaboración para realizar esta misión, por lo que el pago de la cuota es indispensable para el normal desarrollo de las actividades educativas. Tambien necesitamos Madres y Padres que puedan integrar laComision Directiva y que colaboren con su tiempo en multiples actividades.</p>
          </div>
        </div>

        <div className={Style.block}>
          <h3>Valor de la Cuota</h3>
          <p className={Style.small}>Cuota Anual: $100.000 (A partir de Marzo 2026) ó 2 Cuotas de $50.000 cada una (1er cuota: Marzo 2026 y 2da cuota: Mayo 2026).</p>
        </div>

        <div className={Style.block}>
          <h3>Pago por Transferencia Bancaria</h3>
          <p>Banco: Ciudad de Buenos Aires</p>

          <p>CBU: 029000700000000321532</p>

          <p>ALIAS: COOP.SAN.MARTIN</p>

          <p>Titular: Asociación Cooperadora de la EMET N°2 D.E. 14</p>

          <p>CUIT: 30-68178527-9</p>

          <p className={Style.note}>Una vez efectuado el pago, deberá enviar al Email de la cooperadora (<a href="mailto:cooperadora.tecnica32de14@bue.edu.ar">cooperadora.tecnica32de14@bue.edu.ar</a>):</p>

          <ol>
            <li>El comprobante de transferencia (Banco, Mercado Pago, Billetera Virtual)</li>
            <li>El detalle de los siguientes Datos del "Socio" (Que es el Padre, Madre o Tutor): Nombre, Apellido del Socio, DNI, Dirección, Teléfono Celular, Email, Nacionalidad</li>
            <li>Datos del alumno: Nombre, Apellido, Año y División</li>
          </ol>
        </div>

        <div className={Style.block}>
          <h3>Pago en forma personal</h3>
          <p>En la Cooperadora (Desde Marzo 2026: Martes de 8:00 a 12:00 hs).</p>

          <p>Cambios de horarios e información general, visitar nuestro Instagram: <a href="https://www.instagram.com/cooperadoragralsanmartin" target="_blank" rel="noopener noreferrer">@cooperadoragralsanmartin</a></p>
        </div>

      </div>
      <div className={Style.container__msg}>
        <div className={Style.msg}>
          <AliceCarousel
            autoPlay
            autoPlayControls={false}
            autoPlayStrategy="none"
            autoPlayInterval={5000}
            animationDuration={5500}
            animationType="slide"
            infinite
            touchTracking={false}
            disableDotsControls
            disableButtonsControls
            items={itemsText}
            responsive={responsive}
          />

        </div>

        <div className={Style.images}>
          <AliceCarousel
            autoPlay
            autoPlayControls={false}
            autoPlayStrategy="none"
            autoPlayInterval={5000}
            animationDuration={4500}
            autoPlayDirection='rtl'
            animationType="slide"
            infinite
            touchTracking={false}
            disableDotsControls
            disableButtonsControls
            items={itemsImg}
            responsive={responsive}
          />

        </div>
      </div>
    </div>
  )
}

export default Cooperadora
