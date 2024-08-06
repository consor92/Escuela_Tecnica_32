const mongoose = require('mongoose')

const { Schema } = mongoose

// Lista de cargos posibles
const Cargos = [
  'Rector',
  'Vicerector',
  'Regente Técnico',
  'Regente Cultural',
  'Jefe de Taller',
  'Secretario',
  'ProSecretaria',
  'Asesor Pedagógico',
  'Jefe de Preceptores',
  'Supervisora del Área'
]

const directivosSchema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  cargo: { type: String, enum: Cargos, required: true, unique: true }, // Un cargo por usuario
  isActive: { type: Boolean, default: true }, // Campo para indicar si el directivo está activo
  createdAt: { type: Date, default: Date.now }, // Marca de tiempo para la creación
  updatedAt: { type: Date, default: Date.now } // Marca de tiempo para la última actualización
}, { timestamps: true }) // Agrega timestamps automáticos

// Pre-validación para asegurar que un usuario no tenga más de un cargo
directivosSchema.pre('save', async function (next) {
  const directivo = this;
  
  // Buscar si el usuario ya tiene un cargo asignado
  const existingDirectivo = await mongoose.model('Directivos').findOne({ usuario: directivo.usuario });

  if (existingDirectivo && existingDirectivo._id.toString() !== directivo._id.toString()) {
    return next(new Error('Un usuario no puede tener más de un cargo'));
  }

  next();
});

// Agregar índices para asegurar la unicidad del cargo
directivosSchema.index({ usuario: 1 }, { unique: true });

const Directivos = mongoose.model('Directivos', directivosSchema)

module.exports = Directivos

/**
 *
{
  "usuario": "60c72b2f9b1e8d6f7f3d0e9b", // ID del usuario (ObjectId) referenciado en la colección User
  "cargo": "Rector" // Cargo asignado al usuario
}

 */
