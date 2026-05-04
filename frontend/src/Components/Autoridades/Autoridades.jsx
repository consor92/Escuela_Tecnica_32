"use client"
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaLinkedinIn } from 'react-icons/fa'
import styles from './Autoridades.module.css'

const AuthorityCard = ({ person, index }) => {
  if (!person) return null;
  const { name, role, image, attributes } = person
  const shift = person.shift || person.attributes?.shift || "S/T"
  const linkedin = person.socials?.linkedin || person.attributes?.socials?.linkedin

  return (
    <motion.div 
      className={styles.card}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, scale: 1,
        y: [0, -10, 0],
        rotate: index % 2 === 0 ? [0.6, -0.6, 0.6] : [-0.6, 0.6, -0.6]
      }}
      transition={{ 
        opacity: { duration: 0.8, delay: index * 0.05 },
        y: { duration: 4 + (index % 3), repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 6 + (index % 2), repeat: Infinity, ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, transition: { duration: 0.3 } }}
    >
      <div className={styles.roleBadge}>Turno {shift}</div>
      <div className={styles.avatarWrapper}>
        <img src={image || person.attributes?.image} alt={name} className={styles.avatar} />
      </div>
      <div className={styles.cardInfo}>
        <h4 className={styles.name}>{name}</h4>
        <p className={styles.role}>{role}</p>
        <div className={styles.socials}>
          {linkedin && linkedin !== "#" ? (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialIcon}>
              <FaLinkedinIn />
            </a>
          ) : (
            <div className={`${styles.socialIcon} ${styles.socialIconInactive}`}>
              <FaLinkedinIn />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const EnergyParticle = ({ delay, duration, pathD, colorType }) => {
  const particleClass = colorType === 'red' ? styles.particleRed : colorType === 'blue' ? styles.particleBlue : styles.particleGray;
  const auraClass = colorType === 'red' ? styles.auraRed : colorType === 'blue' ? styles.auraBlue : styles.auraGray;

  return (
    <motion.circle r="4" className={particleClass}>
      <animateMotion dur={`${duration}s`} repeatCount="indefinite" path={pathD} begin={`${delay}s`} />
      <circle r="8" className={auraClass} />
      <circle r="2" fill="white" filter="blur(1px)" />
    </motion.circle>
  )
}

const FullConnectorPath = () => {
  const paths = [
    "M 500,0 C 500,100 500,100 500,200",
    "M 500,200 C 300,250 100,300 150,450",
    "M 500,200 C 700,250 900,300 850,450",
    "M 500,200 C 500,350 500,350 500,450",
    "M 150,450 C 150,550 300,550 350,750",
    "M 150,450 C 50,550 50,600 150,750",
    "M 850,450 C 850,550 700,550 650,750",
    "M 850,450 C 950,550 950,600 850,750",
    "M 500,450 C 400,600 600,600 500,750",
    "M 350,750 C 350,900 450,900 500,1100",
    "M 650,750 C 650,900 550,900 500,1100",
    "M 150,750 C 150,950 300,950 500,1100",
    "M 850,750 C 850,950 700,950 500,1100"
  ];

  return (
    <svg viewBox="0 0 1000 1100" preserveAspectRatio="none" className={styles.mainSvgConnector}>
      {paths.map((d, i) => (
        <path key={i} d={d} className={styles.mainPath} strokeDasharray="4 12" opacity={0.25} />
      ))}
      <EnergyParticle delay={0} duration={8} pathD={paths[1]} colorType="red" />
      <EnergyParticle delay={2} duration={12} pathD={paths[2]} colorType="blue" />
      <EnergyParticle delay={4} duration={10} pathD={paths[3]} colorType="gray" />
      <EnergyParticle delay={1} duration={9} pathD={paths[4]} colorType="red" />
      <EnergyParticle delay={5} duration={14} pathD={paths[6]} colorType="blue" />
      <EnergyParticle delay={3} duration={11} pathD={paths[8]} colorType="gray" />
      <EnergyParticle delay={6} duration={13} pathD={paths[9]} colorType="red" />
      <EnergyParticle delay={0} duration={15} pathD={paths[12]} colorType="blue" />
    </svg>
  )
}

export default function Autoridades() {
  const [orgData, setOrgData] = useState(null);

  useEffect(() => {
    fetch('/api/autoridadesData')
      .then(res => res.json())
      .then(data => setOrgData(data))
      .catch(err => console.error('Error fetching autoridades:', err));
  }, []);

  if (!orgData) return <div>Cargando...</div>;

  const rectora = orgData
  const vicerrector = orgData.children[0]
  const nivel3 = vicerrector.children
  const nivel4 = nivel3.flatMap(node => node.children || []).filter(Boolean)

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>Autoridades</h2>
        <div className={styles.titleLine} />
      </header>

      <div className={styles.organicLayout}>
        <FullConnectorPath />
        
        <div className={styles.cardRow}>
          <AuthorityCard person={rectora} index={0} />
        </div>

        <div className={styles.cardRow}>
          <AuthorityCard person={vicerrector} index={1} />
        </div>

        <div className={styles.cardRow} style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
            {nivel3.map((p, i) => (
              <AuthorityCard key={i} person={p} index={10 + i} />
            ))}
          </div>
        </div>

        <div className={styles.cardRow} style={{ marginTop: '40px' }}>
           <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
            {nivel4.map((p, i) => <AuthorityCard key={i} person={p} index={20 + i} />)}
           </div>
        </div>
      </div>
    </section>
  )
}
