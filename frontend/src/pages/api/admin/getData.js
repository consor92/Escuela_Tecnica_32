import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { fileName } = req.query;

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
    'auth.json',
    'sugerencias.json'
  ];

  if (!allowedFiles.includes(fileName)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const filePath = path.join(process.cwd(), 'data', fileName);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    res.status(200).json(JSON.parse(fileContent));
  } catch (error) {
    res.status(500).json({ message: 'Error reading file' });
  }
}
