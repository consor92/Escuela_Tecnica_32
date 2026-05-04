import { readData, writeData } from '../../lib/dataLoader';

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, userAgent, type, ip } = req.body;
    const filename = 'auth.json';

    try {
        const users = readData(filename);

        const userIndex = users.findIndex(u => u.email === email);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found' });
        }

        const now = new Date().toLocaleString();

        if (type === 'login') {
            const expiryTime = new Date(Date.now() + 30 * 60000).toLocaleString(); // 30 minutos
            users[userIndex].lastLogin = now;
            users[userIndex].lastIp = ip || 'Desconocida';
            users[userIndex].browserInfo = userAgent;
            users[userIndex].sessionExpiry = expiryTime;
        } else if (type === 'logout') {
            users[userIndex].lastLogout = now;
        }

        writeData(filename, users);
        res.status(200).json({ message: 'User status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user data', error: error.message });
    }
}
