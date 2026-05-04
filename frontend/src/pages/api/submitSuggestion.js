import { readData, writeData } from '../../lib/dataLoader';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { email, message } = req.body;
        
        try {
            const suggestions = readData('sugerencias.json');
            
            const newSuggestion = {
                email,
                message,
                date: new Date().toISOString()
            };
            
            suggestions.push(newSuggestion);
            writeData('sugerencias.json', suggestions);
            
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error al guardar la sugerencia:', error);
            res.status(500).json({ error: 'Error al guardar la sugerencia' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
