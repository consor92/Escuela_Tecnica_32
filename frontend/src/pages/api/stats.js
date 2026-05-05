import { readData, writeData } from '../../lib/dataLoader';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const filePath = path.resolve(process.cwd(), 'data', 'stats.json');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({ totalVisits: 0, lastVisits: [] }));
    }

    if (req.method === 'GET') {
        try {
            const stats = readData('stats.json');
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    } else if (req.method === 'POST') {
        try {
            const { isNewSession } = req.body;
            const stats = readData('stats.json');
            
            if (isNewSession) {
                stats.totalVisits = (stats.totalVisits || 0) + 1;
                const now = new Date();
                stats.lastVisits = stats.lastVisits || [];
                stats.lastVisits.unshift(now.toISOString());
                if (stats.lastVisits.length > 100) stats.lastVisits.pop();
            }

            writeData('stats.json', stats);
            res.status(200).json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar estadísticas' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
