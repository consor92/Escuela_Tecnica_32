import { readData } from '../../lib/dataLoader';

export default function handler(req, res) {
    try {
        const data = readData('historia.json');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer la historia' });
    }
}
