import { readData } from '../../lib/dataLoader';

export default function handler(req, res) {
    try {
        const config = readData('config.json');
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer la configuración' });
    }
}
