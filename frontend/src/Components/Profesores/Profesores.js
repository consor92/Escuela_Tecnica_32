"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import styles from "./Profesores.module.css"
import { FaFilePdf, FaLink, FaTimes, FaBullhorn, FaChalkboardTeacher, FaUserShield, FaEnvelope } from "react-icons/fa"
import EmailModal from "./EmailModal"

const Profesores = () => {
    const [selectedResource, setSelectedResource] = useState(null)
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
    const [filter, setFilter] = useState("Todos")
    const [profesoresData, setProfesoresData] = useState({ categories: [], resources: [] })

    useEffect(() => {
        fetch('/api/profesoresData')
            .then(res => res.json())
            .then(data => setProfesoresData(data))
    }, [])

    const categories = profesoresData.categories || ["Todos", "Administrativo", "Pedagógico", "Recursos"]
    const resources = profesoresData.resources || []

    const filteredResources = filter === "Todos" 
        ? resources 
        : resources.filter(r => r.category === filter)

    const openModal = (resource) => {
        setSelectedResource(resource)
    }

    const closeModal = () => {
        setSelectedResource(null)
    }

    const handleDownload = (url) => {
        window.open(url, '_blank')
    }

    const getIcon = (type, category) => {
        if (category === "Administrativo") return <FaUserShield size={50} />
        if (category === "Pedagógico") return <FaChalkboardTeacher size={50} />
        if (type === "pdf") return <FaFilePdf size={50} />
        if (type === "link") return <FaLink size={50} />
        return <FaBullhorn size={50} />
    }

    return (
        <div className={styles.container}>
            <button className={styles.floatingEmailBtn} onClick={() => setIsEmailModalOpen(true)}>
                Sugerencias
            </button>
            {isEmailModalOpen && createPortal(<EmailModal onClose={() => setIsEmailModalOpen(false)} />, document.body)}
            <div className={styles.hero}>
                <h1>Contenido para Docentes</h1>
                <p>Recursos, avisos e instructivos para el cuerpo docente.</p>
            </div>

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

            {selectedResource && createPortal(
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                                Visitar Enlace
                            </a>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

export default Profesores
