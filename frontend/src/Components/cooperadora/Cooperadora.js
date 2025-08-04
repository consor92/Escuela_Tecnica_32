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
      <p className={Style.info__decoration}>“</p>
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
      <h1 className={Style.title}>Cooperadora Tecnica 32<span></span></h1>
      <p className={Style.text}>
        Estamos para ayudar y acompañar a tus hijos, colaborando con necesidades y materiales. Los esperamos para escuchar sus inquietudes y propuestas.</p>
      <a className={Style.btnMoreInfo} href='../../Assets/instructivoDocente.pdf' target='_blank'>
        <button>INFORMACION</button>
      </a>
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
