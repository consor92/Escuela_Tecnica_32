import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './administracion.module.css';

const CambiarPassword = () => {
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [message, setMessage] = useState(null);
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const router = useRouter();

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
        if (passwords.new !== passwords.confirm) return setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
        
        const email = localStorage.getItem('adminUserEmail');
        const currentHash = await hashPassword(passwords.current);
        const newHash = await hashPassword(passwords.new);

        const response = await fetch('/api/admin/updatePassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, currentHash, newHash })
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('adminPasswordChangeRequired', 'false');
            setMessage({ text: 'Contraseña actualizada exitosamente', type: 'success' });
            setTimeout(() => router.push('/administracion'), 2000);
        } else {
            setMessage({ text: result.message, type: 'error' });
        }
    };

    const renderInput = (field, label) => (
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.3rem' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <input 
                    type={showPass[field] ? 'text' : 'password'} 
                    required 
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
        <AdminLayout title="Cambiar Contraseña">
            <div className={styles.container} style={{ maxWidth: '500px', margin: '0 auto' }}>
                {message && <div style={{ padding: '1rem', marginBottom: '1rem', borderRadius: '10px', backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>{message.text}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--admin-card-bg)', padding: '2rem', borderRadius: '20px' }}>
                    {renderInput('current', 'Contraseña Actual')}
                    {renderInput('new', 'Nueva Contraseña')}
                    {renderInput('confirm', 'Confirmar Nueva Contraseña')}
                    <button type="submit" style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--admin-accent)', color: 'white', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>Actualizar Contraseña</button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default CambiarPassword;
