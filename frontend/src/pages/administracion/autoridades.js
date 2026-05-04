import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './autoridades.module.css';
import { FaSave, FaUserEdit, FaImage, FaPlus, FaInfoCircle } from 'react-icons/fa';

const AutoridadesAdmin = () => {
    const [staff, setStaff] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetch('/api/autoridadesData')
            .then(res => res.json())
            .then(autoridadesData => {
                const flattenStaff = (node, list = []) => {
                    list.push({
                        id: node.role,
                        role: node.role,
                        name: node.name,
                        image: node.image,
                        description: node.description || "",
                        social: node.social || ""
                    });
                    if (node.children) {
                        node.children.forEach(child => flattenStaff(child, list));
                    }
                    return list;
                };
                setStaff(flattenStaff(autoridadesData));
            })
            .catch(err => console.error('Error cargando autoridades:', err));
    }, []);

    const handleStaffChange = (id, field, value) => {
        setStaff(staff.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleFileUpload = async (e, id) => {
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
                        type: 'autoridad'
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    setStaff(staff.map(s => s.id === id ? { ...s, image: data.url } : s));
                } else {
                    alert('Error: ' + data.message);
                }
                setIsUploading(false);
            };
        } catch (error) {
            alert('Error al subir imagen');
            setIsUploading(false);
        }
    };

    if (!staff) return <AdminLayout title="Gestión de Autoridades"><div className={styles.container}>Cargando...</div></AdminLayout>;

    return (
        <AdminLayout title="Gestión de Autoridades">
            <div className={styles.container}>
                <section className={styles.section}>
                    <div className={styles.infoBox}>
                        <p><strong>Nota:</strong> Los cargos y la jerarquía son fijos. Podés actualizar la información personal, foto y descripción de cada directivo.</p>
                    </div>
                    
                    <div className={styles.staffGrid}>
                        {staff.map((person) => (
                            <div key={person.id} className={styles.personCard}>
                                <div className={styles.personImageArea}>
                                    <div className={styles.avatarPreview}>
                                        <img src={person.image || '/images/logoET32.png'} alt={person.name} />
                                    </div>
                                    <label className={styles.miniUploadBtn}>
                                        <FaPlus /> Cambiar Foto
                                        <input type="file" hidden onChange={(e) => handleFileUpload(e, person.id)} />
                                    </label>
                                    <div className={styles.roleLabel}>{person.role}</div>
                                </div>
                                <div className={styles.personData}>
                                    <div className={styles.formGroup}>
                                        <label>Nombre Completo:</label>
                                        <input 
                                            type="text" 
                                            value={person.name} 
                                            onChange={(e) => handleStaffChange(person.id, 'name', e.target.value)} 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Link Red Social (LinkedIn/Instagram):</label>
                                        <input 
                                            type="text" 
                                            value={person.social} 
                                            placeholder="https://..."
                                            onChange={(e) => handleStaffChange(person.id, 'social', e.target.value)} 
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Descripción Informativa:</label>
                                        <textarea 
                                            value={person.description} 
                                            placeholder="Breve reseña profesional..."
                                            onChange={(e) => handleStaffChange(person.id, 'description', e.target.value)} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* BARRA FLOTANTE */}
                <div className={styles.floatingBar}>
                    <div className={styles.barInfo}>
                        <FaInfoCircle />
                        <p>Gestión de Autoridades: <strong>{staff.length} personas registradas</strong></p>
                    </div>
                    <div className={styles.barActions}>
                        <button className={styles.saveBtn} onClick={() => alert('¡Datos de autoridades guardados!')}>
                            <FaSave /> Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AutoridadesAdmin;