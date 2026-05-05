import { readData } from '../../../lib/dataLoader';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const logs = readData('logs.json');
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los logs' });
    }
}
