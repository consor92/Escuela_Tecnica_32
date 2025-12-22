import styles from "./NewsCards.module.css";
import { useState, useEffect } from "react";
import Image from 'next/image'
import Link from 'next/link'
import newsData from '../../data/news.json'

export default function NewsSection() {
  // usar los últimos 4 items (asumiendo que el array está en orden cronológico ascendente)
  const News = Array.isArray(newsData) ? newsData.slice(-4).reverse() : [];

  const [selected, setSelected] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openModal = (n) => {
    setSelected(n);
    setModalImage(n.imagen_principal);
  };

  const closeModal = () => {
    setSelected(null);
    setModalImage(null);
  };

  return (
    <section className={styles.container} aria-labelledby="novedades-title">
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
                    e.stopPropagation(); // Prevent modal from closing
                    setModalImage(n.imagen_principal);
                  }}
                >
                  <Image
                    src={n.imagen_principal}
                    alt={n.titulo}
                    layout="fill"
                    objectFit="cover"
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

        <div className={styles.footerActions}>
          <Link href="/novedades" className={styles.viewMore}>
            Ver más novedades
          </Link>
        </div>
      </div>

      {selected && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" onClick={closeModal}>
          <div className={styles.modal} onClick={(e)=>e.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h3>{selected.titulo}</h3>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Cerrar">×</button>
            </header>
            <div className={styles.modalContent}>
              <div className={styles.modalImage}>
                <Image src={modalImage || selected.imagen_principal} alt={selected.titulo} layout="fill" objectFit="cover" />
              </div>
              <div className={styles.modalBody}>
                <p className={styles.modalDesc}>{selected.descripcion}</p>
                <div dangerouslySetInnerHTML={{ __html: selected.contenido || '' }} />
                {selected.link && (
                  <p style={{marginTop:12}}>
                    <a href={selected.link} className={styles.modalLink} target="_blank" rel="noopener noreferrer">Ver enlace relacionado</a>
                  </p>
                )}
                <div className={styles.carouselStrip}>
                  {Array.isArray(selected.carrusel) && selected.carrusel.map((src, idx) => (
                    <div key={idx} className={styles.carouselItem} onClick={()=>setModalImage(src)} style={{cursor:'pointer'}}>
                      <Image src={src} alt={`${selected.titulo} ${idx+1}`} layout="fill" objectFit="cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalImage && (
        <div className={styles.modalImageFullScreen} onClick={closeModal}>
          <img src={modalImage} alt="Imagen ampliada" />
        </div>
      )}
    </section>
  );
}
