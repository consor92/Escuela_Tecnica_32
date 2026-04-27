"use client"

import { useState } from "react"
import styles from "./Profesores.module.css"
import { FaFilePdf, FaLink, FaTimes, FaBullhorn, FaChalkboardTeacher, FaUserShield } from "react-icons/fa"

const Profesores = () => {
    const [selectedResource, setSelectedResource] = useState(null)
    const [filter, setFilter] = useState("Todos")

    const categories = ["Todos", "Administrativo", "Pedagógico", "Recursos"]

    const resources = [
        {
            id: 1,
            category: "Pedagógico",
            type: "text",
            title: "Comunicados Generales",
            description: "Invitación al acto conmemorativo por el 75° aniversario de la Escuela.",
            fullContent: "La Escuela Técnica N°32 'Gral. José de San Martín' invita a acompañarnos en esta fecha tan especial para nosotros. El acto se realizará el día 24 de Octubre a las 10:00 hs. en Teodoro García 3899, CABA.",
            size: "medium",
        },
        {
            id: 2,
            category: "Administrativo",
            type: "text",
            title: "Justificación de Inasistencias",
            description: "Procedimiento para presentar certificados en secretaría.",
            fullContent: "Se recuerda al personal que las justificaciones por inasistencia deben presentarse en la secretaría dentro de las 48 horas hábiles. Es imperativo adjuntar el certificado médico correspondiente.",
            size: "small",
        },
        {
            id: 3,
            category: "Administrativo",
            type: "pdf",
            title: "Protocolo de Emergencia",
            description: "Instructivo actualizado sobre procedimientos de evacuación.",
            fullContent: "Incluye rutas de evacuación, puntos de encuentro y responsables de cada sector. Es obligatorio conocer este protocolo.",
            downloadUrl: "#",
            size: "medium",
        },
        {
            id: 4,
            category: "Administrativo",
            type: "pdf",
            title: "Reglamento Escolar",
            description: "Consulte la versión actualizada del reglamento institucional.",
            fullContent: "Contiene normativas vigentes, derechos y obligaciones del personal docente, horarios, licencias y procedimientos administrativos.",
            downloadUrl: "/ReglamentoEscolar2025.pdf",
            size: "small",
        },
        {
            id: 5,
            category: "Recursos",
            type: "link",
            title: "Clasificación Docente",
            description: "Portal oficial de clasificación docente del GCBA.",
            fullContent: "Consulte su puntaje, listados y trámites relacionados al área de recursos humanos del Gobierno de la Ciudad.",
            visitUrl: "https://clasificaciondocente.buenosaires.gob.ar/",
            size: "small",
        },
        {
            id: 6,
            category: "Administrativo",
            type: "link",
            title: "Recibos de Sueldo",
            description: "Acceso al portal BA desde adentro.",
            fullContent: "Visualice y descargue sus recibos de haberes y gestione documentación laboral oficial.",
            visitUrl: "https://badesdeadentro.gob.ar/",
            size: "xsmall",
        },
        {
            id: 7,
            category: "Recursos",
            type: "link",
            title: "MIA - Gestión Docente",
            description: "Sistema de Mi Información Administrativa del GCBA.",
            fullContent: "Permite gestionar datos personales, licencias, designaciones y novedades docentes de forma digital.",
            visitUrl: "https://mia.dguiaf-gcba.gov.ar/",
            size: "large",
        },
        {
            id: 8,
            category: "Recursos",
            type: "link",
            title: "Calculadora Salarial",
            description: "Simulador de salario docente de referencia.",
            fullContent: "Herramienta interactiva para estimar ingresos según antigüedad, cargo y horas cátedra.",
            visitUrl: "https://juanwinograd.github.io/CalculadoraSalarial/",
            size: "small",
        },
        {
            id: 13,
            category: "Recursos",
            type: "link",
            title: "Recursos Educativos",
            description: "Material didáctico digital y herramientas online.",
            fullContent: "Videos educativos, presentaciones interactivas y ejercicios descargables para enriquecer sus clases.",
            visitUrl: "#",
            size: "medium",
        },
        {
            id: 14,
            category: "Pedagógico",
            type: "link",
            title: "Recursos ESI",
            description: "Materiales relacionados con la Educación Sexual Integral.",
            fullContent: "Repositorio con guías y documentos para el abordaje de la ESI en el aula.",
            visitUrl: "https://drive.google.com/drive/folders/1xTNiz9NFnydfC4MkCTcQNtCw_tJLF23o?usp=sharing",
            size: "small",
        }
    ];

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

            {selectedResource && (
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
                </div>
            )}
        </div>
    )
}

export default Profesores
