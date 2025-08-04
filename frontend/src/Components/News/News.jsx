import styles from "./News.module.css";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from 'next/image'

export default function Noticias() {
  const News = [
    {
      id: 1,
      titulo: "Noticia 1",
      img: "https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_960_720.jpg",
    },
    {
      id: 2,
      titulo: "Noticia 2",
      img: "https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_960_720.jpg",
    },
    {
      id: 3,
      titulo: "Noticia 3",
      img: "https://cdn.pixabay.com/photo/2016/09/28/04/35/classroom-1699745_960_720.jpg",
    },
    {
      id: 4,
      titulo: "Noticia 4",
      img: "https://cdn.pixabay.com/photo/2015/03/07/20/14/classroom-663437_960_720.jpg",
    },
    {
      id: 5,
      titulo: "Noticia 5",
      img: "https://cdn.pixabay.com/photo/2014/10/02/13/44/university-470184_960_720.jpg",
    },
    {
      id: 6,
      titulo: "Noticia 6",
      img: "https://cdn.pixabay.com/photo/2016/07/28/00/20/light-1546773_960_720.jpg",
    },
    {
      id: 7,
      titulo: "Noticia 7",
      img: "https://cdn.pixabay.com/photo/2017/02/05/00/08/graduation-2038864__340.jpg",
    },
    {
      id: 8,
      titulo: "Noticia 8",
      img: "https://cdn.pixabay.com/photo/2017/03/20/03/06/desk-2158142__340.jpg",
    },
    {
      id: 9,
      titulo: "Noticia 9",
      img: "https://cdn.pixabay.com/photo/2018/03/21/07/16/learning-3245792__340.jpg",
    },
    {
      id: 10,
      titulo: "Noticia 10",
      img: "https://cdn.pixabay.com/photo/2016/05/18/11/25/library-1400312__340.jpg",
    },
    {
      id: 11,
      titulo: "Noticia 11",
      img: "https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_960_720.jpg",
    },
    {
      id: 12,
      titulo: "Noticia 12",
      img: "https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_960_720.jpg",
    },
    {
      id: 13,
      titulo: "Noticia 13",
      img: "https://cdn.pixabay.com/photo/2016/09/28/04/35/classroom-1699745_960_720.jpg",
    },
    {
      id: 14,
      titulo: "Noticia 14",
      img: "https://cdn.pixabay.com/photo/2015/03/07/20/14/classroom-663437_960_720.jpg",
    },
    {
      id: 15,
      titulo: "Noticia 1",
      img: "https://cdn.pixabay.com/photo/2016/01/19/01/42/library-1147815_960_720.jpg",
    },
    {
      id: 16,
      titulo: "Noticia 2",
      img: "https://cdn.pixabay.com/photo/2014/09/05/18/32/old-books-436498_960_720.jpg",
    },
    {
      id: 17,
      titulo: "Noticia 3",
      img: "https://cdn.pixabay.com/photo/2016/09/28/04/35/classroom-1699745_960_720.jpg",
    },
    {
      id: 18,
      titulo: "Noticia 13",
      img: "https://cdn.pixabay.com/photo/2016/09/28/04/35/classroom-1699745_960_720.jpg",
    },
  ];

  const [newsIndex, setNewsIndex] = useState(0);
  const router = useRouter();

  const handleNoticiaClick = (id, noticia) => {
    router.push({
      pathname: `/news/${id}`,
      query: noticia.titulo,
      state: noticia,
    });
  };

  const handlePrevClick = () => {
    if (newsIndex > 0) {
      setNewsIndex(newsIndex - 1);
    }
  };

  const handleNextClick = () => {
    if (newsIndex + 6 < News.length) {
      setNewsIndex(newsIndex + 1);
    }
  };

  return (
    <>
      {News.length > 0 && (
        <div class={styles.container}>
          <div class={styles.News}>
            <Image
              className={styles.img_second}
              src={News[newsIndex].img}
              alt="Imagen de la noticia"
            />
            {/* <h3>candidato</h3>
            <h2>{News[newsIndex].titulo}</h2>
            <h4>11/06/06</h4>  */}
          </div>
          <div class={styles.News3}>
            {News.slice(newsIndex + 3, newsIndex + 6).map((noticia) => (
              <div
                key={noticia.id}
                onClick={() => handleNoticiaClick(noticia.id, noticia)}
                className={styles.News3Child}
              >
                <Image src={noticia.img} alt="Imagen de la noticia" />
                {/* <h3>candidato</h3>
                <h2>{noticia.titulo}</h2>
                <h4>11/06/06</h4> */}
              </div>
            ))}
          </div>
          <div class={styles.News2}></div>
          {News.slice(newsIndex + 1, newsIndex + 3).map((noticia) => (
            <div
              key={noticia.id}
              onClick={() => handleNoticiaClick(noticia.id, noticia)}
              className={styles.News2Child}
            >
              <Image src={noticia.img} alt="Imagen de la noticia" />
              {/* <h3>candidato</h3> */}
              {/* <h2>{noticia.titulo}</h2>
                <h4>11/06/06</h4> */}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
