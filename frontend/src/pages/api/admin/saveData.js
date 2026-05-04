import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fileName, data } = req.body;

  // Validación de seguridad básica: solo permitir archivos dentro de src/data/
  const allowedFiles = [
    'news.json',
    'cooperadora.json',
    'novedades_cooperadora.json',
    'disciplines.json',
    'calendar_events.json',
    'infraestructura.json',
    'config.json',
    'autoridades.json',
    'alumnos.json',
    'profesores.json',
    'auth.json'
  ];

  if (!allowedFiles.includes(fileName)) {
    return res.status(403).json({ message: 'Forbidden: Invalid file' });
  }

  const filePath = path.join(process.cwd(), 'data', fileName);

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
}
