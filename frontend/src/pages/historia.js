import { useState, useEffect } from 'react'
import Layout from '@/Components/Layout/Layout'
import styles from '../Components/Historia.module.css'

export default function PaginaHistoria() {
  const [historiaData, setHistoriaData] = useState(null)

  useEffect(() => {
    fetch('/api/historiaData')
      .then((res) => res.json())
      .then((data) => setHistoriaData(data))
      .catch((err) => console.error('Error fetching historia:', err))
  }, [])

  const { linea_de_tiempo } = historiaData || {}
  
  // Imágenes genéricas disponibles en el proyecto para ilustrar la historia
  const genericImages = [
    '/images/infra1.png',
    '/images/infra2.png',
    '/images/infra3.png',
    '/images/infra4.png',
    '/images/infra5.png',
    '/images/infra6.png',
  ]

  return (
    <Layout title="Nuestra Historia - ET 32" page="historia">
      <div className={styles.fullPageContainer}>
        <header className={styles.headerHero}>
          <h1 className={styles.mainTitle}>NUESTRA HISTORIA</h1>
          <div className={styles.titleDivider} style={{ width: '100px' }} />
          <p className={styles.mainIntro}>
            Desde 1950 formando técnicos comprometidos con el desarrollo nacional. 
            Un recorrido por el tiempo, desde la 'Chacrita' hasta la vanguardia tecnológica.
          </p>
        </header>

        <main className={styles.timelineContainer}>
          {historiaData && linea_de_tiempo && linea_de_tiempo.length > 0 ? (
            linea_de_tiempo.map((item, index) => {
              const isLeft = item.layout === 'izquierda'
              const imageIndex = index % genericImages.length
              
              return (
                <section 
                  key={item.id || index}
                  className={`${styles.historyBlock} ${isLeft ? styles.blockLeft : styles.blockRight}`}
                >
                  <div className={styles.blockImageWrapper}>
                    <div 
                      className={styles.blockImage} 
                      style={{ backgroundImage: `url(${genericImages[imageIndex]})` }}
                    />
                    <div className={styles.periodBadge}>{item.periodo}</div>
                  </div>

                  <div className={styles.blockContent}>
                    <span className={styles.blockSubheadline}>{item.subtitulo}</span>
                    <h2 className={styles.blockTitle}>{item.titulo}</h2>
                    <div className={styles.blockDivider} />
                    <p className={styles.blockText}>{item.cuerpo}</p>
                    {item.dato_clave && (
                      <div className={styles.keyFact}>
                        <strong>DATO CLAVE:</strong> {item.dato_clave}
                      </div>
                    )}
                  </div>
                </section>
              )
            })
          ) : (
            <p style={{ textAlign: 'center', padding: '50px' }}>{historiaData ? 'No se encontraron datos de la historia.' : 'Cargando historia...'}</p>
          )}
        </main>

        <footer className={styles.historyFooter}>
          <p>La historia de la ET 32 se sigue escribiendo día a día con el esfuerzo de toda nuestra comunidad.</p>
        </footer>
      </div>
    </Layout>
  )
}
