import styles from "./Novedades.module.css";
import { useState, useEffect } from "react";
import Image from 'next/image'
import Link from 'next/link'
import newsData from '../../data/news.json'
import InstagramFeed from '../Footer/InstagramFeed';
import config from '../../data/config.json';

function formatDate(dateStr){
  try{
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', { year:'numeric', month:'long', day:'2-digit' })
  }catch(e){
    return dateStr
  }
}

export default function Novedades({ showAll = false }) {
  // ordenar por fecha (más reciente primero) y tomar los 4 primeros
  const sorted = Array.isArray(newsData) ? [...newsData].sort((a,b)=>{
    const da = a.fecha ? new Date(a.fecha) : new Date(0)
    const db = b.fecha ? new Date(b.fecha) : new Date(0)
    return db - da
  }) : []
  const News = showAll ? sorted : sorted.slice(0,4)

  const [selected, setSelected] = useState(null);
  const [modalImage, setModalImage] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (modalImage) setModalImage(null);
        else setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalImage]);

  const openModal = (n) => {
    setSelected(n);
    setModalImage(null); 
  };

  const closeModal = () => {
    setSelected(null);
    setModalImage(null);
  };

  const { sections } = config;

  return (
    <section className={`${styles.container} ${showAll ? styles.containerFull : ''}`} aria-labelledby="novedades-title">
      <div className={styles.inner}>
        <h2 id="novedades-title" className={styles.sectionTitle}>Novedades</h2>
        <p className={styles.lead}>Últimas noticias y novedades de la escuela. Haz click en cualquier card para ver más detalle.</p>

        <div className={styles.cardsContainer}>
          <div className={styles.cardsGrid}>
            {News.map((n) => (
              <article key={n.id} className={styles.card} onClick={() => openModal(n)} tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') openModal(n)}}>
                <div
                  className={styles.cardImage}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setModalImage(n.imagen_principal); 
                  }}
                >
                  <Image
                    src={n.imagen_principal}
                    alt={n.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{n.titulo}</h3>
                  <p className={styles.cardDesc}>{n.descripcion}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {isMounted && sections.instagram && (
          <div className={styles.instaWrapper}>
            <InstagramFeed />
          </div>
        )}

        {!showAll && (
          <div className={styles.footerActions}>
            <Link href="/novedades" className={styles.viewMore}>
              Ver más novedades
            </Link>
          </div>
        )}
      </div>

      {selected && (
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
                    <p className={styles.modalLinkContainer}>
                      <a href={selected.link} className={styles.modalLink} target="_blank" rel="noopener noreferrer">{selected.link}</a>
                    </p>
                  )}
                <div className={styles.carouselStrip}>
                  {Array.isArray(selected.carrusel) && selected.carrusel.map((src, idx) => (
                    <div key={idx} className={styles.carouselItem} onClick={()=>setModalImage(src)}>
                      <Image src={src} alt={`${selected.titulo} ${idx+1}`} fill />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalImage && (
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
        </div>
      )}
    </section>
  );
}
