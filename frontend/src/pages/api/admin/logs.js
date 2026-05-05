import { readData } from '../../../lib/dataLoader';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const filePath = path.resolve(process.cwd(), 'data', 'logs.json');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify([]));
            return res.status(200).json([]);
        }
        const logs = readData('logs.json');
        res.status(200).json(Array.isArray(logs) ? logs : []);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los logs' });
    }
}
