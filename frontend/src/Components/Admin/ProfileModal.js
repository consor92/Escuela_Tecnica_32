import React, { useState } from 'react';
import { FaTimes, FaUserShield, FaKey, FaSignOutAlt } from 'react-icons/fa';
import styles from './ProfileModal.module.css';
import ChangePasswordModal from './ChangePasswordModal';

const ProfileModal = ({ onClose, user, onLogout }) => {
    const [showChangePass, setShowChangePass] = useState(false);

    return (
        <>
            {showChangePass && <ChangePasswordModal onClose={() => setShowChangePass(false)} />}
            <div className={styles.modalOverlay} onClick={onClose}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <header>
                        <h3>Mi Perfil</h3>
                        <button onClick={onClose}><FaTimes /></button>
                    </header>
                    <div className={styles.body}>
                        <div className={styles.avatarLarge}>{user.email ? user.email[0].toUpperCase() : 'A'}</div>
                        <h2>{user.name}</h2>
                        <span className={styles.roleBadge}><FaUserShield /> {user.role}</span>
                        
                        <div className={styles.infoSection}>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Permisos activos:</strong> Gestión de Noticias, Especialidades, Multimedia.</p>
                        </div>

                        <button className={styles.changePassBtn} onClick={() => setShowChangePass(true)}><FaKey /> Cambiar Contraseña</button>
                        <button className={styles.logoutBtn} onClick={onLogout}><FaSignOutAlt /> Cerrar Sesión</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileModal;
