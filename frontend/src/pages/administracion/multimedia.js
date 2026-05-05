import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './multimedia.module.css';
import { 
    FaUpload, 
    FaTrash, 
    FaCopy, 
    FaSearch, 
    FaFilePdf, 
    FaImage, 
    FaFilter,
    FaSync,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';

const Multimedia = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, image, pdf
    const [filterSection, setFilterSection] = useState('all');

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/files');
            const data = await res.json();
            setFiles(data);
        } catch (error) {
            console.error("Error fetching files");
        }
        setLoading(false);
    };

    useEffect(() => { fetchFiles(); }, []);

    const handleDelete = async (url) => {
        if (!confirm('¿Estás seguro de eliminar este archivo permanentemente?')) return;
        const user = localStorage.getItem('adminUserEmail') || 'Admin';
        try {
            const res = await fetch(`/api/admin/files?url=${encodeURIComponent(url)}&user=${encodeURIComponent(user)}`, { method: 'DELETE' });
            if (res.ok) {
                setFiles(files.filter(f => f.url !== url));
            } else {
                alert('No se pudo eliminar el archivo');
            }
        } catch (error) {
            alert('Error en el servidor');
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const user = localStorage.getItem('adminUserEmail') || 'Admin';
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: reader.result,
                    fileName: file.name,
                    type: 'manual_upload',
                    fileType: file.name.endsWith('.pdf') ? 'pdf' : 'image',
                    user
                })
            });
            if (res.ok) fetchFiles();
            else alert('Error al subir');
        };
    };

    const copyUrl = (url) => {
        navigator.clipboard.writeText(url);
        alert('URL copiada al portapapeles');
    };

    const [previewFile, setPreviewFile] = useState(null);

    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Lógica para detectar duplicados
    const filesWithDuplicates = files.map(file => ({
        ...file,
        isDuplicate: files.filter(f => f.name === file.name).length > 1
    }));

    const sortedFiles = [...filesWithDuplicates].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const filteredFiles = sortedFiles.filter(f => {
        const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || f.type === filterType;
        const matchesSection = filterSection === 'all' || f.url.includes(filterSection);
        return matchesSearch && matchesType && matchesSection;
    });

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const canDelete = (url) => {
        return url.includes('/doc/') || url.includes('/uploads/');
    };

    return (
        <AdminLayout title="Centro de Medios">
            <div className={styles.container}>
                <div className={styles.controlsCard}>
                    <div className={styles.searchRow}>
                        <div className={styles.searchInput}>
                            <FaSearch />
                            <input 
                                type="text" 
                                placeholder="Buscar archivos..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select onChange={(e) => setFilterType(e.target.value)} className={styles.refreshBtn}>
                            <option value="all">Todos los tipos</option>
                            <option value="image">Imágenes</option>
                            <option value="pdf">PDFs</option>
                        </select>
                        <select onChange={(e) => setFilterSection(e.target.value)} className={styles.refreshBtn}>
                            <option value="all">Todas las secciones</option>
                            <option value="/uploads/">Uploads</option>
                            <option value="/docs/">Docs</option>
                            <option value="/images/">Imágenes Predeterminadas</option>
                        </select>
                        <label className={styles.uploadBtn}>
                            <FaUpload /> Subir
                            <input type="file" onChange={handleUpload} style={{ display: 'none' }} />
                        </label>
                        <button className={styles.refreshBtn} onClick={fetchFiles}>
                            <FaSync className={loading ? styles.spinning : ''} />
                        </button>
                    </div>
                </div>

                <div className={styles.grid}>
                    {filteredFiles.map((file, idx) => (
                        <div key={idx} className={`${styles.fileCard} ${file.isDuplicate ? styles.duplicateCard : ''}`}>
                            <div className={styles.filePreview} onClick={() => setPreviewFile(file)}>
                                {file.type === 'image' ? (
                                    <img src={file.url} alt={file.name} />
                                ) : (
                                    <div className={styles.pdfIconLarge}>
                                        <FaFilePdf />
                                        <span>PDF</span>
                                    </div>
                                )}
                                <div className={styles.fileOverlay}>
                                    <button onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}><FaCopy /></button>
                                    {canDelete(file.url) && (
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(file.url); }}><FaTrash /></button>
                                    )}
                                </div>
                            </div>
                            <div className={styles.fileInfo} onClick={() => setPreviewFile(file)}>
                                <div className={styles.fileName}>{file.name}</div>
                                <div className={styles.fileMeta}>
                                    <span className={styles.sectionTag}>{file.type}</span>
                                    {file.isDuplicate && <span className={styles.dupBadge} style={{backgroundColor: '#ef4444', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '10px'}}>DUPLICADO</span>}
                                    {file.type === 'image' && (file.isOptimized ? 
                                        <span className={styles.optBadge} style={{backgroundColor: '#22c55e', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '10px'}}>WEB</span> :
                                        <span className={styles.optBadge} style={{backgroundColor: '#ef4444', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '10px'}}>NO-WEB</span>
                                    )}
                                    <span className={styles.fileSize}>{file.size}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {previewFile && (
                    <div className={styles.modalOverlay} onClick={() => setPreviewFile(null)}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h3>{previewFile.name}</h3>
                                <button className={styles.closeBtn} onClick={() => setPreviewFile(null)}>&times;</button>
                            </div>
                            <div className={styles.previewContainer}>
                                {previewFile.type === 'image' ? (
                                    <img src={previewFile.url} alt={previewFile.name} />
                                ) : (
                                    <div className={styles.pdfInfoView}>
                                        <FaFilePdf className={styles.bigPdfIcon} />
                                        <h4>Vista previa de PDF</h4>
                                        <p>Los archivos PDF no se pueden previsualizar directamente aquí. Puedes descargar el archivo original.</p>
                                        <a href={previewFile.url} target="_blank" rel="noreferrer" className={styles.openFullPdfBtn}>Abrir PDF en pestaña nueva</a>
                                    </div>
                                )}
                            </div>
                            <div className={styles.modalFooter} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                                <div className={styles.modalMeta} style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.9rem' }}>
                                    <span><strong>Subido por:</strong> {previewFile.uploader}</span>
                                    <span><strong>Sección:</strong> {previewFile.section}</span>
                                    <span><strong>Fecha:</strong> {new Date(previewFile.uploadDate).toLocaleDateString()}</span>
                                    <span><strong>Tamaño:</strong> {previewFile.size}</span>
                                    <span><strong>Optimizado (WebP):</strong> {previewFile.isOptimized ? 'Sí' : 'No'}</span>
                                    <span><strong>Duplicado:</strong> {previewFile.isDuplicate ? 'Sí' : 'No'}</span>
                                </div>
                                <div className={styles.modalActions} style={{ width: '100%', justifyContent: 'flex-end' }}>
                                    <button onClick={() => copyUrl(previewFile.url)}><FaCopy /> Copiar URL</button>
                                    <a href={previewFile.url} download className={styles.downloadLink}>Descargar</a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Multimedia;
