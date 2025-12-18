"use client"

import { useState } from "react"
import styles from "./Alumnos.module.css"
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from "react-icons/ai"
import { FaFilePdf, FaLink, FaTimes } from "react-icons/fa"

const Alumnos = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [selectedResource, setSelectedResource] = useState(null)

    const [reactions, setReactions] = useState({
        featured: [
            { likes: 89, dislikes: 3, userLiked: false, userDisliked: false },
            { likes: 124, dislikes: 2, userLiked: false, userDisliked: false },
        ],
        resources: [
            { likes: 67, dislikes: 1, userLiked: false, userDisliked: false },
            { likes: 45, dislikes: 8, userLiked: false, userDisliked: false },
            { likes: 92, dislikes: 2, userLiked: false, userDisliked: false },
            { likes: 78, dislikes: 5, userLiked: false, userDisliked: false },
            { likes: 156, dislikes: 3, userLiked: false, userDisliked: false },
            { likes: 54, dislikes: 12, userLiked: false, userDisliked: false },
        ],
    })

    const featuredContent = [
        {
            id: 1,
            title: "Calendario de Exámenes",
            description:
                "Consulta las fechas de los próximos exámenes y trabajos prácticos. Recuerda prepararte con anticipación.",
            image: "/exam-calendar-document.jpg",
        },
        {
            id: 2,
            title: "Guía de Estudio",
            description: "Material de apoyo para las materias del ciclo actual. Incluye ejercicios y ejemplos prácticos.",
            image: "/study-guide-book.jpg",
        },
    ]

    const resources = [
        {
            id: 1,
            type: "pdf",
            title: "Horarios de Clases",
            description: "Descarga el horario actualizado de todas las materias y especialidades.",
            fullContent:
                "Descarga el horario actualizado de todas las materias y especialidades. Este documento incluye los horarios de clases teóricas, prácticas de taller, educación física y todas las actividades extracurriculares. Recuerda verificar cualquier cambio en la cartelera institucional.",
            downloadUrl: '/instructivoDocente.pdf',
            size: "xsmall",
        },
        {
            id: 2,
            type: "text",
            title: "Normas de Convivencia",
            description:
                "Es importante respetar los horarios de entrada y salida. El uso del uniforme es obligatorio. Los celulares deben permanecer en modo silencioso durante las clases.",
            fullContent:
                "Es importante respetar los horarios de entrada y salida. El uso del uniforme es obligatorio. Los celulares deben permanecer en modo silencioso durante las clases. Se debe mantener el orden y la limpieza en todas las instalaciones. El respeto mutuo entre compañeros y docentes es fundamental. Las faltas de respeto serán sancionadas según el reglamento interno.",
            size: "xlarge",
        },
        {
            id: 3,
            type: "pdf",
            title: "Material de Matemática",
            description: "Ejercicios resueltos y guías de práctica para preparar los exámenes.",
            fullContent:
                "Ejercicios resueltos y guías de práctica para preparar los exámenes. Este material incluye problemas de álgebra, geometría, trigonometría y cálculo, con explicaciones paso a paso y ejercicios adicionales para practicar.",
            downloadUrl: "#",
            size: "medium",
        },
        {
            id: 4,
            type: "pdf",
            title: "Trabajos Prácticos",
            description: "Consignas y fechas de entrega de los trabajos prácticos del trimestre.",
            fullContent:
                "Consignas y fechas de entrega de los trabajos prácticos del trimestre. Cada trabajo debe ser presentado en tiempo y forma. Se evaluará prolijidad, contenido y cumplimiento de las consignas. Las entregas tardías tendrán penalización en la nota final.",
            downloadUrl: "#",
            size: "small",
        },
        {
            id: 5,
            type: "link",
            title: "Biblioteca Virtual",
            description: "Accede a libros digitales, apuntes y recursos educativos online.",
            fullContent:
                "Accede a libros digitales, apuntes y recursos educativos online. La biblioteca virtual cuenta con más de 5000 títulos, videos educativos, simuladores interactivos y material multimedia para todas las materias. Disponible 24/7 con tu usuario institucional.",
            visitUrl: "#",
            size: "large",
        },
        {
            id: 6,
            type: "pdf",
            title: "Reglamento Estudiantil",
            description: "Conoce tus derechos y obligaciones como estudiante de la institución.",
            fullContent:
                "Conoce tus derechos y obligaciones como estudiante de la institución. Este documento detalla las normas de convivencia, sistema de evaluación, régimen de asistencia, derechos estudiantiles y procedimientos disciplinarios. Es importante que todos los estudiantes conozcan este reglamento.",
            downloadUrl: "#",
            size: "medium",
        },
    ]

    const handleFeaturedLike = (e, index) => {
        e.stopPropagation()
        setReactions((prev) => {
            const newFeatured = [...prev.featured]
            if (newFeatured[index].userLiked) {
                newFeatured[index].likes -= 1
                newFeatured[index].userLiked = false
            } else {
                newFeatured[index].likes += 1
                newFeatured[index].userLiked = true
                if (newFeatured[index].userDisliked) {
                    newFeatured[index].dislikes -= 1
                    newFeatured[index].userDisliked = false
                }
            }
            return { ...prev, featured: newFeatured }
        })
    }

    const handleFeaturedDislike = (e, index) => {
        e.stopPropagation()
        setReactions((prev) => {
            const newFeatured = [...prev.featured]
            if (newFeatured[index].userDisliked) {
                newFeatured[index].dislikes -= 1
                newFeatured[index].userDisliked = false
            } else {
                newFeatured[index].dislikes += 1
                newFeatured[index].userDisliked = true
                if (newFeatured[index].userLiked) {
                    newFeatured[index].likes -= 1
                    newFeatured[index].userLiked = false
                }
            }
            return { ...prev, featured: newFeatured }
        })
    }

    const handleResourceLike = (e, index) => {
        e.stopPropagation()
        setReactions((prev) => {
            const newResources = [...prev.resources]
            if (newResources[index].userLiked) {
                newResources[index].likes -= 1
                newResources[index].userLiked = false
            } else {
                newResources[index].likes += 1
                newResources[index].userLiked = true
                if (newResources[index].userDisliked) {
                    newResources[index].dislikes -= 1
                    newResources[index].userDisliked = false
                }
            }
            return { ...prev, resources: newResources }
        })
    }

    const handleResourceDislike = (e, index) => {
        e.stopPropagation()
        setReactions((prev) => {
            const newResources = [...prev.resources]
            if (newResources[index].userDisliked) {
                newResources[index].dislikes -= 1
                newResources[index].userDisliked = false
            } else {
                newResources[index].dislikes += 1
                newResources[index].userDisliked = true
                if (newResources[index].userLiked) {
                    newResources[index].likes -= 1
                    newResources[index].userLiked = false
                }
            }
            return { ...prev, resources: newResources }
        })
    }

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % featuredContent.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + featuredContent.length) % featuredContent.length)
    }

    const openModal = (resource, index) => {
        setSelectedResource({ ...resource, index })
    }

    const closeModal = () => {
        setSelectedResource(null)
    }

    const handleDownload = (downloadUrl) => {
        window.open(downloadUrl, '_blank')
    }

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1>Contenido para Alumnos</h1>
                <p>Material de estudio, horarios y recursos para tu aprendizaje.</p>
            </div>

            {/* <div className={styles.featured}>
                <div className={styles.carousel}>
                    <button className={styles.carouselBtn} onClick={prevSlide}>
                        ‹
                    </button>

                    <div className={styles.carouselContent}>
                        <div className={styles.carouselImage}>
                            <div
                                className={styles.documentPreview}
                                style={{ backgroundImage: `url(${featuredContent[currentSlide].image})` }}
                            />
                        </div>
                        <div className={styles.carouselInfo}>
                            <h2>{featuredContent[currentSlide].title}</h2>
                            <p>{featuredContent[currentSlide].description}</p>
                            <div className={styles.reactions}>
                                <button
                                    className={`${styles.like} ${reactions.featured[currentSlide].userLiked ? styles.active : ""}`}
                                    onClick={(e) => handleFeaturedLike(e, currentSlide)}
                                >
                                    {reactions.featured[currentSlide].userLiked ? <AiFillLike /> : <AiOutlineLike />}
                                    {reactions.featured[currentSlide].likes}
                                </button>
                                <button
                                    className={`${styles.dislike} ${reactions.featured[currentSlide].userDisliked ? styles.active : ""}`}
                                    onClick={(e) => handleFeaturedDislike(e, currentSlide)}
                                >
                                    {reactions.featured[currentSlide].userDisliked ? <AiFillDislike /> : <AiOutlineDislike />}
                                    {reactions.featured[currentSlide].dislikes}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className={styles.carouselBtn} onClick={nextSlide}>
                        ›
                    </button>
                </div>
            </div> */}

            <div className={styles.resourcesGrid}>
                {resources.map((resource, index) => (
                    <div
                        key={resource.id}
                        className={`${styles.resourceCard} ${styles[resource.size]}`}
                        onClick={() => openModal(resource, index)}
                    >
                        <div className={styles.cardIcon}>
                            {resource.type === "pdf" ? (
                                <FaFilePdf size={50} />
                            ) : resource.type === "link" ? (
                                <FaLink size={50} />
                            ) : (
                                <div className={styles.textIcon}>Aa</div>
                            )}
                        </div>
                        <h3>{resource.title}</h3>
                        <p>{resource.description}</p>
                        {/* <div className={styles.reactions}>
                            <button
                                className={`${styles.like} ${reactions.resources[index].userLiked ? styles.active : ""}`}
                                onClick={(e) => handleResourceLike(e, index)}
                            >
                                {reactions.resources[index].userLiked ? <AiFillLike /> : <AiOutlineLike />}
                                {reactions.resources[index].likes}
                            </button>
                            <button
                                className={`${styles.dislike} ${reactions.resources[index].userDisliked ? styles.active : ""}`}
                                onClick={(e) => handleResourceDislike(e, index)}
                            >
                                {reactions.resources[index].userDisliked ? <AiFillDislike /> : <AiOutlineDislike />}
                                {reactions.resources[index].dislikes}
                            </button>
                        </div> */}
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
                            {selectedResource.type === "pdf" ? (
                                <FaFilePdf size={60} />
                            ) : selectedResource.type === "link" ? (
                                <FaLink size={60} />
                            ) : (
                                <div className={styles.textIcon}>Aa</div>
                            )}
                        </div>

                        <h2>{selectedResource.title}</h2>
                        <p className={styles.modalDescription}>{selectedResource.fullContent}</p>

                        {/* <div className={styles.modalReactions}>
                            <button
                                className={`${styles.like} ${reactions.resources[selectedResource.index].userLiked ? styles.active : ""}`}
                                onClick={(e) => handleResourceLike(e, selectedResource.index)}
                            >
                                {reactions.resources[selectedResource.index].userLiked ? <AiFillLike /> : <AiOutlineLike />}
                                {reactions.resources[selectedResource.index].likes}
                            </button>
                            <button
                                className={`${styles.dislike} ${reactions.resources[selectedResource.index].userDisliked ? styles.active : ""}`}
                                onClick={(e) => handleResourceDislike(e, selectedResource.index)}
                            >
                                {reactions.resources[selectedResource.index].userDisliked ? <AiFillDislike /> : <AiOutlineDislike />}
                                {reactions.resources[selectedResource.index].dislikes}
                            </button>
                        </div> */}

                        {selectedResource.downloadUrl && (
                            <button
                                onClick={() => handleDownload(selectedResource.downloadUrl)}
                                className={styles.actionBtn}
                            >
                                Mas info
                            </button>
                        )}
                        {selectedResource.visitUrl && (
                            <a href={selectedResource.visitUrl} className={styles.actionBtn}>
                                Mas info
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Alumnos
