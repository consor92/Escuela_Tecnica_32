import { readData } from '../../lib/dataLoader';

export default function handler(req, res) {
    const data = readData('news.json');
    res.status(200).json(data);
}
