"use client"

import { useState } from "react"
import styles from "./Alumnos.module.css"
import { FaFilePdf, FaLink, FaTimes, FaRocket, FaBook, FaInfoCircle, FaLaptopCode, FaTools, FaCarSide, FaGithub, FaGoogleDrive, FaYoutube, FaCalendarAlt, FaGlobe } from "react-icons/fa"
import Image from "next/image"
import config from "../../data/config.json"

const Alumnos = () => {
    const { sections } = config;
    const [selectedResource, setSelectedResource] = useState(null)
    const [fullscreenImage, setFullscreenImage] = useState(null)
    const [filter, setFilter] = useState("Todos")

    const categories = ["Todos", "Novedades"].filter(cat => {
        if (cat === "Proyectos" && !sections.proyectos_destacados) return false;
        return true;
    });

    const featuredProjects = [] // Vacío por ahora

    const resources = [
        {
            id: 1,
            category: "Novedades",
            type: "link",
            title: "Inscripción Promoción Acompañada 2026",
            description: "Inscripciones abiertas del 27/04 al 01/05 inclusive.",
            fullContent: "Se informa que se encuentra abierta la inscripción para el programa de Promoción Acompañada 2026. El proceso se realiza exclusivamente de forma virtual a través del formulario oficial. Es requisito completar todos los datos solicitados dentro de las fechas establecidas.",
            visitUrl: "https://docs.google.com/forms/d/e/1FAIpQLSeKweMMWvIbbHF3P2GzhqAwCDwX1RVFOr20db44c824EX5dmg/viewform",
            size: "medium",
        }
    ]

    const filteredResources = filter === "Todos" 
        ? resources 
        : resources.filter(r => r.category === filter)

    const openModal = (resource) => {
        setSelectedResource(resource)
    }

    const closeModal = () => {
        setSelectedResource(null)
        setFullscreenImage(null)
    }

    const handleDownload = (url) => {
        window.open(url, '_blank')
    }

    const getIcon = (type, category) => {
        if (category === "Proyectos") return <FaRocket size={50} />
        if (category === "Material de Estudio") return <FaBook size={50} />
        if (type === "pdf") return <FaFilePdf size={50} />
        if (type === "link") return <FaLink size={50} />
        return <FaInfoCircle size={50} />
    }

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1>Espacio del Alumno</h1>
                <p>Información relevante, trámites y novedades para los estudiantes.</p>
            </div>

            {sections.proyectos_destacados && featuredProjects.length > 0 && (
                <section className={styles.projectsSection}>
                    <h2>Proyectos Destacados</h2>
                    <div className={styles.projectsContainer}>
                        {featuredProjects.map(project => (
                            <div 
                                key={project.id} 
                                className={styles.projectCard}
                                onClick={() => openModal(project)}
                            >
                                <div className={styles.projectHeader}>
                                    <div className={styles.projectBadges}>
                                        <span className={styles.projectTag}>{project.area}</span>
                                        <span className={styles.projectYearBadge}>{project.year}</span>
                                    </div>
                                    {project.icon}
                                </div>
                                <h4>{project.title}</h4>
                                <p>{project.copete}</p>
                                <span style={{color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px'}}>DESCUBRIR MÁS...</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className={styles.filterContainer}>
                {categories.map(cat => (
                    <button 
                        key={cat}
                        className={`${styles.filterBtn} ${filter === cat ? styles.filterBtnActive : ""}`}
                        onClick={() => setFilter(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className={styles.resourcesGrid}>
                {filteredResources.map((resource) => (
                    <div
                        key={resource.id}
                        className={`${styles.resourceCard} ${styles[resource.size]}`}
                        onClick={() => openModal(resource)}
                    >
                        <div className={styles.cardIcon}>
                            {getIcon(resource.type, resource.category)}
                        </div>
                        <h3>{resource.title}</h3>
                        <p>{resource.description}</p>
                        <div className={styles.actionBtn}>
                            Ver más
                        </div>
                    </div>
                ))}
            </div>

            {selectedResource && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={`${styles.modalContent} ${selectedResource.category === "Proyectos" ? styles.projectModal : ""}`} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={closeModal}>
                            <FaTimes />
                        </button>
                        
                        <div className={styles.modalIcon}>
                            {getIcon(selectedResource.type, selectedResource.category)}
                        </div>
                        <h2>{selectedResource.title}</h2>
                        <div className={styles.modalDescription}>
                            <p>{selectedResource.fullContent}</p>
                        </div>

                        {selectedResource.downloadUrl && (
                            <button
                                className={styles.actionBtn}
                                onClick={() => handleDownload(selectedResource.downloadUrl)}
                            >
                                Descargar Archivo
                            </button>
                        )}
                        {selectedResource.visitUrl && (
                            <a
                                href={selectedResource.visitUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.actionBtn}
                            >
                                Ir al Formulario
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Alumnos
