import styles from "./NewsCards.module.css";
import { useState, useEffect } from "react";
import Image from 'next/image'
import Link from 'next/link'
import newsData from '../../data/news.json'

function formatDate(dateStr){
  try{
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', { year:'numeric', month:'long', day:'2-digit' })
  }catch(e){
    return dateStr
  }
}

export default function NewsCards() {
  // ordenar por fecha (más reciente primero) y tomar los 4 primeros
  const sorted = Array.isArray(newsData) ? [...newsData].sort((a,b)=>{
    const da = a.fecha ? new Date(a.fecha) : new Date(0)
    const db = b.fecha ? new Date(b.fecha) : new Date(0)
    return db - da
  }) : []
  const News = sorted.slice(0,4)

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
    setModalImage(null); // Asegurar que la imagen ampliada no se active al abrir el modal
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
                    e.stopPropagation(); // Evitar abrir el modal
                    setModalImage(n.imagen_principal); // Ampliar imagen
                  }}
                  style={{ cursor: 'zoom-in' }}
                >
                  <Image
                    src={n.imagen_principal}
                    alt={n.titulo}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>

                {modalImage && (
                  <div
                    className={styles.modalImageFullScreen}
                    onClick={() => setModalImage(null)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      width: '100vw',
                      height: '100vh',
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 1000,
                    }}
                  >
                    <img
                      src={modalImage}
                      alt="Imagen ampliada"
                      style={{
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain',
                        cursor: 'zoom-out',
                      }}
                    />
                  </div>
                )}

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
              <div
                className={styles.modalImage}
                onClick={(e) => {
                  e.stopPropagation(); // Evitar cerrar el modal
                  setModalImage(selected.imagen_principal); // Ampliar imagen
                }}
                style={{ cursor: 'zoom-in' }}
              >
                <Image
                  src={selected.imagen_principal}
                  alt={selected.titulo}
                  layout="fill"
                  objectFit="cover"
                />
              </div>

              {modalImage && (
                <div
                  className={styles.modalImageFullScreen}
                  onClick={() => setModalImage(null)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                  }}
                >
                  <img
                    src={modalImage}
                    alt="Imagen ampliada"
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain',
                      cursor: 'zoom-out',
                    }}
                  />
                </div>
              )}

              <div className={styles.modalBody}>
                  <p className={styles.modalDesc}>{selected.descripcion}</p>
                  {selected.fecha && (
                    <p style={{fontSize:13, color:'rgba(7,17,36,0.7)', marginTop:6}}>Publicado: {formatDate(selected.fecha)}</p>
                  )}
                <div dangerouslySetInnerHTML={{ __html: selected.contenido || '' }} />
                  {selected.link && (
                    <p style={{marginTop:12}}>
                      <a href={selected.link} className={styles.modalLink} target="_blank" rel="noopener noreferrer">{selected.link}</a>
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
    </section>
  );
}
