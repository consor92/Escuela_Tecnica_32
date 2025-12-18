import Layout from '@/Components/Layout/Layout'
import styles from '@/Components/NewsSection/NewsCards.module.css'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import newsData from '@/data/news.json'

function formatDate(dateStr){
  try{ return new Date(dateStr).toLocaleDateString('es-AR', { year:'numeric', month:'long', day:'2-digit' }) }catch(e){ return dateStr }
}

export default function AllNews(){
  const [selected, setSelected] = useState(null)
  const [modalImage, setModalImage] = useState(null)
  const News = Array.isArray(newsData) ? [...newsData].sort((a,b)=>{
    const da = a.fecha ? new Date(a.fecha) : new Date(0)
    const db = b.fecha ? new Date(b.fecha) : new Date(0)
    return db - da
  }) : []

  useEffect(()=>{
    const onKey = (e) => { if(e.key==='Escape') setSelected(null)}
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  },[])

  const openModal = (n) => { setSelected(n); setModalImage(n.imagen_principal) }
  const closeModal = () => { setSelected(null); setModalImage(null) }

  return (
    <>
      <Layout title="Novedades" page="novedades" />
      <section className={`${styles.container} ${styles.containerFull}`} aria-labelledby="all-novedades">
        <div className={styles.inner}>
          <h2 id="all-novedades" className={styles.sectionTitle}>Todas las novedades</h2>

          <div className={styles.cardsContainer}>
            <div className={styles.cardsGrid}>
              {News.map(n => (
                <article key={n.id} className={styles.card} onClick={() => openModal(n)} tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') openModal(n)}}>
                  <div className={styles.cardImage}>
                    <Image src={n.imagen_principal} alt={n.titulo} layout="fill" objectFit="cover" />
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{n.titulo}</h3>
                    <p className={styles.cardDesc}>{n.descripcion}</p>
                  </div>
                </article>
              ))}
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
                      {selected.carrusel && selected.carrusel.map((src, idx)=> (
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

        </div>
      </section>
    </>
  )
}
