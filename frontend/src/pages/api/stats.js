import { readData, writeData } from '../../lib/dataLoader';

export default function handler(req, res) {
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
                stats.totalVisits += 1;
                
                // Registrar la hora de la visita para uso interno
                const now = new Date();
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
