import fs from 'fs';
import path from 'path';
import { addLog } from '../../../lib/dataLoader';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fileName, data, user, description } = req.body;

  // ... (validación de archivos permitidos se mantiene igual)
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
    
    // Registrar log humanizado
    let action = description;
    
    if (!action) {
        // Fallback descriptivo si no viene descripción
        const sectionNames = {
            'news.json': 'Noticias',
            'disciplines.json': 'Especialidades',
            'alumnos.json': 'Espacio Alumnos',
            'profesores.json': 'Espacio Profesores',
            'config.json': 'Configuración General',
            'calendar_events.json': 'Calendario escolar',
            'autoridades.json': 'Autoridades',
            'infraestructura.json': 'Infraestructura',
            'novedades_cooperadora.json': 'Cooperadora'
        };
        const section = sectionNames[fileName] || fileName;
        action = `Actualizó información en ${section}`;
    }

    let type = 'system';
    if (fileName.includes('news')) type = 'news';
    if (fileName.includes('alumnos') || fileName.includes('profesores') || fileName.includes('disciplines')) type = 'doc';
    
    addLog(user, action, type);

    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
}
