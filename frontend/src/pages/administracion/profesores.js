import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './profesores.module.css';
import { 
    FaPlus, FaTrash, FaFileUpload, FaLink, FaChalkboardTeacher, FaUserShield, FaSave, FaChevronDown, FaInfoCircle, FaCheck
} from 'react-icons/fa';

const ProfesoresAdmin = () => {
    const [categories, setCategories] = useState([]);
    const [resources, setResources] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: 'success' });
    const [activeTab, setActiveTab] = useState('recursos');
    const [expandedItem, setExpandedItem] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // Modal & Selection
    const [showFileModal, setShowFileModal] = useState(false);
    const [mediaFiles, setMediaFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileSelectorCallback, setFileSelectorCallback] = useState(null);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterSection, setFilterSection] = useState('all');

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetch('/api/admin/getData?fileName=profesores.json')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || []);
                setResources(data.resources || []);
            })
            .catch(err => console.error('Error cargando profesores:', err));
    }, []);

    const handleSave = async () => {
        try {
            const response = await fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: 'profesores.json', data: { categories, resources } }),
            });
            if (response.ok) showNotification('¡Cambios en Profesores guardados!');
            else showNotification('Error al guardar.', 'error');
        } catch (error) {
            console.error('Error saving:', error);
            showNotification('Error al guardar.', 'error');
        }
    };

    const handleFileUpload = async (e, type, callback) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
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
                        type: 'profesor_recurso',
                        fileType: file.name.endsWith('.pdf') ? 'pdf' : 'image'
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
        const ids = resources.map(r => parseInt(r.id, 10)).filter(id => !isNaN(id));
        const maxId = ids.length > 0 ? Math.max(...ids) : 0;
        const nextId = maxId + 1;
        const newR = { id: nextId, category: categories[0] || 'General', type: 'text', title: 'Nuevo Comunicado', description: '', fullContent: '', size: 'medium' };
        setResources([newR, ...resources]);
        setExpandedItem(`res-${newR.id}`);
    };

    const loadMediaFiles = async () => {
        try {
            const res = await fetch('/api/admin/files');
            const data = await res.json();
            setMediaFiles(data);
            setShowFileModal(true);
            setSelectedFile(null);
        } catch (e) {
            console.error("Error cargando multimedia", e);
        }
    };

    const filteredMedia = mediaFiles.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || f.type === filterType;
        const isNotImageSection = !f.url.includes('/images/');
        const matchesSection = filterSection === 'all' || f.url.includes(filterSection);
        return matchesSearch && matchesType && matchesSection && isNotImageSection;
    });

    return (
        <AdminLayout title="Gestión Espacio Profesores">
            <div className={styles.container}>
                <div className={styles.internalTabs}>
                    <button onClick={() => { setActiveTab('recursos'); setExpandedItem(null); }} className={activeTab === 'recursos' ? styles.activeTab : ''}>Recursos y Comunicados</button>
                    <button onClick={() => { setActiveTab('categorias'); setExpandedItem(null); }} className={activeTab === 'categorias' ? styles.activeTab : ''}>Filtros / Categorías</button>
                </div>
                <div className={styles.contentArea}>
                    {activeTab === 'recursos' && (
                        <section className={styles.section}>
                            <div className={styles.header}>
                                <h2>Recursos para el Docente</h2>
                                <button className={styles.addBtn} onClick={addResource}><FaPlus /> Agregar Recurso</button>
                            </div>
                            <div className={styles.accordionList}>
                                {resources.map(res => {
                                    const isExpanded = expandedItem === `res-${res.id}`;
                                    return (
                                        <div key={res.id} className={`${styles.accordionItem} ${isExpanded ? styles.active : ''}`}>
                                            <header className={styles.itemHeader} onClick={() => setExpandedItem(isExpanded ? null : `res-${res.id}`)}>
                                                <div className={styles.itemMainInfo}>
                                                    <span className={`${styles.itemBadge} ${res.category === 'Pedagógico' ? styles.blue : styles.gray}`}>
                                                        {res.category === 'Pedagógico' ? <FaChalkboardTeacher /> : <FaUserShield />} {res.category}
                                                    </span>
                                                    <h4>{res.title || 'Nuevo Recurso'}</h4>
                                                </div>
                                                <div className={styles.itemActions}>
                                                    <span className={styles.itemType}>{res.type.toUpperCase()}</span>
                                                    <button className={styles.deleteBtnIcon} onClick={(e) => { e.stopPropagation(); setResources(resources.filter(r => r.id !== res.id)); }} title="Eliminar Recurso"><FaTrash /></button>
                                                    <FaChevronDown style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }} />
                                                </div>
                                            </header>
                                            {isExpanded && (
                                                <div className={styles.itemContent}>
                                                    <div className={styles.formGrid}>
                                                        <div className={styles.formGroup}><label>Título:</label><input type="text" value={res.title} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, title: e.target.value} : r))} /></div>
                                                        <div className={styles.formGroup}><label>Categoría:</label><select value={res.category} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, category: e.target.value} : r))}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                                                        <div className={styles.formGroup} style={{gridColumn: 'span 2'}}><label>Bajada:</label><textarea value={res.description} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, description: e.target.value} : r))} /></div>
                                                        <div className={styles.formGroup} style={{gridColumn: 'span 2'}}><label>Contenido:</label><textarea style={{minHeight: '150px'}} value={res.fullContent} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, fullContent: e.target.value} : r))} /></div>
                                                        <div className={styles.formGroup}><label>Tipo:</label><select value={res.type} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, type: e.target.value} : r))}><option value="text">Solo Texto</option><option value="pdf">Descarga PDF</option><option value="link">Enlace</option></select></div>
                                                        {res.type !== 'text' && (
                                                            <div className={styles.formGroup}><label>URL / Archivo:</label>
                                                                <div className={styles.uploadRow}><input type="text" value={res.type === 'pdf' ? res.downloadUrl : res.visitUrl} onChange={(e) => setResources(resources.map(r => r.id === res.id ? {...r, [res.type === 'pdf' ? 'downloadUrl' : 'visitUrl']: e.target.value} : r))} />
                                                                    {res.type === 'pdf' ? (<><label className={styles.miniBtn}><FaFileUpload /><input type="file" hidden accept=".pdf" onChange={(e) => handleFileUpload(e, 'profesor_pdf', (url) => setResources(resources.map(r => r.id === res.id ? {...r, downloadUrl: url} : r)))} /></label><button className={styles.miniBtn} onClick={() => { setFileSelectorCallback(() => (url) => setResources(resources.map(r => r.id === res.id ? {...r, downloadUrl: url} : r))); loadMediaFiles(); }} title="Elegir existente"><FaLink /></button></>) : res.type === 'link' ? (<button className={styles.miniBtn} onClick={() => { const url = prompt('URL:', res.visitUrl || ''); if(url) setResources(resources.map(r => r.id === res.id ? {...r, visitUrl: url} : r)); }}><FaLink /></button>) : null}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={styles.itemFooter}><button className={styles.deleteBtnText} onClick={() => setResources(resources.filter(r => r.id !== res.id))}><FaTrash /> Eliminar Recurso</button></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                    {activeTab === 'categorias' && (
                        <section className={styles.section}>
                            <div className={styles.header}><h2>Gestión de Filtros</h2></div>
                            <div className={styles.catCard}><p>Categorías disponibles:</p><div className={styles.tagsList}>{categories.map((cat, idx) => (<div key={idx} className={styles.tag}>{cat}{cat !== 'General' && <button onClick={() => setCategories(categories.filter(c => c !== cat))}>×</button>}</div>))}<button className={styles.addTagBtn} onClick={() => { const n = prompt('Nueva categoría:'); if(n && !categories.includes(n)) setCategories([...categories, n]); }}>+ Nueva Categoría</button></div></div>
                        </section>
                    )}
                </div>
                <div className={styles.floatingBar}><div className={styles.barInfo}><FaInfoCircle /><p>Profesores ({resources.length} gestionados)</p></div><button className={styles.saveBtn} onClick={handleSave}><FaSave /> Guardar Cambios</button></div>
                {notification.message && <div style={{position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px', backgroundColor: notification.type === 'error' ? '#e74c3c' : '#27ae60', color: 'white', borderRadius: '5px', zIndex: 1000, fontWeight: 'bold'}}>{notification.message}</div>}
            </div>
            
            {showFileModal && (
                <div className={styles.modalOverlay} onClick={() => setShowFileModal(false)} style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '1100px', height: '85vh', backgroundColor: 'var(--admin-card-bg)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div className={styles.modalHeader} style={{ padding: '1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Seleccionar archivo</h3>
                            <button onClick={() => setShowFileModal(false)} style={{ background: 'var(--admin-accent)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--admin-border)' }} />
                            <select onChange={(e) => setFilterType(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px' }}><option value="all">Tipo</option><option value="image">Imagen</option><option value="pdf">PDF</option></select>
                            <select onChange={(e) => setFilterSection(e.target.value)} style={{ padding: '0.5rem', borderRadius: '8px' }}><option value="all">Sección</option><option value="/uploads/">Uploads</option><option value="/docs/">Docs</option></select>
                        </div>
                        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                            <div style={{ flex: '0 0 50%', overflowY: 'auto', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                {filteredMedia.map((f, i) => (
                                    <div key={i} className={styles.fileCard} onClick={() => setSelectedFile(f)} style={{ padding: '8px', cursor: 'pointer', border: selectedFile?.url === f.url ? '2px solid var(--admin-accent)' : '1px solid var(--admin-border)' }}>
                                        <div className={styles.filePreview} style={{ height: '80px', marginBottom: '5px' }}>{f.type === 'image' ? <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className={styles.pdfIconLarge} style={{ fontSize: '1rem' }}><FaLink /></div>}</div>
                                        <div style={{ fontSize: '0.7rem', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden' }}>{f.name}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ flex: '0 0 50%', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderLeft: '1px solid var(--admin-border)' }}>
                                {selectedFile ? (
                                    <>
                                        <div style={{ width: '100%', height: '250px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--admin-bg)', borderRadius: '12px' }}>
                                            {selectedFile.type === 'image' ? <img src={selectedFile.url} style={{ maxHeight: '100%', maxWidth: '100%' }} /> : <FaLink style={{ fontSize: '4rem' }} />}
                                        </div>
                                        <h3>{selectedFile.name}</h3>
                                        <div style={{ textAlign: 'left', margin: '1rem 0' }}>
                                            <p><strong>Tamaño:</strong> {selectedFile.size}</p>
                                            <p><strong>Fecha:</strong> {new Date(selectedFile.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                        <button className={styles.saveBtn} onClick={() => { fileSelectorCallback(selectedFile.url); setShowFileModal(false); }}><FaCheck /> Seleccionar archivo</button>
                                    </>
                                ) : (<p style={{ color: '#999' }}>Selecciona un archivo para ver detalles</p>)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};
export default ProfesoresAdmin;