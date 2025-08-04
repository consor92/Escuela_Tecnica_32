  const mongoose = require('mongoose')
  const validate = require('mongoose-validator')

  const { Schema } = mongoose
  const {ObjectId} = Schema.Types

  // Validador para URL
  const urlValidator = validate({
    validator: 'isURL',
    message: 'Debe ser una URL válida'
  })

  const OfAlumnosSchema = new Schema({
    novedad: {
      type: ObjectId,
      ref: 'Novedades',
      required: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    foto: {
      type: String,
      trim: true,
      validate: urlValidator // Validación de URL
    },
    descripcion: {
      type: String,
      required: true,
      trim: true
    },
    documento: {
      type: String,
      trim: true,
      validate: urlValidator // Validación de URL
    },
    fecha: {
      type: Date,
      default: Date.now // Valor por defecto es la fecha actual
    }, link: {
      type: String,
      trim: true,
      validate: urlValidator // Validación de URL
    },
    formularios: {
      type: String,
      trim: true,
      validate: urlValidator // Validación de URL
    },

    isActive: {
      type: Boolean,
      default: true // Valor por defecto es verdadero (activo)
    }
  }, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
  })

  const OfAlumnos = mongoose.model('OfAlumnos', OfAlumnosSchema)

  module.exports = OfAlumnos



  /**
   * 
   {
    "novedad": "64c5a5e8c9a74b2f2e8b4567", // ID del documento en formato ObjectId
    "nombre": "Inscripciones 2025",
    "foto": "https://example.com/foto-juan-perez",
    "descripcion": "Descripción breve sobre las inscripciones",
    "documento": "https://example.com/documento-juan-perez",
    "fecha": "2024-08-05T12:00:00Z",
    "link": "https://example.com/enlace-relacionado",
    "formularios": "https://example.com/formularios"
  }

  * 
  */