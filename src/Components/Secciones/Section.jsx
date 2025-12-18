import styles from "./Section.module.css";
import { useState } from "react";
import Area from "./Area/Area";
import itemSeccions from "@/pages/api/itemSeccions";

export default function Seccions() {
  const [area, setArea] = useState(0);
  const [showText, setShowText] = useState('')

  const handleMouseEnter = (text) => {
    setShowText(text)
  }

  const handleMouseLeave = () => {
    setShowText('')
  }

  const handleClick = () => {
    setArea(0);
  };

  let componentToShow = null;

  if (area === 0) {
    componentToShow = (
      <div className={styles.container} id="sections">

        {

          itemSeccions?.map((item, index) =>
            <div key={index} className={styles[`area${item.id}`]} onClick={() => setArea(item.id)}
              onMouseEnter={() => handleMouseEnter(`${item.title}`)}
              onMouseLeave={() => handleMouseLeave()}
            >
              <h1 style={{ opacity: showText === `${item.title}` ? 0 : 1, transition: 'opacity 0.2s ease' }}> {item.title} </h1>
              <h1 style={{ opacity: showText === `${item.title}` ? 1 : 0, transition: 'opacity 0.2s ease' }}>DESCUBRE MAS...</h1>
            </div>
          )}
      </div>
    );
  } else {
    componentToShow = (
      <div className={styles.parent} onClick={handleClick}>
        <Area areaNum={area} className={styles.area} setArea={setArea} />
      </div>
    );
  }

  return (<div>
    {/* <h2 className={styles.container__titleVertical}>INFRRAESTRUCTURA</h2> */}
    {componentToShow}
  </div>);
}
