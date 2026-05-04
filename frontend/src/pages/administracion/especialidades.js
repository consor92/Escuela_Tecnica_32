import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './especialidades.module.css';
import { FaSave, FaPlus, FaTrash, FaBookOpen, FaFileAlt, FaFileUpload, FaTags, FaFilePdf } from 'react-icons/fa';

const Especialidades = () => {
    const [disciplines, setDisciplines] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [expandedYear, setExpandedYear] = useState(null);
    const [expandedIdentity, setExpandedIdentity] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    useEffect(() => {
        fetch('/api/admin/getData?fileName=disciplines.json')
            .then(res => res.json())
            .then(data => {
                const items = data.especialidades || data;
                setDisciplines(items);
                if (items.length > 0) setActiveTab(items[0].id);
            })
            .catch(err => console.error('Error cargando especialidades:', err));
    }, []);

    const handleSaveAll = async () => {
        try {
            const response = await fetch('/api/admin/saveData', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: 'disciplines.json', data: disciplines }),
            });
            if (response.ok) showNotification('Especialidades guardadas exitosamente.');
            else showNotification('Error al guardar.', 'error');
        } catch (error) {
            console.error('Error saving:', error);
            showNotification('Error al guardar.', 'error');
        }
    };

    const currentDiscipline = Array.isArray(disciplines) ? disciplines.find(d => d.id === activeTab) : null;

    if (!currentDiscipline) return <div>Cargando especialidades...</div>;


    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setDisciplines(disciplines.map(d => 
            d.id === activeTab ? { ...d, [name]: value } : d
        ));
    };

    const handleSubjectChange = (yearIndex, subjectIndex, field, value) => {
        const isObject = !Array.isArray(disciplines);
        const newDisciplines = isObject ? { ...disciplines, especialidades: [...disciplines.especialidades] } : [...disciplines];
        
        const targetArray = isObject ? newDisciplines.especialidades : newDisciplines;
        const discIndex = targetArray.findIndex(d => d.id === activeTab);
        
        // Clonamos el objeto de la disciplina para no mutar el original
        targetArray[discIndex] = { 
            ...targetArray[discIndex], 
            subjectPerYear: targetArray[discIndex].subjectPerYear.map((y, yi) => 
                yi === yearIndex ? { ...y, subjectName: y.subjectName.map((s, si) => si === subjectIndex ? { ...s, [field]: value } : s) } : y
            )
        };

        // Automatización para campos específicos
        if (field === 'hs') {
            const hours = parseInt(value) || 0;
            targetArray[discIndex].subjectPerYear[yearIndex].subjectName[subjectIndex].es_troncal = hours >= 4;
        }

        if (field === 'temas_troncales' && typeof value === 'string') {
            targetArray[discIndex].subjectPerYear[yearIndex].subjectName[subjectIndex].temas_troncales = value.split(',').map(t => t.trim()).filter(t => t !== "");
        }

        setDisciplines(newDisciplines);
    };

    const addSubject = (yearIndex) => {
        const isObject = !Array.isArray(disciplines);
        const newDisciplines = isObject ? { ...disciplines, especialidades: [...disciplines.especialidades] } : [...disciplines];
        const targetArray = isObject ? newDisciplines.especialidades : newDisciplines;
        const discIndex = targetArray.findIndex(d => d.id === activeTab);
        
        targetArray[discIndex].subjectPerYear[yearIndex].subjectName.push({
            name: "Nueva Materia",
            hs: "0 hs",
            descripcion: "",
            temas_troncales: [],
            horas_semanales: 0,
            es_troncal: false,
            departamento: "",
            pdf_link: "#"
        });
        setDisciplines(newDisciplines);
    };

    const removeSubject = (yearIndex, subjectIndex) => {
        const isObject = !Array.isArray(disciplines);
        const newDisciplines = isObject ? { ...disciplines, especialidades: [...disciplines.especialidades] } : [...disciplines];
        const targetArray = isObject ? newDisciplines.especialidades : newDisciplines;
        const discIndex = targetArray.findIndex(d => d.id === activeTab);
        
        targetArray[discIndex].subjectPerYear[yearIndex].subjectName.splice(subjectIndex, 1);
        setDisciplines(newDisciplines);
    };

    const handleFileUpload = async (e, type, field, extraInfo = null) => {
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
                        type: extraInfo?.materia ? `programa_${extraInfo.materia}` : `especialidad_${activeTab}`,
                        fileType: type === 'pdf' ? 'pdf' : 'image'
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    if (extraInfo?.materia) {
                        handleSubjectChange(extraInfo.yearIdx, extraInfo.subIdx, 'pdf_link', data.url);
                    } else if (field === 'carousel') {
                        const newCarousel = [...(currentDiscipline.carousel || [])];
                        if (extraInfo?.index !== undefined && newCarousel[extraInfo.index]) {
                            newCarousel[extraInfo.index] = data.url;
                        } else {
                            newCarousel.push(data.url);
                        }
                        setDisciplines(disciplines.map(d => d.id === activeTab ? { ...d, carousel: newCarousel } : d));
                    } else {
                        setDisciplines(disciplines.map(d => d.id === activeTab ? { ...d, [field]: data.url } : d));
                    }
                } else {
                    alert('Error: ' + data.message);
                }
                setIsUploading(false);
            };
        } catch (error) {
            alert('Error al subir archivo');
            setIsUploading(false);
        }
    };

    return (
        <AdminLayout title="Gestión de Especialidades">
            <div className={styles.container}>
                <div className={styles.tabs}>
                    {(disciplines.especialidades || disciplines).map(d => (
                        <button 
                            key={d.id} 
                            className={`${styles.tabBtn} ${activeTab === d.id ? styles.activeTab : ''}`}
                            onClick={() => {
                                setActiveTab(d.id);
                                setExpandedSubject(null);
                                setExpandedYear(null);
                            }}
                        >
                            {d.title}
                        </button>
                    ))}
                </div>

                <div className={styles.editorArea}>
                    <section className={styles.section}>
                        <div className={`${styles.yearAccordion} ${expandedIdentity ? styles.yearActive : ''}`}>
                            <header className={styles.yearHeader} onClick={() => setExpandedIdentity(!expandedIdentity)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FaFileAlt />
                                    <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Identidad y Multimedia</h3>
                                </div>
                                <FaPlus style={{ transform: expandedIdentity ? 'rotate(45deg)' : 'none', transition: '0.3s' }} />
                            </header>
                            
                            {expandedIdentity && (
                                <div className={styles.yearContent}>
                                    <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                                        <label>Resolución Ministerial:</label>
                                        <input type="text" name="resolucion" value={currentDiscipline.resolucion} onChange={handleTextChange} />
                                    </div>
                                    <div className={styles.row} style={{ flexWrap: 'wrap', gap: '20px' }}>
                                        <div className={styles.formGroup} style={{flex: 1, minWidth: '300px'}}>
                                            <label>Imagen de Portada:</label>
                                            <div className={styles.imagePreviewSmall} style={{ position: 'relative', cursor: 'pointer' }}>
                                                <img src={currentDiscipline.bg_image || `/images/bg_page_${currentDiscipline.id}.jpg`} alt="Portada" style={{ display: 'block', width: '100%' }} />
                                                <label className={styles.uploadOverlay} style={{
                                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                    backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', opacity: 0, transition: '0.3s'
                                                }} onMouseOver={(e) => e.currentTarget.style.opacity = 1} onMouseOut={(e) => e.currentTarget.style.opacity = 0}>
                                                    <FaFileUpload size={30} />
                                                    <input type="file" hidden onChange={(e) => handleFileUpload(e, 'image', 'bg_image')} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className={styles.formGroup} style={{flex: 1, minWidth: '300px'}}>
                                            <label>Carrusel (Máx 5):</label>
                                            <div className={styles.carouselGrid}>
                                                {[0, 1, 2, 3, 4].map((idx) => (
                                                    <div key={idx} className={styles.carouselItem}>
                                                        {currentDiscipline.carousel?.[idx] ? (
                                                            <>
                                                                <img src={currentDiscipline.carousel[idx]} alt={`Carrusel ${idx}`} />
                                                                <button className={styles.removeImgBtn} onClick={() => {
                                                                    const newC = [...currentDiscipline.carousel];
                                                                    newC.splice(idx, 1);
                                                                    setDisciplines(disciplines.map(d => d.id === activeTab ? {...d, carousel: newC} : d));
                                                                }}>×</button>
                                                            </>
                                                        ) : (
                                                            <label className={styles.addImgLabel}><FaPlus /><input type="file" hidden onChange={(e) => handleFileUpload(e, 'image', 'carousel', { index: idx })} /></label>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                                        <label>Perfil Profesional:</label>
                                        <textarea name="perfil_profesional" value={currentDiscipline.perfil_profesional || ''} onChange={handleTextChange} />
                                    </div>
                                    <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                                        <label>Turnos:</label>
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            {['TM', 'TT', 'TV'].map(turno => (
                                                <label key={turno} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                    <input type="checkbox" className={styles.troncalCheckbox} checked={currentDiscipline.turnos?.[turno] || false} onChange={(e) => {
                                                        const updatedDisciplines = Array.isArray(disciplines) 
                                                            ? disciplines.map(d => d.id === activeTab ? { ...d, turnos: { ...d.turnos, [turno]: e.target.checked } } : d)
                                                            : { ...disciplines, especialidades: disciplines.especialidades.map(d => d.id === activeTab ? { ...d, turnos: { ...d.turnos, [turno]: e.target.checked } } : d) };
                                                        setDisciplines(updatedDisciplines);
                                                    }} />
                                                    {turno === 'TM' ? 'Mañana' : turno === 'TT' ? 'Tarde' : 'Vespertino'}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                                        <label>Descripción (About 1):</label>
                                        <textarea name="text_about_part1" value={currentDiscipline.text_about_part1} onChange={handleTextChange} />
                                    </div>
                                    <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                                        <label>Descripción (About 2):</label>
                                        <textarea name="text_about_part2" value={currentDiscipline.text_about_part2} onChange={handleTextChange} />
                                    </div>
                                    <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                                        <label>Futuro Profesional (Parte 1):</label>
                                        <textarea name="text_future_part1" value={currentDiscipline.text_future_part1} onChange={handleTextChange} />
                                    </div>
                                    <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                                        <label>Futuro Profesional (Parte 2):</label>
                                        <textarea name="text_future_part2" value={currentDiscipline.text_future_part2} onChange={handleTextChange} />
                                    </div>
                                    <div className={styles.formGroup} style={{ marginTop: '15px' }}>
                                        <label>Prácticas Profesionalizantes:</label>
                                        <textarea name="text_practice_part1" value={currentDiscipline.text_practice_part1} onChange={handleTextChange} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <FaBookOpen />
                            <h3 className={styles.sectionTitle}>Plan de Estudios por Años</h3>
                        </div>
                        {currentDiscipline.subjectPerYear.map((yearData, yearIndex) => {
                            const isYearExpanded = expandedYear === yearIndex;
                            return (
                                <div key={yearIndex} className={`${styles.yearAccordion} ${isYearExpanded ? styles.yearActive : ''}`}>
                                    <header className={styles.yearHeader} onClick={() => setExpandedYear(isYearExpanded ? null : yearIndex)}>
                                        <h4>{yearData.year}</h4>
                                        <div className={styles.yearMeta}>
                                            <span>{yearData.subjectName.length} materias</span>
                                            <FaPlus style={{ transform: isYearExpanded ? 'rotate(45deg)' : 'none', transition: '0.3s' }} />
                                        </div>
                                    </header>
                                    {isYearExpanded && (
                                        <div className={styles.yearContent}>
                                            <table className={styles.table}>
                                                <thead><tr><th>Materia</th><th>Hs</th><th>Depto</th><th style={{textAlign: 'center'}}>Troncal</th><th style={{textAlign: 'center'}}>PDF</th><th>Acciones</th></tr></thead>
                                                <tbody>
                                                    {yearData.subjectName.map((subject, subjectIndex) => {
                                                        const isExpanded = expandedSubject === `${yearIndex}-${subjectIndex}`;
                                                        return (
                                                            <React.Fragment key={subjectIndex}>
                                                                <tr className={isExpanded ? styles.expandedRow : ''}>
                                                                    <td><input className={styles.tableInput} type="text" value={subject.name} onChange={(e) => handleSubjectChange(yearIndex, subjectIndex, 'name', e.target.value)} /></td>
                                                                    <td style={{width: '80px'}}><input className={styles.tableInput} type="text" value={subject.hs} onChange={(e) => handleSubjectChange(yearIndex, subjectIndex, 'hs', e.target.value)} /></td>
                                                                    <td style={{width: '150px'}}>
                                                                        <select className={styles.tableInput} value={subject.departamento || ''} onChange={(e) => handleSubjectChange(yearIndex, subjectIndex, 'departamento', e.target.value)}>
                                                                            <option value="">Seleccionar...</option>
                                                                            <option value="computación">Computación</option>
                                                                            <option value="mecánica">Mecánica</option>
                                                                            <option value="sociales">Sociales</option>
                                                                            <option value="exactas">Exactas</option>
                                                                            <option value="Taller">Taller</option>
                                                                            <option value="Representación">Representación</option>
                                                                        </select>
                                                                    </td>
                                                                    <td style={{textAlign: 'center', width: '80px'}}>
                                                                        <input type="checkbox" className={styles.troncalCheckbox} checked={subject.es_troncal} onChange={(e) => handleSubjectChange(yearIndex, subjectIndex, 'es_troncal', e.target.checked)} />
                                                                    </td>
                                                                    <td style={{textAlign: 'center', width: '100px'}}>{subject.pdf_link && subject.pdf_link !== '#' ? <FaFilePdf style={{color: '#e74c3c'}} /> : <small style={{opacity: 0.5}}>-</small>}</td>
                                                                    <td style={{width: '120px'}}><div className={styles.tableActions}><button className={styles.detailBtn} style={{color: '#fff'}} onClick={() => setExpandedSubject(isExpanded ? null : `${yearIndex}-${subjectIndex}`)}>{isExpanded ? 'Cerrar' : 'Info'}</button><button className={styles.deleteBtn} onClick={() => removeSubject(yearIndex, subjectIndex)}><FaTrash /></button></div></td>
                                                                </tr>
                                                                {isExpanded && (
                                                                    <tr className={styles.detailAreaRow}><td colSpan="5"><div className={styles.subjectDetailBox}>
                                                                        <div className={styles.formGroup}><label>Descripción:</label><textarea value={subject.descripcion} onChange={(e) => handleSubjectChange(yearIndex, subjectIndex, 'descripcion', e.target.value)} /></div>
                                                                        <div className={styles.formGroup}><label><FaTags /> Contenidos Nodales:</label>
                                                                            <div className={styles.tagsContainer}>
                                                                                {(subject.temas_troncales || []).map((tag, tagIdx) => (
                                                                                    <span key={tagIdx} className={styles.tag}>
                                                                                        {tag}
                                                                                        <button onClick={() => {
                                                                                            const newTags = [...subject.temas_troncales];
                                                                                            newTags.splice(tagIdx, 1);
                                                                                            handleSubjectChange(yearIndex, subjectIndex, 'temas_troncales', newTags.join(', '));
                                                                                        }}>×</button>
                                                                                    </span>
                                                                                ))}
                                                                                <input type="text" placeholder="Agregar contenido..." onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter' && e.target.value.trim()) {
                                                                                        const newTags = [...(subject.temas_troncales || []), e.target.value.trim()];
                                                                                        handleSubjectChange(yearIndex, subjectIndex, 'temas_troncales', newTags.join(', '));
                                                                                        e.target.value = '';
                                                                                    }
                                                                                }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className={styles.formGroup}><label><FaFileUpload /> Programa:</label>
                                                                            <div style={{display: 'flex', width: '100%', gap: '5px', alignItems: 'center'}}>
                                                                                <input type="text" value={subject.pdf_link} readOnly style={{flex: 1}} />
                                                                                <label className={styles.miniUploadBtn} style={{
                                                                                    color: '#fff', backgroundColor: '#3498db', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: '0.3s'
                                                                                }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5dade2'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3498db'}>
                                                                                    Subir PDF
                                                                                    <input type="file" hidden accept=".pdf" onChange={(e) => handleFileUpload(e, 'pdf', 'pdf_link', { yearIdx: yearIndex, subIdx: subjectIndex, materia: subject.name, anio: yearData.year })} />
                                                                                </label>
                                                                                {subject.pdf_link && subject.pdf_link !== '#' && (
                                                                                    <button type="button" style={{
                                                                                        color: '#fff', backgroundColor: '#e74c3c', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', transition: '0.3s'
                                                                                    }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1948a'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'} onClick={() => handleSubjectChange(yearIndex, subjectIndex, 'pdf_link', '#')}>Quitar PDF</button>
                                                                                )}
                                                                            </div>                                                                        </div>
                                                                    </div></td></tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                            <button className={styles.addBtn} onClick={() => addSubject(yearIndex)}><FaPlus /> Nueva Materia</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </section>
                </div>

                <div className={styles.floatingActionBar}>
                    <div className={styles.actionInfo}>
                        <p>Especialidad: <strong>{currentDiscipline.title}</strong></p>
                        <span>Se guardarán cambios en materias y multimedia.</span>
                    </div>
                    <div className={styles.actionButtons}>
                        <button className={styles.cancelBtn} onClick={() => window.location.reload()}>Descartar</button>
                        <button className={styles.saveBtn} onClick={handleSaveAll}><FaSave /> Guardar Especialidad</button>
                    </div>
                </div>
                {notification.message && (
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        padding: '15px 25px',
                        backgroundColor: notification.type === 'error' ? '#e74c3c' : '#27ae60',
                        color: 'white',
                        borderRadius: '5px',
                        zIndex: 1000,
                        fontWeight: 'bold'
                    }}>
                        {notification.message}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Especialidades;
