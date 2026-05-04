import { readData } from '../../lib/dataLoader';

export default function handler(req, res) {
    const data = readData('novedades_cooperadora.json');
    res.status(200).json(data);
}