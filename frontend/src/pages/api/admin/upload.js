import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { addLog } from '../../../lib/dataLoader';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { image, fileName, type, fileType, user } = req.body; // base64 data

    if (!image) {
      return res.status(400).json({ message: 'No data provided' });
    }

    // Limpiar el string base64
    const base64Data = image.replace(/^data:.*;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // Determinar carpeta y extensión según el tipo de archivo
    const isPDF = fileType === 'pdf' || fileName.toLowerCase().endsWith('.pdf');
    const targetSubDir = isPDF ? 'docs' : 'uploads';
    const uploadDir = path.join(process.cwd(), 'public', targetSubDir);
    
    // Asegurar que la carpeta existe
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generamos un ID corto y único
    const shortId = Math.random().toString(36).substring(2, 7);
    const nameWithoutExt = fileName.split('.').slice(0, -1).join('.')
      .toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    if (isPDF) {
      // Para PDF: SECCION_NOMBRE_ID.pdf
      const finalFileName = `${type}_${nameWithoutExt}_${shortId}.pdf`;
      const filePath = path.join(uploadDir, finalFileName);
      await fs.writeFile(filePath, buffer);
      
      try {
        await fs.chmod(filePath, 0o664);
      } catch (err) {
        console.error("Error fijando permisos PDF:", err);
      }
      
      const url = `/${targetSubDir}/${finalFileName}`;
      const newMeta = {
        url: url,
        uploader: user || 'Admin',
        uploadDate: new Date().toISOString(),
        section: type,
        isOptimized: false
      };
      await saveMetadata(newMeta);
      
      addLog(user, `Subió documento: ${finalFileName}`, 'doc');
      
      return res.status(200).json({ message: 'Documento subido correctamente', url: url });
    } else {
      // Para Imágenes: OPTIMIZACIÓN CON SHARP
      const finalFileName = `${type}_${shortId}.webp`;
      const filePath = path.join(uploadDir, finalFileName);

      await sharp(buffer)
        .resize(1200, null, { withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(filePath);
      
      try {
        await fs.chmod(filePath, 0o664);
      } catch (err) {
        console.error("Error fijando permisos imagen:", err);
      }

      const url = `/${targetSubDir}/${finalFileName}`;
      const newMeta = {
        url: url,
        uploader: user || 'Admin',
        uploadDate: new Date().toISOString(),
        section: type,
        isOptimized: true
      };
      await saveMetadata(newMeta);

      addLog(user, `Subió imagen: ${finalFileName}`, 'media');

      return res.status(200).json({ message: 'Imagen subida y optimizada', url: url });
    }
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ message: 'Error al procesar la imagen', error: error.message });
  }
}

async function saveMetadata(newMeta) {
  const metadataPath = path.join(process.cwd(), 'data', 'file_metadata.json');
  let metadata = [];
  try {
    const metaData = await fs.readFile(metadataPath, 'utf8');
    metadata = JSON.parse(metaData);
  } catch (e) { metadata = []; }
  metadata.push(newMeta);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}
