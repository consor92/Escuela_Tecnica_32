import React, { useState } from 'react';
import { FaTimes, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './ProfileModal.module.css';

const ChangePasswordModal = ({ onClose }) => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    const togglePass = (field) => setShowPass(prev => ({ ...prev, [field]: !prev[field] }));

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        
        if (passwords.new !== passwords.confirm) {
            setLoading(false);
            return setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
        }
        
        const email = localStorage.getItem('adminUserEmail');
        const currentHash = await hashPassword(passwords.current);
        const newHash = await hashPassword(passwords.new);

        try {
            const response = await fetch('/api/admin/updatePassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, currentHash, newHash })
            });

            const result = await response.json();
            
            if (response.ok) {
                localStorage.setItem('adminPasswordChangeRequired', 'false');
                setMessage({ text: 'Contraseña actualizada exitosamente', type: 'success' });
                setTimeout(() => {
                    onClose();
                }, 1000);
            } else {
                setMessage({ text: result.message || 'Error al actualizar', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Error de conexión con el servidor', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (field, label) => (
        <div style={{ width: '100%', marginBottom: '1rem', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input 
                    type={showPass[field] ? 'text' : 'password'} 
                    required 
                    disabled={loading} 
                    onChange={(e) => setPasswords({...passwords, [field]: e.target.value})} 
                    style={{ width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '10px', border: '1px solid var(--admin-border)' }}
                />
                <button type="button" onClick={() => togglePass(field)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--admin-text-light)' }}>
                    {showPass[field] ? <FaEyeSlash /> : <FaEye />}
                </button>
            </div>
        </div>
    );

    return (
        <div className={styles.modalOverlay} style={{ zIndex: 3000 }} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <header>
                    <h3><FaKey /> Cambiar Contraseña</h3>
                    <button onClick={onClose}><FaTimes /></button>
                </header>
                <form onSubmit={handleSubmit} className={styles.body}>
                    {message && <div style={{ padding: '0.8rem', borderRadius: '5px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', marginBottom: '1rem', width: '100%', textAlign: 'center', fontWeight: 'bold' }}>{message.text}</div>}
                    {renderInput('current', 'Contraseña Actual')}
                    {renderInput('new', 'Nueva Contraseña')}
                    {renderInput('confirm', 'Confirmar Nueva Contraseña')}
                    <button type="submit" className={styles.changePassBtn} disabled={loading} style={{ marginTop: '1rem' }}>
                        {loading ? 'Procesando...' : 'Actualizar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
