import { promises as fs } from 'fs';
import path from 'path';
import { addLog } from '../../../lib/dataLoader';

export default async function handler(req, res) {
  const dirs = [
    { path: path.join(process.cwd(), 'public', 'uploads'), prefix: '/uploads/' },
    { path: path.join(process.cwd(), 'public', 'docs'), prefix: '/docs/' },
    { path: path.join(process.cwd(), 'public', 'images'), prefix: '/images/' }
  ];

  const metadataPath = path.join(process.cwd(), 'data', 'file_metadata.json');

  if (req.method === 'GET') {
    // ... (sin cambios)
  }

  if (req.method === 'DELETE') {
    try {
      const { url, user } = req.query;
      if (!url) return res.status(400).json({ message: 'URL requerida' });

      // Ensure the url is safe and starts with one of the allowed prefixes
      const allowedPrefixes = ['/uploads/', '/docs/', '/images/'];
      if (!allowedPrefixes.some(p => url.startsWith(p))) {
          return res.status(400).json({ message: 'URL no permitida' });
      }

      const filePath = path.join(process.cwd(), 'public', url);
      await fs.unlink(filePath);

      try {
        const metaData = await fs.readFile(metadataPath, 'utf8');
        let metadata = JSON.parse(metaData);
        metadata = metadata.filter(m => m.url !== url);
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
      } catch (e) { }

      addLog(user, `Eliminó archivo: ${url}`, 'media');

      return res.status(200).json({ message: 'Archivo eliminado' });
    } catch (error) {
      return res.status(500).json({ message: 'Error al eliminar', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
