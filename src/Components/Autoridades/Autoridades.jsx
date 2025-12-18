import React from 'react'
import styles from './Autoridades.module.css'

function Node({ name, role, photo, shift }){
  const parts = String(name).split(' ')
  const first = parts.shift()
  const last = parts.join(' ')
  return (
    <div className={styles.node}>
      <div className={styles.avatar} role="img" aria-label={name} style={{backgroundImage: `url(${photo || '/images/avatar-placeholder.png'})`}} />
      <div className={styles.info}>
        <div className={styles.name}><span className={styles.first}>{first}</span> <span className={styles.last}>{last}</span></div>
        <div className={styles.role}>{role}</div>
        {shift && <div className={styles.shift}>{shift}</div>}
      </div>
    </div>
  )
}

export default function Autoridades(){
  return (
    <section className={styles.container} aria-labelledby="autoridades-title">
      <div className={styles.inner}>
        <h2 id="autoridades-title" className={styles.title}>Autoridades</h2>


        <div className={styles.tree}>
          <div className={styles.level + ' ' + styles.levelTop}>
            <Node name="Dra. María Pérez" role="Rectora" photo="/images/autoridades/rectora.jpg" shift="Mañana" />
          </div>

          <div className={styles.connectorVertical} />

          <div className={styles.level}>
            <Node name="Prof. Juan Gómez" role="Vicerrector" photo="/images/autoridades/vicerrector.jpg" shift="Tarde"/>
          </div>

          <div className={styles.branch}>
            <div className={styles.branchItem}>
              <Node name="Ing. César Luna" role="Jefe de Taller" photo="/images/autoridades/jefe_taller.jpg" shift="Mañana / Tarde" />
            </div>

            <div className={styles.branchItem}>
              <Node name="Lic. Laura Díaz" role="Regente Técnico" photo="/images/autoridades/regente_manana.jpg" shift="Mañana" />
              <div className={styles.subConnector} />
              <div className={styles.subItem}>
                <Node name="Téc. Marcos Silva" role="Jefe de Laboratorios" photo="/images/autoridades/jefe_lab.jpg" shift="Mañana / Tarde" />
              </div>
            </div>

            <div className={styles.branchItem}>
              <Node name="Prof. Carlos Rojas" role="Regente Cultural" photo="/images/autoridades/regente_tarde.jpg" shift="Tarde" />
              <div className={styles.subConnector} />
              <div className={styles.subItem}>
                <Node name="Prof. Ana Morales" role="Jefe de Preceptores" photo="/images/autoridades/jefe_preceptores.jpg" shift="Mañana" />
                <div className={styles.subItem}>
                  <Node name="Prof. Sergio Ruiz" role="SubJefe de Preceptores" photo="/images/autoridades/subjefe_preceptores.jpg" shift="Tarde" />
                </div>
              </div>
              <div className={styles.subItem}>
                <Node name="Prof. Martín Vega" role="SubRegente (Vespertino)" photo="/images/autoridades/subregente_vesp.jpg" shift="Vespertino" />
              </div>

            </div>

            <div className={styles.branchItem}>
              <Node name="Prof. Laura Sánchez" role="Accesor Pedagógico - DOE" photo="/images/autoridades/accesor_doe.jpg" shift="Mañana" />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
