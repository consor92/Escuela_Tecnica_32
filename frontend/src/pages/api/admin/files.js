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
    try {
      let allFiles = [];
      let metadata = [];

      try {
        const metaData = await fs.readFile(metadataPath, 'utf8');
        metadata = JSON.parse(metaData);
      } catch (e) { 
        metadata = []; 
      }

      for (const dir of dirs) {
        try {
          await fs.access(dir.path);
          const files = await fs.readdir(dir.path);
          
          for (const file of files) {
            if (file.startsWith('.')) continue;
            
            const stats = await fs.stat(path.join(dir.path, file));
            if (stats.isDirectory()) continue;

            const url = `${dir.prefix}${file}`;
            const meta = metadata.find(m => m.url === url) || {
              uploader: 'Desconocido',
              uploadDate: stats.birthtime,
              section: file.includes('_') ? file.split('_')[0] : 'legacy'
            };

            const isPDF = file.toLowerCase().endsWith('.pdf');
            const isImage = /\.(jpe?g|png|gif|webp|svg|ico)$/i.test(file);
            const isWebP = file.toLowerCase().endsWith('.webp');

            if (isPDF || isImage) {
              allFiles.push({
                ...meta,
                name: file,
                url: url,
                type: isPDF ? 'pdf' : 'image',
                isOptimized: isWebP,
                size: (stats.size / 1024).toFixed(1) + ' KB',
                stats: stats
              });
            }
          }
        } catch (e) { continue; }
      }

      return res.status(200).json(allFiles);
    } catch (error) {
      return res.status(500).json({ message: 'Error al leer archivos' });
    }
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
