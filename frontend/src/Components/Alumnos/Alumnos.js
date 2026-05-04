import { useState, useEffect } from "react"
import styles from "./Alumnos.module.css"
import { FaFilePdf, FaLink, FaTimes, FaRocket, FaBook, FaInfoCircle, FaGithub, FaGoogleDrive, FaYoutube } from "react-icons/fa"

const getLinkIcon = (key) => {
        const k = key.toLowerCase();
        if (k.includes('github')) return <FaGithub />;
        if (k.includes('drive')) return <FaGoogleDrive />;
        if (k.includes('video') || k.includes('youtube')) return <FaYoutube />;
        if (k.includes('pdf')) return <FaFilePdf />;
        return <FaLink />;
    }

const Alumnos = () => {
    const [config, setConfig] = useState(null);
    const [alumnosData, setAlumnosData] = useState({ categories: [], resources: [], projects: [] });
    const [selectedResource, setSelectedResource] = useState(null)
    const [fullscreenImage, setFullscreenImage] = useState(null)
    const [filter, setFilter] = useState("Todos")
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        fetch('/api/configData')
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Error fetching config:', err));
        
        fetch('/api/alumnosData')
            .then(res => res.json())
            .then(data => setAlumnosData(data))
            .catch(err => console.error('Error fetching alumnos data:', err));
    }, []);

    const categories = alumnosData.categories || [];
    const resources = alumnosData.resources || [];
    const projects = alumnosData.projects || [];
    
    // reset index when resource changes
    useEffect(() => { 
        setCurrentImageIndex(0);
        if (!selectedResource || !selectedResource.participants || !selectedResource.images || selectedResource.images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentImageIndex(prev => (prev + 1) % selectedResource.images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedResource])

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

            {config?.sections?.proyectos_destacados && projects.length > 0 && (
                <section className={styles.projectsSection}>
                    <h2>Proyectos Destacados</h2>
                    <div className={styles.projectsContainer}>
                        {projects.map(project => (
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
                                    <FaRocket size={50} />
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
                    {/* Modal para Proyectos (Premium) o Recursos (Estilo Profesores) */}
                    {selectedResource.participants ? (
                        <div className={`${styles.modalContent} ${styles.projectModal}`} onClick={(e) => e.stopPropagation()} style={{
                            maxWidth: '950px', width: '90%', padding: '0', borderRadius: '30px', 
                            background: 'linear-gradient(145deg, #0f172a, #1e293b)', 
                            boxShadow: '0 30px 60px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <button className={styles.closeBtn} onClick={closeModal} style={{position: 'absolute', top: '25px', right: '25px', zIndex: 20, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', padding: '12px 16px', cursor: 'pointer', fontSize: '1.2rem'}}>✕</button>

                            <div className={styles.projectDetail} style={{display: 'flex', flexDirection: 'row', height: '100%'}}>
                                {selectedResource.images?.length > 0 && (
                                    <div style={{
                                        width: '35%', display: 'flex', flexDirection: 'column', gap: '15px', padding: '30px', 
                                        background: 'rgba(0,0,0,0.2)', overflowY: 'auto', maxHeight: '100%'
                                    }}>
                                        {/* Imagen Principal Grande */}
                                        <div style={{
                                            width: '100%', height: '350px', borderRadius: '24px', overflow: 'hidden', cursor: 'pointer',
                                            border: '3px solid #38bdf8', boxShadow: '0 12px 24px rgba(0,0,0,0.3)'
                                        }} onClick={() => setFullscreenImage(selectedResource.images[currentImageIndex])}>
                                            <img src={selectedResource.images[currentImageIndex]} alt="Proyecto" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                        </div>

                                        {/* Miniaturas */}
                                        <div style={{display: 'flex', gap: '10px', overflowX: 'auto', padding: '5px 0'}}>
                                            {selectedResource.images.map((img, i) => (
                                                <div key={i} style={{
                                                    flex: '0 0 60px', height: '60px', borderRadius: '12px', overflow: 'hidden', 
                                                    cursor: 'pointer', border: i === currentImageIndex ? '2px solid #38bdf8' : '2px solid transparent',
                                                    opacity: i === currentImageIndex ? 1 : 0.6
                                                }} onClick={() => setCurrentImageIndex(i)}>
                                                    <img src={img} alt="Miniatura" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Enlaces debajo de la galería */}
                                        <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                            {Object.entries(selectedResource.links || {}).filter(([k,v]) => v && v !== '#').map(([k, v]) => (
                                                <a key={k} href={v} target="_blank" rel="noopener noreferrer" style={{
                                                    padding: '12px 15px', background: 'transparent', color: '#38bdf8', borderRadius: '8px', 
                                                    textDecoration: 'none', fontWeight: '700', border: '2px solid #38bdf8', fontSize: '0.85rem', textAlign: 'center',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                                }} onMouseOver={(e) => {e.currentTarget.style.background = '#38bdf8'; e.currentTarget.style.color = 'white'}} onMouseOut={(e) => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#38bdf8'}}>{getLinkIcon(k)} {k.toUpperCase()}</a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div style={{width: '65%', padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column'}}>
                                    <h2 style={{marginTop: 0, color: '#38bdf8', fontSize: '2.5rem', marginBottom: '15px', fontWeight: '800'}}>{selectedResource.title}</h2>

                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px'}}>
                                        <span style={{background: '#3b82f6', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600'}}>{selectedResource.area}</span>
                                        <span style={{color: '#94a3b8', fontSize: '0.95rem'}}>📅 {selectedResource.fecha}</span>
                                    </div>

                                    {/* Participantes (Arriba, ancho completo) */}
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px'}}>
                                        <div style={{padding: '10px 15px', borderRadius: '12px'}}>
                                            <h4 style={{margin: '0 0 5px', color: '#60a5fa', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Docentes</h4>
                                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>{(selectedResource.participants?.teachers || []).map((t, i) => <span key={i} style={{fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#bfdbfe', padding: '3px 10px', borderRadius: '6px', borderLeft: '2px solid #38bdf8'}}>{t}</span>)}</div>
                                        </div>
                                        <div style={{padding: '10px 15px', borderRadius: '12px'}}>
                                            <h4 style={{margin: '0 0 5px', color: '#60a5fa', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Alumnos</h4>
                                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>{(selectedResource.participants?.students || []).map((s, i) => <span key={i} style={{fontSize: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#bfdbfe', padding: '3px 10px', borderRadius: '6px', borderLeft: '2px solid #38bdf8'}}>{s.name} <span style={{opacity: 0.6, fontSize: '0.65rem'}}>({s.year}º{s.division})</span></span>)}</div>
                                        </div>
                                    </div>

                                    {/* Copete */}
                                    <p style={{lineHeight: '1.6', color: '#f8fafc', fontSize: '1.2rem', marginBottom: '20px', fontWeight: '500', fontStyle: 'italic', borderLeft: '4px solid #38bdf8', paddingLeft: '15px'}}>
                                        {selectedResource.copete}
                                    </p>

                                    {/* Descripción Completa */}
                                    <div style={{
                                        lineHeight: '1.8', color: '#94a3b8', fontSize: '1.05rem', whiteSpace: 'pre-line',
                                        paddingRight: '15px', overflowY: 'auto', maxHeight: '300px',
                                        scrollbarWidth: 'thin', scrollbarColor: '#38bdf8 transparent'
                                    }}>
                                        {selectedResource.fullContent}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Modal Original (estilo Profesores) */
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <button className={styles.closeBtn} onClick={closeModal}><FaTimes /></button>

                            <div className={styles.modalIcon}>{getIcon(selectedResource.type, selectedResource.category)}</div>
                            <h2>{selectedResource.title}</h2>
                            <div className={styles.modalDescription}>
                                <p>{selectedResource.fullContent}</p>
                            </div>

                            {selectedResource.downloadUrl && (
                                <button className={styles.actionBtn} onClick={() => handleDownload(selectedResource.downloadUrl)}>Descargar Archivo</button>
                            )}
                            {selectedResource.visitUrl && (
                                <a href={selectedResource.visitUrl} target="_blank" rel="noopener noreferrer" className={styles.actionBtn}>Visitar Enlace</a>
                            )}
                        </div>
                    )}
                </div>
            )}            
            {fullscreenImage && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'}} onClick={() => setFullscreenImage(null)}>
                    <img src={fullscreenImage} alt="Full" style={{maxWidth: '90%', maxHeight: '90%', borderRadius: '10px'}} />
                </div>
            )}
        </div>
    )
}

export default Alumnos;
