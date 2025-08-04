import styles from './Noticias.module.css'
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from 'next/image'

export default function Noticias() {

  const router = useRouter();
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    async function fetchNoticias() {
      const res = await fetch("/api/noticias");
      const data = await res.json();
      setNoticias(data);
    }

    fetchNoticias();
  }, []);

  const handleNoticiaClick = (id) => {
    router.push(`/noticias/${id}`);
  };
  return (<>
    {noticias.length > 0 &&
      <div className={styles.container}>

        <div className={styles.N0} onClick={() => handleNoticiaClick(noticias[0].id)}>
          <Image class={styles.img} src="https://picsum.photos/id/237/200/300" alt="Imagen de la noticia" />
          <h3 className={styles.title_Origen}> Candidato</h3>
          <h2 className={styles.title}> {noticias[0].title}</h2>
          <h3 className={styles.title_fecha}>07/04/2022 </h3>
        </div>

        <div className={styles.N1} onClick={() => handleNoticiaClick(noticias[1].id)}>
          <Image className={styles.img_second} src="https://picsum.photos/id/237/200/300" alt="Imagen de la noticia" />
          <h3 className={styles.title_Origen_second}> Candidato</h3>
          <h2 className={styles.title_second}>{noticias[1].title}</h2>
          <h3 className={styles.title_fecha_second}>07/04/2022 </h3>
        </div>

        <div className={styles.N2} onClick={() => handleNoticiaClick(noticias[1].id)}>
          <Image className={styles.img_second} src="https://picsum.photos/id/237/200/300" alt="Imagen de la noticia" />
          <h3 className={styles.title_Origen_second}> Candidato</h3>
          <h2 className={styles.title_second}>{noticias[2].title}</h2>
          <h3 className={styles.title_fecha_second}>07/04/2022 </h3>
        </div>

        <div className={styles.N3} onClick={() => handleNoticiaClick(noticias[1].id)}>
          <Image className={styles.img_second} src="https://picsum.photos/id/237/200/300" alt="Imagen de la noticia" />
          <h3 className={styles.title_Origen_second}> Candidato</h3>
          <h2 className={styles.title_second}>{noticias[3].title}</h2>
          <h3 className={styles.title_fecha_second}>07/04/2022 </h3>
        </div>

        <div className={styles.N4} onClick={() => handleNoticiaClick(noticias[1].id)}>
          <Image className={styles.img_second} src="https://picsum.photos/id/237/200/300" alt="Imagen de la noticia" />
          <h3 className={styles.title_Origen_second}> Candidato</h3>
          <h2 className={styles.title_second}>{noticias[4].title}</h2>
          <h3 className={styles.title_fecha_second}>07/04/2022 </h3>
        </div>

        <div className={styles.N5} onClick={() => handleNoticiaClick(noticias[1].id)}>
          <Image className={styles.img_second} src="https://picsum.photos/id/237/200/300" alt="Imagen de la noticia" />
          <h3 className={styles.title_Origen_second}> Candidato</h3>
          <h2 className={styles.title_second}>{noticias[5].title}</h2>
          <h3 className={styles.title_fecha_second}>07/04/2022 </h3>
        </div>
      </div>}  </>
  )
}