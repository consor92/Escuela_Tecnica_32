import React from 'react';
import Style from './Footer.module.css';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

// Datos experimentales para simular el feed de Instagram
const experimentalFeed = [
  { id: 1, image: '/images/feria.jpg', caption: 'Feria de Ciencias 2026' },
  { id: 2, image: '/images/tecnicoxundia.jpg', caption: 'Técnico x un día' },
  { id: 3, image: '/images/infra1.png', caption: 'Nuestros Talleres' },
  { id: 4, image: '/images/infra2.png', caption: 'Actividades escolares' },
  { id: 5, image: '/images/automotores.png', caption: 'Automotores en acción' }
];

const InstagramFeed = () => {
  const items = experimentalFeed.map(post => (
    <a 
      key={post.id} 
      href="https://www.instagram.com/" 
      target="_blank" 
      rel="noopener noreferrer" 
      className={Style.instaLink}
    >
      <div className={Style.instaPost}>
        <img src={post.image} alt={post.caption} className={Style.instaImage} />
        <div className={Style.instaOverlay}>
          <p className={Style.instaCaption}>{post.caption}</p>
          <span className={Style.instaIcon}>Ver en Instagram</span>
        </div>
      </div>
    </a>
  ));

  return (
    <div className={Style.instaSection}>
      <h3 className={Style.instaTitle}>Seguinos en Instagram</h3>
      <AliceCarousel
        mouseTracking
        items={items}
        responsive={{ 0: { items: 1 }, 600: { items: 2 }, 1024: { items: 4 } }}
        autoPlay
        infinite
        disableDotsControls
        disableButtonsControls={false}
        autoPlayInterval={4000}
      />
    </div>
  );
};

export default InstagramFeed;
