"use client"

import { useState } from "react"
import styles from "./Profesores.module.css"
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from "react-icons/ai"
import { FaFilePdf, FaLink, FaTimes, FaBullhorn } from "react-icons/fa"

const Profesores = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [selectedResource, setSelectedResource] = useState(null)

    const [reactions, setReactions] = useState({
        featured: [
            { likes: 23, dislikes: 2, userLiked: false, userDisliked: false },
            { likes: 45, dislikes: 1, userLiked: false, userDisliked: false },
        ],
        resources: [
            { likes: 15, dislikes: 0, userLiked: false, userDisliked: false },
            { likes: 12, dislikes: 3, userLiked: false, userDisliked: false },
            { likes: 31, dislikes: 0, userLiked: false, userDisliked: false },
            { likes: 25, dislikes: 0, userLiked: false, userDisliked: false },
            { likes: 42, dislikes: 1, userLiked: false, userDisliked: false },
            { likes: 58, dislikes: 5, userLiked: false, userDisliked: false },
        ],
    })

    const featuredContent = [
        {
            id: 1,
            title: "Aviso Importante",
            description: "Reunión de personal obligatoria el próximo viernes. Consultar detalles en la circular enviada.",
            image: "/important-notice-document.jpg",
        },
        {
            id: 2,
            title: "Nuevo Material Didáctico",
            description: "Se ha actualizado el material de apoyo para las clases de matemática avanzada.",
            image: "/educational-materials.png",
        },
    ]

    const resources = [
        {
            id: 1,
            type: "text",
            title: "Comunicados Generales",
            description:
                "Invitación al acto conmemorativo por el 75° aniversario de la Escuela Técnica N°32 'Gral. José de San Martín'.",
            fullContent:
                "La Escuela Técnica N°32 'Gral. José de San Martín' invita a acompañarnos en esta fecha tan especial para nosotros. El acto se realizará el día 24 de Octubre a las 10:00 hs. en Teodoro García 3899, CABA. 1950 - 2025.",
            size: "small",
        },
        {
            id: 2,
            type: "text",
            title: "Justificación de Inasistencias",
            description:
                "Se recuerda al personal que las justificaciones por inasistencia deben presentarse en la secretaría dentro de las 48 horas hábiles.",
            fullContent:
                "Se recuerda al personal que las justificaciones por inasistencia deben presentarse en la secretaría dentro de las 48 horas hábiles. Es imperativo adjuntar el certificado médico correspondiente si aplica. Las inasistencias no justificadas en tiempo y forma serán consideradas como faltas injustificadas según el reglamento interno.",
            size: "xsmall",
        },
        {
            id: 3,
            type: "pdf",
            title: "Protocolo de Emergencia",
            description: "Instructivo actualizado sobre los procedimientos a seguir.",
            fullContent:
                "Instructivo actualizado sobre los procedimientos a seguir en caso de emergencia. Incluye rutas de evacuación, puntos de encuentro, y responsables de cada sector. Es obligatorio que todo el personal conozca este protocolo.",
            downloadUrl: "#",
            size: "small",
        },
        {
            id: 4,
            type: "pdf",
            title: "Reglamento Escolar",
            description: "Consulte la versión actualizada del reglamento de la institución.",
            fullContent:
                "Consulte la versión actualizada del reglamento de la institución. Este documento contiene las normativas vigentes, derechos y obligaciones del personal docente, horarios, licencias, y procedimientos administrativos.",
            downloadUrl: "/ReglamentoEscolar2025.pdf",
            size: "xsmall",
        },
        {
            id: 5,
            type: "link",
            title: "Clasificación Docente",
            description: "Acceda al portal oficial de clasificación docente del GCBA.",
            fullContent:
                "En este portal puede consultar la información sobre su clasificación docente, puntaje y trámites relacionados al área de recursos humanos del Gobierno de la Ciudad de Buenos Aires.",
            visitUrl: "https://clasificaciondocente.buenosaires.gob.ar/",
            size: "xsmall",
        },
        {
            id: 6,
            type: "link",
            title: "Recibos de Sueldo",
            description: "Ingrese al portal BA desde adentro para consultar sus recibos.",
            fullContent:
                "Acceda al sitio oficial BA Desde Adentro para visualizar y descargar sus recibos de haberes, consultar historial salarial y gestionar documentación laboral.",
            visitUrl: "https://badesdeadentro.gob.ar/",
            size: "xsmall",
        },
        {
            id: 7,
            type: "link",
            title: "MIA - Portal de Gestión Docente",
            description: "Acceso al sistema MIA del Gobierno de la Ciudad.",
            fullContent:
                "El sistema MIA (Mi Información Administrativa) permite gestionar datos personales, licencias, designaciones y novedades docentes. Requiere autenticación con cuenta oficial del GCBA.",
            visitUrl:
                "https://oauth2-server.apps.buenosaires.gob.ar/oidc/authorize?client_id=ucyt3a0z-htel-pk1g-8c5f-NOC1038898&scope=openid&redirect_uri=https%3A%2F%2Fmia.dguiaf-gcba.gov.ar%2Flogin&response_type=code&response_mode=query&state=SEwta1BneF9GWDhEUGJOfmtzWmpiMEROaVRMY1BIa1JUN0V3TXkwSkNGSQ%3D%3D&nonce=N2VMS2c5SXhaMGpkT2hnaG5nUUdwTjVwQjNVdms2eGJKNHZ1UTljX2JGYg%3D%3D&code_challenge=fB1lUrf_nD540VZSOWdixItGBe1eTERfvS6p2rQ2l6I&code_challenge_method=S256&auth0Client=eyJuYW1lIjoiYXV0aDAtcmVhY3QiLCJ2ZXJzaW9uIjoiMi40LjAifQ%3D%3D",
            size: "medium",
        },
        {
            id: 8,
            type: "link",
            title: "Calculadora Salarial",
            description: "Simule su salario docente con la calculadora oficial de referencia.",
            fullContent:
                "Use la calculadora salarial interactiva para estimar sus ingresos según antigüedad, cargo y horas cátedra. Herramienta desarrollada por Juan Winograd.",
            visitUrl: "https://juanwinograd.github.io/CalculadoraSalarial/",
            size: "xsmall",
        },
        {
            id: 9,
            type: "link",
            title: "Declaración Jurada (DDJJ)",
            description: "Acceso al portal Mideclaración del GCBA.",
            fullContent:
                "Por problemas o dudas: 💻 Ingresá a la Sala Virtual de Consultas, de lunes a viernes, de 9 a 20 h. 📧 Escribí a consultas.djl@bue.edu.ar. 📞 Llamá al 147, opción 2, 3, luego 1, después 1 y a continuación alguno de los internos 4017/4023. En caso de tener dudas sobre miBA, podés consultar con Boti por Whatsapp al 1150500147.",
            visitUrl: "https://mideclaracion.buenosaires.gob.ar/login",
            size: "xsmall",
        },
        {
            id: 10,
            type: "link",
            title: "Portal Mi Escuela (AprendeBA)",
            description: "Acceso al portal institucional Mi Escuela para docentes.",
            fullContent:
                "Desde el portal Mi Escuela podrás acceder a AprendeBA, cargar asistencias, consultar horarios y recursos institucionales del Ministerio de Educación de la Ciudad.",
            visitUrl: "https://miescuela.bue.edu.ar/",
            size: "xsmall",
        },
        {
            id: 11,
            type: "link",
            title: "Talento Tech (Adultos)",
            description: "Portal de capacitación digital para adultos de la Ciudad de Buenos Aires.",
            fullContent:
                "Talento Tech ofrece cursos gratuitos de programación, diseño, inteligencia artificial y habilidades digitales. Dirigido a adultos que buscan desarrollar competencias tecnológicas para el empleo.",
            visitUrl: "https://talentotech.bue.edu.ar/",
            size: "xsmall",
        },
        {
            id: 12,
            type: "link",
            title: "Mi Portal Maestro",
            description: "Acceso al portal SGA Escuela de Maestros del GCBA.",
            fullContent:
                "En este portal podrá consultar cursos, capacitaciones y trayectos formativos disponibles para docentes. Requiere acceso con usuario de Escuela de Maestros.",
            visitUrl: "https://sga-escuelademaestros.buenosaires.gob.ar/",
            size: "xsmall",
        },
        {
            id: 13,
            type: "link",
            title: "Recursos Educativos",
            description: "Acceda al portal con material didáctico digital y herramientas online.",
            fullContent:
                "Acceda al portal con material didáctico digital y herramientas online. Encontrará videos educativos, presentaciones interactivas, ejercicios descargables, y recursos multimedia para enriquecer sus clases. El portal se actualiza semanalmente con nuevo contenido.",
            visitUrl: "#",
            size: "xsmall",
        },
                {
            id: 14,
            type: "link",
            title: "Recursos ESI",
            description: "Aqui encontraras materiales y documentos relacionados con la Educación Sexual Integral (ESI).",
            fullContent:
                "Acceda al material didáctico digital y herramientas online. Encontrará videos educativos, presentaciones interactivas, ejercicios descargables, y recursos multimedia para enriquecer sus clases.",
            visitUrl: "https://drive.google.com/drive/folders/1xTNiz9NFnydfC4MkCTcQNtCw_tJLF23o?usp=sharing",
            size: "xsmall",
        },
        {
            id: 15,
            type: "link",
            title: "Recursos Escuelas Verdes",
            description: "Aqui encontraras materiales y documentos relacionados con la Educación Ambiental y las Escuelas Verdes.",
            fullContent:
                "Acceda al material didáctico digital y herramientas online. Encontrará videos educativos, presentaciones interactivas, ejercicios descargables, y recursos multimedia para enriquecer sus clases.",
            visitUrl: "https://drive.google.com/drive/folders/1IIY8aIL0y2zt50VkjCiymzMajXBqL1mm?usp=sharing",
            size: "xsmall",
        },
        {
            id: 16,
            type: "link",
            title: "Recursos para Tutorías",
            description: "Aqui encontraras materiales y documentos relacionados con las tutorías.",
            fullContent:
                "Acceda al material didáctico digital y herramientas online. Encontrará videos educativos, presentaciones interactivas, ejercicios descargables, y recursos multimedia para enriquecer sus clases.",
            visitUrl: "https://drive.google.com/drive/folders/1l5_MDOiwv45SNRsk23e6LfOuSBf4vA6G?usp=sharing",
            size: "xsmall",
        }

    ];


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
                <h1>Contenido para Docentes</h1>
                <p>Recursos, avisos e instructivos para el cuerpo docente.</p>
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
                                <span className={styles.textIcon}>
                                    <FaBullhorn size={40} />
                                </span>
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
                                <span className={styles.textIcon}>
                                    <FaBullhorn size={40} />
                                </span>
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
                                Acceder
                            </button>
                        )}
                        {selectedResource.visitUrl && (
                            <a
                                href={selectedResource.visitUrl}
                                className={styles.actionBtn}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Acceder
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Profesores
