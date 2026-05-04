import React from 'react';
import styles from './Area.module.css'

const Area = ({ areaNum, setArea, itemSeccions }) => {

  const resulFilter = itemSeccions.filter(item => item.id === areaNum)

  const handleCancel = () => {
    setArea(0)
  }

  return (
    <>
      {resulFilter?.map((item, key) => (
        <div key={key} className={styles.container}>
          <div className={styles.containerImage}>
            <div 
              className={styles.img1} 
              style={{ backgroundImage: `url(${item.url || `/images/infra${item.id}.png`})` }}
            ></div>
            <div 
              className={styles.img2} 
              style={{ backgroundImage: `url(/images/infra${item.id === 6 ? 1 : item.id + 1}.png)` }}
            ></div>
          </div>
          <div className={styles.area}>
            <div className={styles.areaTitle}>
              <h2 >{item.title}</h2>
            </div>
            <div className={styles.areaText}>
              <p>{item.text}</p>
              <h3>AREAS QUE INTEGRAN</h3>
              <div className={styles.lineText}></div>
              {item.areas.map((area, k) => (
                <div key={k}>
                  <p className={styles.areaName}>· {area.name}</p>
                </div>
              ))}
              <div className={styles.areaButton}>
                <button onClick={handleCancel}>CERRAR</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Area;