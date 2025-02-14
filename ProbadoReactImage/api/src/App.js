const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Necesario para crear directorios
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Asegúrate de que el directorio 'uploads' exista
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Crea el directorio si no existe
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Usa el directorio 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nombre único para el archivo
  }
});

// Configuración de carga de archivos con límites y validaciones
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const mimeType = fileTypes.test(file.mimetype);
    const extName = fileTypes.test(file.originalname.toLowerCase());

    if (mimeType && extName) {
      return cb(null, true); // Permitir el archivo
    } else {
      cb(new Error('Solo se permiten archivos de imagen (jpg, jpeg, png).')); // Error si no es imagen
    }
  }
});

// Ruta de carga de archivo
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ error: "No se ha subido ninguna imagen." });
  }

  console.log("Archivo recibido:", req.file); // Verifica qué archivo llega
  res.status(200).send({
    message: "Imagen subida con éxito",
    file: req.file
  });
});


// Middleware para manejar los errores de multer y otros errores generales
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).send({ error: 'El archivo es demasiado grande. El límite es 5MB.' });
      default:
        return res.status(400).send({ error: `Error de carga de archivo: ${err.message}` });
    }
  } else if (err) {
    return res.status(400).send({ error: err.message });
  }

  next();
});

module.exports = app;
