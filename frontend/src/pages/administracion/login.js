import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './login.module.css';
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const hashPassword = async (password) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const email = e.target[0].value;
        const pass = e.target[1].value;
        const hashedInput = await hashPassword(pass);

        try {
            const response = await fetch('/api/authData');
            const authData = await response.json();
            
            const user = authData.find(u => u.email === email && hashedInput === u.passwordHash);
            
            if (user) {
                try {
                    const ipResponse = await fetch('https://api.ipify.org?format=json');
                    const ipData = await ipResponse.json();
                    
                    await fetch('/api/updateUserAuth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            email, 
                            userAgent: navigator.userAgent, 
                            type: 'login',
                            ip: ipData.ip 
                        })
                    });
                } catch (error) {
                    console.error('Error updating user status:', error);
                }

                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminUserEmail', email);
                localStorage.setItem('adminSessionExpiry', new Date(Date.now() + 30 * 60000).toISOString());
                localStorage.setItem('adminPasswordChangeRequired', user.passwordChangeRequired ? 'true' : 'false');
                router.push('/administracion');
            } else {
                alert('Credenciales incorrectas');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error durante el proceso de login:', error);
            alert('Error al intentar iniciar sesión');
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <img src="/images/logoET32.png" alt="ET 32" />
                    <h1>Panel Administrativo</h1>
                    <p>Ingrese sus credenciales de administrador</p>
                </div>

                <form className={styles.loginForm} onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label>Email o Usuario</label>
                        <div className={styles.inputWrapper}>
                            <FaUser />
                            <input type="email" placeholder="usuario@bue.edu.ar" required />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Contraseña</label>
                        <div className={styles.inputWrapper}>
                            <FaLock />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                required 
                            />
                            <button 
                                type="button" 
                                className={styles.togglePass}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Iniciando Sesión...' : 'Entrar al Panel'}
                    </button>
                </form>

                <div className={styles.loginFooter}>
                    <p>© 2026 Escuela Técnica N° 32</p>
                    <a href="/">Volver a la Web Pública</a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
