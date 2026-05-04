import styles from "./Novedades.module.css";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from 'next/image'
import Link from 'next/link'
import InstagramFeed from '../Footer/InstagramFeed';

function formatDate(dateStr){
  try{
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', { year:'numeric', month:'long', day:'2-digit' })
  }catch(e){
    return dateStr
  }
}

export default function Novedades({ showAll = false }) {
  const [config, setConfig] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    fetch('/api/configData')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Error fetching config:', err));
    
    fetch('/api/newsData')
      .then(res => res.json())
      .then(data => setNewsData(data))
      .catch(err => console.error('Error fetching news:', err));
  }, []);

  const sorted = Array.isArray(newsData) ? [...newsData].sort((a,b)=>{
    const da = a.fecha ? new Date(a.fecha) : new Date(0)
    const db = b.fecha ? new Date(b.fecha) : new Date(0)
    return db - da
  }) : []
  
  const News = showAll ? sorted : sorted.slice(0,4);

  useEffect(() => {
    if (showAll || News.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % News.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [News.length, showAll]);

  if (!isMounted) return null;

  const openModal = (n) => {
    setSelected(n);
    setModalImage(null); 
  };

  const closeModal = () => {
    setSelected(null);
    setModalImage(null);
  };

  const sections = config?.sections || {};
  const featured = News[activeIndex];
  const sideNews = News.filter((_, idx) => idx !== activeIndex);

  const renderModals = () => {
    return (
      <>
        {selected && createPortal(
          <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={closeModal}>
            <div className={styles.modal} onClick={(e)=>e.stopPropagation()}>
              <header className={styles.modalHeader}>
                <h3>{selected.titulo}</h3>
                <button className={styles.modalClose} onClick={closeModal} aria-label="Cerrar">×</button>
              </header>
              <div className={styles.modalContent}>
                <div
                  className={styles.modalImage}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setModalImage(selected.imagen_principal); 
                  }}
                >
                  <Image
                    src={selected.imagen_principal}
                    alt={selected.titulo}
                    fill
                  />
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.modalDesc}>{selected.descripcion}</p>
                    {selected.fecha && (
                      <p className={styles.modalDate}>Publicado: {formatDate(selected.fecha)}</p>
                    )}
                  <div dangerouslySetInnerHTML={{ __html: selected.contenido || '' }} />
                    {selected.link && (
                      <div className={styles.modalLinkContainer}>
                        <a href={selected.link} className={styles.modalLink} target="_blank" rel="noopener noreferrer">
                          Visitar Enlace / Ver más
                        </a>
                      </div>
                    )}                  <div className={styles.carouselStrip}>
                    {Array.isArray(selected.carrusel) && selected.carrusel.map((src, idx) => (
                      <div key={idx} className={styles.carouselItem} onClick={()=>setModalImage(src)}>
                        <Image src={src} alt={`${selected.titulo} ${idx+1}`} fill />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

        {modalImage && createPortal(
          <div
            className={styles.modalImageFullScreen}
            onClick={() => setModalImage(null)}
          >
            <div className={styles.fullScreenImageContainer}>
              <Image
                src={modalImage}
                alt="Imagen ampliada"
                fill
              />
            </div>
          </div>,
          document.body
        )}
      </>
    );
  };

  return (
    <section className={`${styles.container} ${showAll ? styles.containerFull : ''}`} aria-labelledby="novedades-title">
      <div className={styles.inner}>
        <h2 id="novedades-title" className={styles.sectionTitle}>Novedades</h2>
        
        <div className={styles.cardsContainer}>
          {showAll ? (
            <div className={styles.cardsGrid}>
              {News.map((n) => (
                <article key={n.id} className={styles.cardOriginal} onClick={() => openModal(n)}>
                   <div className={styles.cardImageOriginal}>
                      <Image src={n.imagen_principal} alt={n.titulo} fill style={{objectFit: 'cover'}} />
                   </div>
                   <div className={styles.cardBodyOriginal}>
                      <span className={styles.cardDateOriginal}>{formatDate(n.fecha)}</span>
                      <h3 className={styles.cardTitleOriginal}>{n.titulo}</h3>
                      <p className={styles.cardDescOriginal}>{n.descripcion}</p>
                   </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.asymmetricGrid}>
              <div className={styles.featuredColumn}>
                {featured && (
                  <article className={styles.featuredCard} onClick={() => openModal(featured)}>
                    <div className={styles.featuredImageContainer}>
                      <Image 
                        src={featured.imagen_principal} 
                        alt={featured.titulo} 
                        fill 
                        priority
                        className={styles.featuredImage}
                        style={{objectFit: 'cover'}}
                      />
                      <div className={styles.featuredOverlay} />
                    </div>
                    <div className={styles.featuredContent}>
                      <span className={styles.featuredBadge}>DESTACADO</span>
                      <h3 className={styles.featuredTitle}>{featured.titulo}</h3>
                      <p className={styles.featuredDesc}>{featured.descripcion}</p>
                    </div>
                  </article>
                )}
              </div>

              <div className={styles.sideColumn}>
                {sideNews.map((n) => (
                  <article key={n.id} className={styles.sideCard} onClick={() => openModal(n)}>
                    <div className={styles.sideCardImage}>
                      <Image src={n.imagen_principal} alt={n.titulo} fill style={{objectFit: 'cover'}} />
                    </div>
                    <div className={styles.sideCardBody}>
                      <span className={styles.sideCardDate}>{formatDate(n.fecha)}</span>
                      <h4 className={styles.sideCardTitle}>{n.titulo}</h4>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

        {sections.instagram && (
          <div className={styles.instaWrapper}>
            <InstagramFeed />
          </div>
        )}

        {!showAll && (
          <div className={styles.footerActions}>
            <Link href="/novedades" className={styles.viewMore}>
              Ver todas las novedades
            </Link>
          </div>
        )}
      </div>

      {renderModals()}
    </section>
  );
}
