import React, { useState, useEffect } from 'react'
import Style from './Layout.module.css'
import Head from 'next/head'
import NavBar from '../NavBar/NavBar'
import AlertBanner from '../AlertBanner'
import { FaArrowUp } from 'react-icons/fa'

const Layout = ({ children, title, description, keywords, favicon, page }) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const defaultTitle = "Escuela Técnica N°32 'Gral. José de San Martín'";
  const defaultDescription = "Sitio oficial de la Escuela Técnica N°32 D.E. 14. Formando profesionales en Computación, Automotores y Mecánica.";
  const siteTitle = title ? `${title} | ET32` : defaultTitle;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={description || defaultDescription} />
        <meta name="keywords" content={keywords || "ET32, Escuela Técnica 32, Chacarita, educación técnica, computación, automotores, mecánica"} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={description || defaultDescription} />
        <meta property="og:image" content="/images/logoET32.png" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={siteTitle} />
        <meta property="twitter:description" content={description || defaultDescription} />
        
        <link rel="icon" href={favicon || '/logoet32.ico'} />
      </Head>
      <AlertBanner onVisibilityChange={setIsAlertVisible} />
      <NavBar page={page} isAlertVisible={isAlertVisible} />
      <div className={Style.container} style={{ marginTop: isAlertVisible ? '150px' : '110px' }}>
        {children}
      </div>

      {/* Botón Volver Arriba */}
      <button 
        className={`${Style.backToTopButton} ${showScrollButton ? Style.visible : ''}`} 
        onClick={scrollToTop}
        aria-label="Volver arriba"
      >
        <FaArrowUp />
      </button>
    </>
  )
}

export default Layout