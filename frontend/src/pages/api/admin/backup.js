import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const dataDir = path.join(process.cwd(), 'data');

  if (req.method === 'GET') {
    try {
      const files = fs.readdirSync(dataDir);
      const fileData = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const filePath = path.join(dataDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            mtime: stats.mtime
          };
        });
      res.status(200).json(fileData);
    } catch (error) {
      res.status(500).json({ message: 'Error al listar archivos' });
    }
  } else if (req.method === 'POST') {
    // Descarga de archivo específico
    const { fileName } = req.body;
    const filePath = path.join(dataDir, fileName);

    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.status(200).send(fileContent);
    } else {
      res.status(404).json({ message: 'Archivo no encontrado' });
    }
  } else if (req.method === 'PUT') {
    // Restauración/Subida de archivo
    const { fileName, content } = req.body;
    if (!fileName.endsWith('.json')) {
        return res.status(400).json({ message: 'Solo se permiten archivos JSON' });
    }
    const filePath = path.join(dataDir, fileName);

    try {
        fs.writeFileSync(filePath, JSON.stringify(JSON.parse(content), null, 2), 'utf8');
        res.status(200).json({ message: 'Archivo restaurado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al restaurar archivo: ' + error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}