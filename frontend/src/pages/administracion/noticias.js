import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './noticias.module.css';
import { FaSave, FaPlus, FaTrash, FaImage, FaEdit, FaLink } from 'react-icons/fa';

const NoticiasAdmin = () => {
    const [news, setNews] = useState([]);
    const [editingNews, setEditingNews] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const contentRef = useRef(null);

    useEffect(() => {
        fetch('/api/admin/getData?fileName=news.json')
            .then(res => res.json())
            .then(data => setNews(data))
            .catch(err => console.error('Error cargando noticias:', err));
    }, []);

    const persistData = async (updatedNews) => {
        const user = localStorage.getItem('adminUserEmail') || 'Admin';
        const actionDesc = editingNews ? `Editó la noticia: ${editingNews.titulo}` : 'Actualizó el listado de noticias';
        try {
            await fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fileName: 'news.json', 
                    data: updatedNews, 
                    user,
                    description: actionDesc
                }),
            });
        } catch (err) {
            console.error('Error guardando noticias:', err);
            alert('Error al guardar cambios');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de borrar esta noticia?')) return;
        const updated = news.filter(n => n.id !== id);
        setNews(updated);
        await persistData(updated);
    };

    const handleEdit = (n) => {
        setEditingNews({ ...n });
    };

    const handleSaveEdit = async () => {
        let contenidoProcesado = editingNews.contenido;
        if (!contenidoProcesado.includes('<')) {
            contenidoProcesado = contenidoProcesado
                .split('\n')
                .filter(line => line.trim() !== '')
                .map(line => `<p>${line.trim()}</p>`)
                .join('');
        }

        const dataToSave = {
            ...editingNews,
            contenido: contenidoProcesado,
            link: editingNews.link_externo,
            carrusel: [editingNews.imagen_principal, ...(editingNews.imagenes_secundarias || [])].filter(Boolean)
        };
        
        delete dataToSave.link_externo;
        delete dataToSave.imagenes_secundarias;

        const updated = news.map(n => n.id === editingNews.id ? dataToSave : n);
        setNews(updated);
        await persistData(updated);
        setEditingNews(null);
    };

    const handleCreate = () => {
        const newId = news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1;
        const newN = {
            id: newId,
            titulo: "Nueva Noticia",
            fecha: new Date().toISOString().split('T')[0],
            descripcion: "",
            contenido: "",
            imagen_principal: "",
            imagenes_secundarias: [],
            link_externo: "",
            carrusel: []
        };
        setNews([newN, ...news]);
        setEditingNews(newN);
    };

    const handleFileChange = async (e, type, index = null) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const user = localStorage.getItem('adminUserEmail') || 'Admin';
        
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64 = reader.result;
                
                const response = await fetch('/api/admin/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: base64,
                        fileName: file.name,
                        type: 'noticia',
                        user
                    })
                });

                const data = await response.json();
                
                if (response.ok) {
                    if (type === 'principal') {
                        setEditingNews({ ...editingNews, imagen_principal: data.url });
                    } else if (type === 'secundaria') {
                        const newSec = [...(editingNews.imagenes_secundarias || [])];
                        if (index !== null) {
                            newSec[index] = data.url;
                        } else if (newSec.length < 4) {
                            newSec.push(data.url);
                        }
                        setEditingNews({ ...editingNews, imagenes_secundarias: newSec });
                    }
                } else {
                    alert('Error al subir: ' + data.message);
                }
                setIsUploading(false);
            };
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Error en la conexión con el servidor');
            setIsUploading(false);
        }
    };

    const applyTag = (tag, closeTag = null) => {
        if (!contentRef.current) return;
        const textarea = contentRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const before = text.substring(0, start);
        const after = text.substring(end);

        const open = `<${tag}>`;
        const close = closeTag ? `</${closeTag}>` : `</${tag}>`;
        
        const newContent = before + open + selectedText + close + after;
        
        setEditingNews({ ...editingNews, contenido: newContent });
        
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + open.length, end + open.length);
        }, 10);
    };

    return (
        <AdminLayout title="Gestión de Noticias">
            <div className={styles.container}>
                {!editingNews ? (
                    <section className={styles.section}>
                        <div className={styles.header}>
                            <h2>Listado de Noticias</h2>
                            <button className={styles.addBtn} onClick={handleCreate}><FaPlus /> Nueva Noticia</button>
                        </div>
                        <div className={styles.newsGrid}>
                            {Array.isArray(news) && news.map(n => (
                                <div key={n.id} className={styles.newsCard}>
                                    <div className={styles.cardBadge}>{n.fecha}</div>
                                    <img src={n.imagen_principal || '/images/logoET32.png'} alt={n.titulo} />
                                    <div className={styles.newsInfo}>
                                        <h3>{n.titulo}</h3>
                                        <p>{n.descripcion?.substring(0, 80)}...</p>
                                        <div className={styles.cardActions}>
                                            <button className={styles.editBtn} onClick={() => handleEdit(n)}><FaEdit /> Editar</button>
                                            <button className={styles.deleteBtn} onClick={() => handleDelete(n.id)}><FaTrash /> Borrar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className={styles.editorSection}>
                        <div className={styles.header}>
                            <h2>{editingNews.id ? 'Editando Noticia' : 'Nueva Noticia'}</h2>
                            <div className={styles.headerActions}>
                                <button className={styles.backBtn} onClick={() => setEditingNews(null)}>Cancelar</button>
                                <button className={styles.saveBtnTop} onClick={handleSaveEdit}><FaSave /> Guardar Cambios</button>
                            </div>
                        </div>

                        <div className={styles.editorGrid}>
                            <div className={styles.mainEditor}>
                                <div className={styles.editorCard}>
                                    <div className={styles.formGroup}>
                                        <label>Título de la Noticia:</label>
                                        <input 
                                            type="text" 
                                            className={styles.titleInput}
                                            value={editingNews.titulo} 
                                            onChange={(e) => setEditingNews({...editingNews, titulo: e.target.value})} 
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Descripción Corta:</label>
                                        <textarea 
                                            value={editingNews.descripcion} 
                                            onChange={(e) => setEditingNews({...editingNews, descripcion: e.target.value})} 
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Contenido:</label>
                                        <div className={styles.richTextToolbar}>
                                            <button type="button" onClick={() => applyTag('b')} title="Negrita"><b>B</b></button>
                                            <button type="button" onClick={() => applyTag('i')} title="Cursiva"><i>I</i></button>
                                            <button type="button" onClick={() => applyTag('u')} title="Subrayado"><u>U</u></button>
                                            <button type="button" onClick={() => applyTag('ul', 'ul')} title="Lista">UL</button>
                                            <button type="button" onClick={() => applyTag('li')} title="Ítem">LI</button>
                                            <span className={styles.toolbarDivider}></span>
                                            <button type="button" onClick={() => applyTag('h3')} title="Título">H3</button>
                                            <button type="button" onClick={() => applyTag('p')} title="Párrafo">P</button>
                                            <button type="button" onClick={() => {
                                                const url = prompt('Ingresa la URL del link:');
                                                if(url) applyTag(`a href="${url}" target="_blank"`, 'a');
                                            }} title="Enlace">Link</button>
                                        </div>
                                        <textarea 
                                            ref={contentRef}
                                            className={styles.richTextArea}
                                            value={editingNews.contenido} 
                                            onChange={(e) => setEditingNews({...editingNews, contenido: e.target.value})}
                                            placeholder="Escribí el cuerpo de la noticia aquí..."
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Link Externo:</label>
                                        <input 
                                            type="text" 
                                            value={editingNews.link_externo || ''} 
                                            onChange={(e) => setEditingNews({...editingNews, link_externo: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <aside className={styles.sideEditor}>
                                <div className={styles.editorCard}>
                                    <h3>Imágenes</h3>
                                    
                                    <div className={styles.imageUploadBlock}>
                                        <label>Imagen Principal:</label>
                                        <div className={styles.mainPreview}>
                                            <img src={editingNews.imagen_principal || '/images/logoET32.png'} alt="Principal" />
                                            <label className={styles.uploadOverlay}>
                                                <FaImage /> Cambiar
                                                <input type="file" hidden onChange={(e) => handleFileChange(e, 'principal')} />
                                            </label>
                                        </div>
                                    </div>

                                    <div className={styles.secondaryImagesBlock}>
                                        <label>Imágenes Secundarias:</label>
                                        <div className={styles.secImagesGrid}>
                                            {[0, 1, 2, 3].map((idx) => (
                                                <div key={idx} className={styles.secPreview}>
                                                    {editingNews.imagenes_secundarias?.[idx] ? (
                                                        <>
                                                            <img src={editingNews.imagenes_secundarias[idx]} alt={`Secundaria ${idx}`} />
                                                            <button 
                                                                className={styles.removeImg}
                                                                onClick={() => {
                                                                    const newSec = [...editingNews.imagenes_secundarias];
                                                                    newSec.splice(idx, 1);
                                                                    setEditingNews({...editingNews, imagenes_secundarias: newSec});
                                                                }}
                                                            >
                                                                ×
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <label className={styles.addImgLabel}>
                                                            <FaPlus />
                                                            <input type="file" hidden onChange={(e) => handleFileChange(e, 'secundaria')} />
                                                        </label>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </section>
                )}
            </div>
        </AdminLayout>
    );
};

export default NoticiasAdmin;
