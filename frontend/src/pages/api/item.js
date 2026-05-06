import { readData } from '../../lib/dataLoader';

export default function handler(req, res) {
    // Evitar caché
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const data = readData('disciplines.json');
    res.status(200).json(data);
}
