import React, { useState } from 'react';
import { FaTimes, FaSave, FaUserPlus, FaUserTag } from 'react-icons/fa';
import styles from './usuarios.module.css';

export const UserModal = ({ onClose, onSave, roles }) => {
    const availableRoles = Object.keys(roles).filter(r => r !== 'SuperAdmin');
    const [userData, setUserData] = useState({ firstName: '', lastName: '', email: '', role: availableRoles[0] || '' });

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleSave = async () => {
        const passwordHash = await hashPassword(userData.email);
        onSave({ 
            ...userData, 
            passwordHash, 
            passwordChangeRequired: true 
        });
        onClose();
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <header><h3>Crear Usuario</h3><button onClick={onClose}><FaTimes /></button></header>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}><label>Nombre:</label><input type="text" onChange={(e) => setUserData({...userData, firstName: e.target.value})} /></div>
                    <div className={styles.formGroup}><label>Apellido:</label><input type="text" onChange={(e) => setUserData({...userData, lastName: e.target.value})} /></div>
                    <div className={styles.formGroup}><label>Email:</label><input type="email" onChange={(e) => setUserData({...userData, email: e.target.value})} /></div>
                    <div className={styles.formGroup}><label>Rol:</label><select onChange={(e) => setUserData({...userData, role: e.target.value})}>{Object.keys(roles).filter(r => r !== 'SuperAdmin').map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                </div>
                <footer><button className={styles.saveBtn} onClick={handleSave}>Crear Usuario</button></footer>
            </div>
        </div>
    );
};

export const RoleModal = ({ onClose, onSave }) => {
    const [roleName, setRoleName] = useState('');
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <header><h3>Crear Nuevo Rol</h3><button onClick={onClose}><FaTimes /></button></header>
                <div className={styles.modalBody}>
                    <div className={styles.formGroup}><label>Nombre del Rol:</label><input type="text" onChange={(e) => setRoleName(e.target.value)} /></div>
                </div>
                <footer><button className={styles.saveBtn} onClick={() => { onSave(roleName); onClose(); }}>Crear Rol</button></footer>
            </div>
        </div>
    );
};
