import React, { useState, useEffect } from 'react'
import Style from './cooperadora.module.css'
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/alice-carousel.css';
import Image from 'next/image'

const Cooperadora = () => {
  const [coopData, setCoopData] = useState(null);

  useEffect(() => {
    fetch('/api/cooperadoraData')
      .then(res => res.json())
      .then(data => setCoopData(data))
      .catch(err => console.error('Error fetching cooperadora data:', err));
  }, []);

  if (!coopData) return null;

  // Ordenar por fecha descendente y tomar las últimas 5
  const lastNovedades = [...coopData.novedades]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  const itemsImg = lastNovedades.map(item => (
    <div
      key={item.id}
      className={Style.imageContainer}
    >
      <Image
        src={item.url}
        alt={item.title}
        fill
        className={Style.carouselImage}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    </div>
  ));

  const itemsText = lastNovedades.map(item => (
    <div key={item.id} className={Style.textFadeContainer}>
      <h2 className={Style.msg__title}>
        {item?.title}
      </h2>
      <span className={Style.msg__date}>{item.fecha}</span>
      <div className={Style.msg__info}>
        <p className={Style.info__text}>{item.text}</p>
      </div>
      {item.fileUrl && (
        <a 
          href={item.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={Style.fileLink}
        >
          Ver archivo adjunto
        </a>
      )}
    </div>
  ));

  const responsive = {
    600: { items: 1 },
  };

  return (
    <div id='cooperadora' className={Style.container}>
      <h1 className={Style.title}>Asociacion Cooperadora<span></span></h1>
      <div className={Style.coopIntro}>
        <div className={Style.row}>
          <div className={Style.col + ' ' + Style.textCenter}>
            <Image
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

            <p>Año tras año, la Asociación Cooperadora colabora con la entrega de herramientas, materiales, insumos y máquinas que ayudan al buen funcionamiento de la escuela.</p>

            <p>Necesitamos de su colaboración, el pago de la cuota es indispensable para el desarrollo de las actividades educativas.</p>
          </div>
        </div>

        <div className={Style.block}>
          <h3>Valor de la Cuota</h3>
          <p className={Style.small}>Cuota Anual: ${coopData.info.cuotaAnual} ó 2 Cuotas (Marzo: ${coopData.info.cuotaMarzo} y Mayo: ${coopData.info.cuotaMayo}).</p>
        </div>

        <div className={Style.block}>
          <h3>Pago por Transferencia Bancaria</h3>
          <p>Banco: {coopData.info.banco}</p>
          <p>CBU: {coopData.info.cbu}</p>
          <p>ALIAS: {coopData.info.alias}</p>
          <p>Titular: {coopData.info.titular}</p>
          <p>CUIT: {coopData.info.cuit}</p>

          <p className={Style.note}>Una vez efectuado el pago, enviar comprobante al Email: <a href={`mailto:${coopData.info.email}`}>{coopData.info.email}</a></p>
        </div>

        <div className={Style.block}>
          <h3>Pago en forma personal</h3>
          <p>En la Cooperadora ({coopData.info.horarios}).</p>
          <p>Para más información, visitar nuestro Instagram: <a href={coopData.info.instagram} target="_blank" rel="noopener noreferrer">@cooperadoragralsanmartin</a></p>
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
