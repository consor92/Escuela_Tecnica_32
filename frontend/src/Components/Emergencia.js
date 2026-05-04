"use client"

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Emergencia.module.css';
import Image from 'next/image';
import { FaExclamationTriangle, FaWalking, FaShieldAlt, FaPhoneAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';

const Emergencia = () => {
    const [fullscreenImage, setFullscreenImage] = useState(null);
    const [seguridadData, setSeguridadData] = useState(null);

    useEffect(() => {
        fetch('/api/seguridadData')
            .then(res => res.json())
            .then(data => setSeguridadData(data))
            .catch(err => console.error('Error fetching seguridad:', err));
    }, []);

    if (!seguridadData) return <div>Cargando protocolos...</div>;

    const { evacuacion, seguridad } = seguridadData;

    return (
        <section id="emergencia" className={styles.container}>
            <h1 className={styles.title}>Protocolos de Emergencia</h1>

            {/* SECCIÓN EVACUACIÓN */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <FaWalking /> {evacuacion.titulo}
                </h2>
                <div className={styles.card}>
                    <div className={styles.evacuacionContentGrid}>
                        <div className={styles.instructionsSection}>
                            <p className={styles.description}>{evacuacion.descripcion}</p>
                            <h3 className={styles.subSectionTitle}>Instrucciones</h3>
                            <ul className={styles.list}>
                                {evacuacion.instrucciones.map((instruccion, index) => (
                                    <li key={index} className={styles.listItem}>
                                        <FaCheckCircle style={{color: '#4ade80', marginTop: '4px', flexShrink: 0}} />
                                        {instruccion}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.planosGrid}>
                            {evacuacion.planos.map((plano) => (
                                <div key={plano.id} className={styles.planoCard}>
                                    <h4>{plano.titulo}</h4>
                                    <div 
                                        className={styles.imageContainer}
                                        onClick={() => setFullscreenImage(plano.src)}
                                    >
                                        <Image 
                                            src={plano.src} 
                                            alt={plano.titulo} 
                                            fill 
                                            style={{objectFit: 'cover'}}
                                        />
                                        <div className={styles.imageOverlay}>🔍 CLIC PARA AMPLIAR</div>
                                    </div>
                                    <p className={styles.planoReferencia}>{plano.referencia}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN SEGURIDAD ESCOLAR */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    <FaShieldAlt /> {seguridad.titulo}
                </h2>
                <div className={styles.card}>
                    <h3 className={styles.subSectionTitle} style={{color: 'var(--background--redIntense)', fontSize: '1.4rem'}}>
                        {seguridad.subtitulo}
                    </h3>
                    <p className={styles.description}>{seguridad.mensaje}</p>

                    <div className={styles.queHacerGrid}>
                        {seguridad.queHacer.map((item, index) => (
                            <div key={index} className={styles.actionCard}>
                                <div style={{display: 'flex', gap: '15px'}}>
                                    <FaExclamationTriangle style={{color: 'var(--background--redIntense)', flexShrink: 0, marginTop: '5px'}} />
                                    <p>{item}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL FULLSCREEN */}
            {fullscreenImage && createPortal(
                <div className={styles.fullscreenOverlay} onClick={() => setFullscreenImage(null)}>
                    <button className={styles.closeFullscreen} onClick={() => setFullscreenImage(null)}>
                        <FaTimes />
                    </button>
                    <div className={styles.fullscreenImageContainer}>
                        <Image src={fullscreenImage} alt="Fullscreen" fill style={{objectFit: 'contain'}} />
                    </div>
                </div>,
                document.body
            )}
        </section>
    );
};

export default Emergencia;