import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './alumnos.module.css';
import { 
    FaPlus, 
    FaTrash, 
    FaFileUpload, 
    FaLink, 
    FaRocket, 
    FaBook, 
    FaTags, 
    FaSave, 
    FaChevronDown,
    FaInfoCircle
} from 'react-icons/fa';

const AlumnosAdmin = () => {
    const [categories, setCategories] = useState([]);
    const [resources, setResources] = useState([]);
    const [projects, setProjects] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    
    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetch('/api/admin/getData?fileName=alumnos.json')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || []);
                setResources(data.resources || []);
                setProjects(data.projects || []);
            })
            .catch(err => console.error('Error cargando alumnos:', err));
    }, []);

    const handleSave = async () => {
        const user = localStorage.getItem('adminUserEmail') || 'Admin';
        try {
            const response = await fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: 'alumnos.json', data: { categories, resources, projects }, user }),
            });
            if (response.ok) showNotification('¡Cambios en Alumnos guardados!');
            else showNotification('Error al guardar.', 'error');
        } catch (error) {
            console.error('Error saving:', error);
            showNotification('Error al guardar.', 'error');
        }
    };
    
    const [activeView, setActiveTab] = useState('recursos'); // 'recursos', 'proyectos', 'categorias'
    const [isUploading, setIsUploading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newCat, setNewCat] = useState('');

    const addCategory = () => {
        if (newCat && !(categories || []).includes(newCat)) {
            setCategories([...(categories || []), newCat]);
            setNewCat('');
            setShowModal(false);
        }
    };

    const handleFileUpload = async (e, type, callback) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const user = localStorage.getItem('adminUserEmail') || 'Admin';
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const response = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: reader.result,
                        fileName: file.name,
                        type: type, // 'recurso_pdf' or 'proyecto_imagen'
                        fileType: file.name.endsWith('.pdf') ? 'pdf' : 'image',
                        user
                    })
                });
                const data = await response.json();
                if (response.ok) callback(data.url);
                else alert(data.message);
                setIsUploading(false);
            };
        } catch (error) {
            alert('Error al subir');
            setIsUploading(false);
        }
    };

    const addResource = () => {
        const nextId = resources.length > 0 ? Math.max(...resources.map(r => r.id)) + 1 : 1;
        const category = (categories && categories.length > 1) ? categories[1] : 'General';
        const date = new Date().toLocaleDateString('es-ES');
        const newR = { id: nextId, category: category, type: 'text', title: 'Nuevo Recurso', description: '', fullContent: '', size: 'medium', fecha: date };
        setResources([newR, ...resources]);
    };

    const addProject = () => {
        const nextId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
        const date = new Date().toLocaleDateString('es-ES');
        const newP = { 
            id: nextId, 
            title: 'Nuevo Proyecto', 
            area: 'Computación', 
            year: '2026', 
            copete: '', 
            fullContent: '', 
            images: [],
            links: { github: '', drive: '', video: '', pdf: '' },
            participants: { teachers: [], students: [] },
            competition: { name: '', place: '', result: '' },
            fecha: date
        };
        setProjects([newP, ...projects]);
    };

    const handleProjectChange = (id, field, value) => {
        setProjects(projects.map(p => {
            if (p.id !== id) return p;
            if (field.includes('.')) {
                const [f1, f2] = field.split('.');
                return { ...p, [f1]: { ...p[f1], [f2]: value } };
            }
            return { ...p, [field]: value };
        }));
    };

    const addParticipant = (projectId, type) => {
        setProjects(projects.map(p => {
            if (p.id !== projectId) return p;
            const newParticipants = { ...p.participants };
            if (type === 'teachers') newParticipants.teachers.push("");
            else newParticipants.students.push({ name: "", year: "", division: "" });
            return { ...p, participants: newParticipants };
        }));
    };

    const [expandedItem, setExpandedItem] = useState(null); // 'res-ID' or 'proj-ID'

    return (
        <AdminLayout title="Gestión Espacio Alumnos">
            <div className={styles.container}>
                
                {/* TABS INTERNAS */}
                <div className={styles.internalTabs}>
                    <button onClick={() => { setActiveTab('recursos'); setExpandedItem(null); }} className={activeView === 'recursos' ? styles.activeTab : ''}>
                        Recursos y Novedades
                    </button>
                    <button onClick={() => { setActiveTab('proyectos'); setExpandedItem(null); }} className={activeView === 'proyectos' ? styles.activeTab : ''}>
                        Proyectos Destacados
                    </button>
                    <button onClick={() => { setActiveTab('categorias'); setExpandedItem(null); }} className={activeView === 'categorias' ? styles.activeTab : ''}>
                        Filtros / Categorías
                    </button>
                </div>

                <div className={styles.contentArea}>
                    {/* VISTA RECURSOS */}
                    {activeView === 'recursos' && (
                        <section className={styles.section}>
                            <div className={styles.header}>
                                <h2>Listado de Recursos</h2>
                                <button className={styles.addBtn} onClick={addResource}><FaPlus /> Nuevo Recurso</button>
                            </div>
                            
                            <div className={styles.accordionList}>
                                {(resources || []).map(res => {
                                    const isExpanded = expandedItem === `res-${res.id}`;
                                    return (
                                        <div key={res.id} className={`${styles.accordionItem} ${isExpanded ? styles.active : ''}`}>
                                            <header className={styles.itemHeader} onClick={() => setExpandedItem(isExpanded ? null : `res-${res.id}`)}>
                                                <div className={styles.itemMainInfo}>
                                                    <span className={styles.itemBadge}>{res.category}</span>
                                                    <h4>{res.title || 'Nuevo Recurso'}</h4>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <span className={styles.itemType}>{res.type.toUpperCase()}</span>
                                                    <button 
                                                        className={styles.deleteBtnIcon} 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setResources(resources.filter(r => r.id !== res.id));
                                                        }}
                                                        title="Eliminar Recurso"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                    <FaChevronDown style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                                                </div>
                                            </header>

                                            {isExpanded && (
                                                <div className={styles.itemContent}>
                                                    <div className={styles.formGrid}>
                                                        <div className={styles.formGroup}>
                                                            <label>Título:</label>
                                                            <input type="text" value={res.title} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, title: e.target.value} : r))} />
                                                        </div>
                                                        <div className={styles.formGroup}>
                                                            <label>Categoría:</label>
                                                            <select value={res.category} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, category: e.target.value} : r))}>
                                                                {(categories || []).map(c => <option key={c} value={c}>{c}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className={styles.formGroup} style={{gridColumn: 'span 2'}}>
                                                            <label>Descripción Corta:</label>
                                                            <textarea value={res.description} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, description: e.target.value} : r))} />
                                                        </div>
                                                        <div className={styles.formGroup} style={{gridColumn: 'span 2'}}>
                                                            <label>Contenido Detallado (Modal):</label>
                                                            <textarea style={{minHeight: '150px'}} value={res.fullContent} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, fullContent: e.target.value} : r))} />
                                                        </div>
                                                        <div className={styles.formGroup}>
                                                            <label>Tipo de Acción:</label>
                                                            <select value={res.type} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, type: e.target.value} : r))}>
                                                                <option value="text">Solo Texto</option>
                                                                <option value="pdf">Descarga PDF</option>
                                                                <option value="link">Link Externo</option>
                                                            </select>
                                                        </div>
                                                        {res.type !== 'text' && (
                                                            <div className={styles.formGroup}>
                                                                <label>{res.type === 'pdf' ? 'Archivo PDF' : 'URL Link'}:</label>
                                                                <div className={styles.uploadRow}>
                                                                    <input type="text" value={res.visitUrl || res.downloadUrl || ''} readOnly />
                                                                    {res.type === 'pdf' ? (
                                                                        <label className={styles.miniBtn}>
                                                                            <FaFileUpload />
                                                                            <input type="file" hidden accept=".pdf" onChange={(e) => handleFileUpload(e, 'recurso_pdf', (url) => setResources(resources.map(r => r.id === res.id ? {...r, downloadUrl: url} : r)))} />
                                                                        </label>
                                                                    ) : (
                                                                        <button className={styles.miniBtn} onClick={() => {
                                                                            const url = prompt('URL:');
                                                                            if(url) setResources(resources.map(r => r.id === res.id ? {...r, visitUrl: url} : r));
                                                                        }}><FaLink /></button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={styles.itemFooter}>
                                                        <button className={styles.deleteBtnText} onClick={() => setResources(resources.filter(r => r.id !== res.id))}>
                                                            <FaTrash /> Eliminar Recurso
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* VISTA PROYECTOS */}
                    {activeView === 'proyectos' && (
                        <section className={styles.section}>
                            <div className={styles.header}>
                                <h2>Proyectos Destacados</h2>
                                <button className={styles.addBtn} onClick={addProject}><FaPlus /> Nuevo Proyecto</button>
                            </div>
                            
                            <div className={styles.accordionList}>
                                {(projects || []).map(proj => {
                                    const isExpanded = expandedItem === `proj-${proj.id}`;
                                    return (
                                        <div key={proj.id} className={`${styles.accordionItem} ${isExpanded ? styles.active : ''}`}>
                                            <header className={styles.itemHeader} onClick={() => setExpandedItem(isExpanded ? null : `proj-${proj.id}`)}>
                                                <div className={styles.itemMainInfo}>
                                                    <span className={`${styles.itemBadge} ${styles.blue}`}>{proj.area}</span>
                                                    <h4>{proj.title || 'Nuevo Proyecto'}</h4>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <span className={styles.itemYear}>{proj.year}</span>
                                                    <button 
                                                        className={styles.deleteBtnIcon} 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setProjects(projects.filter(p => p.id !== proj.id));
                                                        }}
                                                        title="Eliminar Proyecto"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                    <FaChevronDown style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                                                </div>
                                            </header>

                                            {isExpanded && (
                                                <div className={styles.itemContent}>
                                                    <div className={styles.projectEditorGrid}>
                                                        {/* IZQUIERDA */}
                                                        <div className={styles.editorMain}>
                                                            <div className={styles.formGroup}>
                                                                <label>Título del Proyecto:</label>
                                                                <input type="text" className={styles.largeInput} value={proj.title} onChange={(e) => handleProjectChange(proj.id, 'title', e.target.value)} />
                                                            </div>
                                                            <div className={styles.row}>
                                                                <div className={styles.formGroup}>
                                                                    <label>Área:</label>
                                                                    <select value={proj.area} onChange={(e) => handleProjectChange(proj.id, 'area', e.target.value)}>
                                                                        <option value="Computación">Computación</option>
                                                                        <option value="Automotores">Automotores</option>
                                                                        <option value="Mecánica">Mecánica</option>
                                                                        <option value="Ciclo Básico">Ciclo Básico</option>
                                                                        <option value="General">General</option>
                                                                    </select>
                                                                </div>
                                                                <div className={styles.formGroup}>
                                                                    <label>Año:</label>
                                                                    <input type="text" value={proj.year} onChange={(e) => handleProjectChange(proj.id, 'year', e.target.value)} />
                                                                </div>
                                                            </div>
                                                            <div className={styles.formGroup}>
                                                                <label>Resumen:</label>
                                                                <textarea value={proj.copete} onChange={(e) => handleProjectChange(proj.id, 'copete', e.target.value)} />
                                                            </div>
                                                            <div className={styles.formGroup}>
                                                                <label>Descripción Completa:</label>
                                                                <textarea style={{minHeight: '200px'}} value={proj.fullContent} onChange={(e) => handleProjectChange(proj.id, 'fullContent', e.target.value)} />
                                                            </div>
                                                            
                                                            <div className={styles.subBlock}>
                                                                <h4><FaLink /> Enlaces del Proyecto</h4>
                                                                <div className={styles.linksGrid}>
                                                                    <input type="text" placeholder="GitHub" value={proj.links.github} onChange={(e) => handleProjectChange(proj.id, 'links.github', e.target.value)} />
                                                                    <input type="text" placeholder="Drive" value={proj.links.drive} onChange={(e) => handleProjectChange(proj.id, 'links.drive', e.target.value)} />
                                                                    <input type="text" placeholder="Video" value={proj.links.video} onChange={(e) => handleProjectChange(proj.id, 'links.video', e.target.value)} />
                                                                    <input type="text" placeholder="PDF" value={proj.links.pdf} onChange={(e) => handleProjectChange(proj.id, 'links.pdf', e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* DERECHA */}
                                                        <div className={styles.editorSide}>
                                                            <div className={styles.subBlock}>
                                                                <h4>👥 Participantes</h4>
                                                                <div className={styles.participantList}>
                                                                    <label>Profesores:</label>
                                                                    <div className={styles.tagsList}>
                                                                        {(proj.participants?.teachers || []).map((t, idx) => (
                                                                            <span key={idx} className={styles.tag}>
                                                                                {t}
                                                                                <button onClick={() => {
                                                                                    const newT = [...proj.participants.teachers];
                                                                                    newT.splice(idx, 1);
                                                                                    handleProjectChange(proj.id, 'participants.teachers', newT);
                                                                                }}>×</button>
                                                                            </span>
                                                                        ))}
                                                                        <input type="text" placeholder="+ Docente" className={styles.addMini} onKeyDown={(e) => {
                                                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                                                const newT = [...(proj.participants.teachers || []), e.target.value.trim()];
                                                                                handleProjectChange(proj.id, 'participants.teachers', newT);
                                                                                e.target.value = '';
                                                                            }
                                                                        }} />
                                                                    </div>

                                                                    <label style={{marginTop: '1rem'}}>Alumnos:</label>
                                                                    <div className={styles.tagsList}>
                                                                        {(proj.participants?.students || []).map((s, idx) => (
                                                                            <span key={idx} className={styles.tag}>
                                                                                {s.name} ({s.year}º{s.division})
                                                                                <button onClick={() => {
                                                                                    const newS = [...proj.participants.students];
                                                                                    newS.splice(idx, 1);
                                                                                    handleProjectChange(proj.id, 'participants.students', newS);
                                                                                }}>×</button>
                                                                            </span>
                                                                        ))}
                                                                        <input type="text" placeholder="+ Alumno (Nombre,Año,Div)" className={styles.addMini} onKeyDown={(e) => {
                                                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                                                const [name, y, d] = e.target.value.split(',');
                                                                                const newS = [...(proj.participants.students || []), {name: name.trim(), year: y?.trim() || '', division: d?.trim() || ''}];
                                                                                handleProjectChange(proj.id, 'participants.students', newS);
                                                                                e.target.value = '';
                                                                            }
                                                                        }} />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className={styles.subBlock}>
                                                                <h4>🖼️ Imágenes</h4>
                                                                <div className={styles.projectImages}>
                                                                    {[0,1,2,3].map(idx => (
                                                                        <div key={idx} className={styles.imgBox}>
                                                                            {proj.images?.[idx] ? (
                                                                                <img src={proj.images[idx]} alt="Project" />
                                                                            ) : (
                                                                                <label className={styles.uploadLabel}>
                                                                                    <FaPlus />
                                                                                    <input type="file" hidden onChange={(e) => handleFileUpload(e, 'proyecto', (url) => {
                                                                                        const newI = [...proj.images];
                                                                                        newI[idx] = url;
                                                                                        handleProjectChange(proj.id, 'images', newI);
                                                                                    })} />
                                                                                </label>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles.itemFooter}>
                                                        <button className={styles.deleteBtnText} onClick={() => setProjects(projects.filter(p => p.id !== proj.id))}>
                                                            <FaTrash /> Eliminar Proyecto
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* VISTA CATEGORÍAS */}
                    {activeView === 'categorias' && (
                        <section className={styles.section}>
                            <div className={styles.header}>
                                <h2>Gestión de Filtros (Categorías)</h2>
                            </div>
                            <div className={styles.catCard}>
                                <p>Estas categorías aparecerán como botones de filtro en la web.</p>
                                <div className={styles.tagsList}>
                                    {(categories || []).map((cat, idx) => (
                                        <div key={idx} className={styles.tag}>
                                            {cat}
                                            {cat !== 'Todos' && <button onClick={() => setCategories(categories.filter(c => c !== cat))}>×</button>}
                                        </div>
                                    ))}
                                    <button className={styles.addTagBtn} onClick={() => setShowModal(true)}>+ Nueva</button>
                                </div>
                                {showModal && (
                                    <div style={{
                                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                                        background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', 
                                        justifyContent: 'center', zIndex: 1000
                                    }}>
                                        <div style={{
                                            background: 'var(--admin-card-bg)', padding: '2rem', borderRadius: '20px', 
                                            border: '1px solid var(--admin-border)', width: '350px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                                        }}>
                                            <h3 style={{marginTop: 0, marginBottom: '1.5rem', color: 'var(--admin-text)'}}>Nueva Categoría</h3>
                                            <input 
                                                type="text" 
                                                value={newCat} 
                                                onChange={(e) => setNewCat(e.target.value)} 
                                                placeholder="Nombre de la categoría..." 
                                                style={{
                                                    width: '100%', padding: '0.8rem', borderRadius: '10px', 
                                                    border: '1px solid var(--admin-border)', marginBottom: '1.5rem',
                                                    background: 'var(--admin-bg)', color: 'var(--admin-text)'
                                                }} 
                                            />
                                            <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end'}}>
                                                <button 
                                                    onClick={() => setShowModal(false)} 
                                                    style={{
                                                        background: 'transparent', border: '1px solid var(--admin-border)', 
                                                        color: 'var(--admin-text)', padding: '0.6rem 1.2rem', 
                                                        borderRadius: '8px', cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancelar
                                                </button>
                                                <button onClick={addCategory} className={styles.addBtn}>Añadir</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* BARRA FLOTANTE */}
                <div className={styles.floatingBar}>
                    <div className={styles.barInfo}>
                        <FaInfoCircle />
                        <p>Sección: <strong>Alumnos</strong> ({(resources || []).length} recursos, {(projects || []).length} proyectos)</p>
                    </div>
                    <div className={styles.barActions}>
                        <button className={styles.saveBtn} onClick={handleSave}>
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
                </div>
                {notification.message && (
                    <div style={{
                        position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px',
                        backgroundColor: notification.type === 'error' ? '#e74c3c' : '#27ae60', color: 'white',
                        borderRadius: '5px', zIndex: 1000, fontWeight: 'bold'
                    }}>
                        {notification.message}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AlumnosAdmin;