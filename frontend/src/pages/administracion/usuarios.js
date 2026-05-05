import React, { useState, useEffect } from 'react';
import AdminLayout from '../../Components/Admin/AdminLayout';
import styles from './usuarios.module.css';
import { FaUserPlus, FaUserShield, FaTrash, FaEdit, FaLock, FaInfoCircle, FaPlus } from 'react-icons/fa';
import { UserModal, RoleModal } from '../../Components/Admin/Modals/Modals';

const UsuariosAdmin = () => {
    const [users, setUsers] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetch('/api/admin/getData?fileName=auth.json')
            .then(res => res.json())
            .then(data => {
                setUsers(Array.isArray(data) ? data : []);
                const email = localStorage.getItem('adminUserEmail');
                const user = data.find(u => u.email === email);
                setCurrentUser(user);
            })
            .catch(err => {
                console.error(err);
                setUsers([]);
            });
    }, []);

    const canManageRoles = currentUser?.role === 'SuperAdmin';
    const filteredUsers = currentUser?.role === 'SuperAdmin' 
        ? users 
        : users.filter(u => u.role !== 'SuperAdmin');

    const saveUsers = (newUsers, customDescription) => {
        const adminEmail = localStorage.getItem('adminUserEmail') || 'Admin';
        setUsers(newUsers);
        fetch('/api/admin/saveData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                fileName: 'auth.json', 
                data: newUsers,
                user: adminEmail,
                description: customDescription || 'Actualizó la lista de usuarios'
            })
        });
    };

    const [showUserModal, setShowUserModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);

    // ... (sections definition)

    const deleteUser = (id) => {
        const userToDelete = users.find(u => u.id === id);
        if(confirm(`¿Seguro que querés eliminar el acceso de ${userToDelete?.email}?`)) {
            saveUsers(users.filter(u => u.id !== id), `Eliminó el acceso del usuario: ${userToDelete?.email}`);
        }
    };

    const changeUserRole = (id, newRole) => {
        const userToUpdate = users.find(u => u.id === id);
        const updatedUsers = users.map(u => u.id === id ? {...u, role: newRole} : u);
        saveUsers(updatedUsers, `Cambió el rol de ${userToUpdate.email} a ${newRole}`);
    };

    const handleCreateUser = (newUser) => {
        const updated = [...users, { ...newUser, id: Date.now(), lastLogin: 'Nunca', lastIp: 'N/A' }];
        saveUsers(updated, `Creó el usuario ${newUser.email} con el rol ${newUser.role}`);
        setShowUserModal(false);
    };

    const togglePrivilege = (role, section) => {
        const current = roles[role][section] || false;
        let next = 'view';
        if (current === 'view') next = 'edit-parc';
        if (current === 'edit-parc') next = 'edit';
        if (current === 'edit') next = false;

        setRoles({
            ...roles,
            [role]: { ...roles[role], [section]: next }
        });
    };

    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 2000);
    };

    const deleteRole = (roleName) => {
        if (roleName === 'SuperAdmin') return showNotification('No puedes borrar al SuperAdmin', 'error');
        if (confirm(`¿Seguro que querés eliminar el rol ${roleName}?`)) {
            const newRoles = { ...roles };
            delete newRoles[roleName];
            setRoles(newRoles);
            saveRoles(newRoles);
        }
    };

    const saveRoles = (newRoles) => {
        fetch('/api/admin/saveData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: 'config.json', data: { roles: newRoles } })
        }).then(() => showNotification('Roles actualizados correctamente', 'success'));
    };

    return (
        <AdminLayout title="Seguridad y Accesos">
            {showUserModal && <UserModal onClose={() => setShowUserModal(false)} onSave={(u) => saveUsers([...users, { ...u, id: Date.now(), lastLogin: 'Nunca', lastIp: 'N/A' }])} roles={roles} />}
            {showRoleModal && <RoleModal onClose={() => setShowRoleModal(false)} onSave={(name) => {
                const newRoles = { ...roles, [name]: {} };
                setRoles(newRoles);
                saveRoles(newRoles);
            }} />}
            
            <div className={styles.container}>
                <div className={styles.internalTabs}>
                    <button onClick={() => setActiveTab('usuarios')} className={activeTab === 'usuarios' ? styles.activeTab : ''}>Usuarios</button>
                    <button onClick={() => setActiveTab('privilegios')} className={activeTab === 'privilegios' ? styles.activeTab : ''}>Matriz de Permisos</button>
                </div>

                {activeTab === 'usuarios' ? (
                    <>
                        <div className={styles.header}>
                            <div className={styles.info}>
                                <h2>Usuarios del Panel</h2>
                                <p>Administrá quién puede entrar al panel y qué permisos tiene asignados.</p>
                            </div>
                            {canManageRoles && (
                                <button className={styles.addBtn} onClick={() => setShowUserModal(true)}>
                                    <FaUserPlus /> Crear Nuevo Usuario
                                </button>
                            )}
                        </div>

                        <div className={styles.tableCard}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Nombre Completo</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Último Ingreso</th>
                                        <th>IP / PC</th>
                                        {canManageRoles && <th>Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.firstName} {user.lastName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                {canManageRoles ? (
                                                    <select value={user.role} onChange={(e) => saveUsers(users.map(u => u.id === user.id ? {...u, role: e.target.value} : u))}>
                                                        {Object.keys(roles).map(r => <option key={r} value={r}>{r}</option>)}
                                                    </select>
                                                ) : user.role}
                                            </td>
                                            <td>{user.lastLogin}</td>
                                            <td>{user.lastIp}</td>
                                            {canManageRoles && (
                                                <td>
                                                    <div className={styles.actions}>
                                                        <button className={styles.deleteBtn} onClick={() => deleteUser(user.id)} title="Borrar Cuenta"><FaTrash /></button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : canManageRoles ? (
                    <div className={styles.privilegesArea}>
                        <div className={styles.header} style={{ marginBottom: '20px' }}>
                            <div>
                                <h2>Matriz de Permisos</h2>
                            </div>
                            <button className={styles.addBtn} onClick={() => setShowRoleModal(true)}><FaPlus /> Crear Rol</button>
                        </div>
                        {notification.message && (
                            <div style={{
                                position: 'fixed',
                                top: '80px',
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
                        <div className={styles.tableCard} style={{ overflowX: 'auto', width: '100%', minHeight: '600px' }}>
                            <table className={styles.privilegesTable}>
                                <thead>
                                    <tr>
                                        <th>Sección</th>
                                        {Object.keys(roles).map(role => (
                                            <th key={role}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                                    {role}
                                                    {role !== 'SuperAdmin' && (
                                                        <button onClick={() => deleteRole(role)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Borrar Rol"><FaTrash /></button>
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sections.map(sec => (
                                        <tr key={sec.id}>
                                            <td><strong>{sec.name}</strong></td>
                                            {Object.keys(roles).map(role => (
                                                <td key={role} style={{ textAlign: 'center', padding: '15px' }}>
                                                    {role === 'SuperAdmin' ? (
                                                        <FaUserShield style={{ color: '#ef4444' }} />
                                                    ) : (
                                                        <button 
                                                            className={roles[role][sec.id] ? styles[`priv_${roles[role][sec.id]}`] : styles.privOff}
                                                            onClick={() => togglePrivilege(role, sec.id)}
                                                        >
                                                            {roles[role][sec.id] ? roles[role][sec.id].toUpperCase() : 'BLOQUEADO'}
                                                        </button>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button 
                            className={styles.saveBtn} 
                            onClick={() => saveRoles(roles)} 
                            style={{ 
                                position: 'fixed', 
                                bottom: '30px', 
                                right: '30px', 
                                backgroundColor: '#ef4444', 
                                width: 'auto', 
                                padding: '1rem 2rem',
                                zIndex: 1000 
                            }}
                        >
                            Guardar Cambios
                        </button>
                    </div>
                ) : (
                    <div className={styles.tableCard} style={{ padding: '20px', textAlign: 'center' }}>
                        <p>No tenés permisos para acceder a la gestión de roles.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default UsuariosAdmin;
