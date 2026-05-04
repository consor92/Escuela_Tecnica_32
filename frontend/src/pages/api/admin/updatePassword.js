import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, currentHash, newHash } = req.body;
    const authPath = path.join(process.cwd(), 'src', 'data', 'auth.json');

    try {
        const fileData = fs.readFileSync(authPath, 'utf8');
        const users = JSON.parse(fileData);

        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verificar la contraseña actual
        if (users[userIndex].passwordHash !== currentHash) {
            return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
        }

        // Actualizar la contraseña
        users[userIndex].passwordHash = newHash;
        users[userIndex].passwordChangeRequired = false;

        fs.writeFileSync(authPath, JSON.stringify(users, null, 2));
        res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}
