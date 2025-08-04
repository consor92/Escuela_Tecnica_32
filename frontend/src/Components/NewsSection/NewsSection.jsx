import styles from "./NewsSection.module.css";
import { useRouter } from "next/router";
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import { useState } from "react";
import { AiFillCaretLeft, AiFillCaretRight } from "react-icons/ai";

export default function Noticias() {
  const News = [ /* tu array de noticias */ ];
  const router = useRouter();
  const [newsIndex, setNewsIndex] = useState(0);

  const handleNoticiaClick = (id, noticia) => {
    router.push({
      pathname: "/news/[id]",
      query: { id, titulo: noticia.titulo, img: noticia.img }
    });
  };

  // Prepara los slides
  const items = News.map(noticia => (
    <div
      key={noticia.id}
      onClick={() => handleNoticiaClick(noticia.id, noticia)}
      style={{ cursor: 'pointer', padding: 8 }}
    >
      <img
        src={noticia.img}
        alt={noticia.titulo}
        style={{ width: '100%', borderRadius: 8 }}
      />
      <h3>{noticia.titulo}</h3>
    </div>
  ));

  return (
    <div className={styles.container}>


      {News.length > 0 && (
        <>
          <AliceCarousel
            mouseTracking
            items={items}
            responsive={{
              0:   { items: 1 },
              600: { items: 2 },
              1024:{ items: 3 }
            }}
            controlsStrategy="alternate"
            renderPrevButton={() => (
              <button className={styles.prevButton}>
                <AiFillCaretLeft />
              </button>
            )}
            renderNextButton={() => (
              <button className={styles.nextButton}>
                <AiFillCaretRight />
              </button>
            )}
            disableDotsControls={false}
          />

          <div className={styles.containerButtongrid}>
            <button onClick={() => setNewsIndex(0)} className={styles.newsButton}>
              Volver al inicio
            </button>
          </div>
        </>
      )}
    </div>
  );
}