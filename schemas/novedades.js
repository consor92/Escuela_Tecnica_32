const mongoose = require('mongoose')
const validate = require('mongoose-validator')
const { trim } = require('validator')

const { Schema } = mongoose

// Validador para URL
const urlValidator = validate({
  validator: 'isURL',
  message: 'Debe ser una URL válida'
})

// Validador para Array de URLs
const arrayUrlValidator = [
  validate({
    validator: 'isURL',
    message: 'Debe ser una URL válida'
  })
]

// Validador para Array de Descripciones
const arrayDescriptionValidator = [
  validate({
    validator: 'isLength',
    arguments: [1, 1000], // Limita el tamaño máximo si es necesario
    message: 'La descripción no puede estar vacía y debe ser menor de 1000 caracteres'
  })
]

const novedadesSchema = new Schema({
  titulo: {
    type: String,
    required: true
  },
  descripcion: {
    type: [String],
    required: true,
    validate: arrayDescriptionValidator // Validación de descripciones
  },
  fotos: {
    type: [String],
    validate: arrayUrlValidator // Validación de URLs para fotos
  },
  foto_portada: {
    type: String,
    required: true,
    validate: urlValidator // Validación de URL para foto portada
  },
  fecha: {
    type: Date,
    default: Date.now // Valor por defecto es la fecha actual
  },
  fechaFin: {
    type: Date,
    default: Date.now, // Valor por defecto: la fecha y hora actuales
    require: false
  },
  url: {
    type: [String],
    validate: arrayUrlValidator // Validación de URLs
  },
  departamento: {
    type: Schema.Types.ObjectId,
    ref: 'Departamento',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true // Valor por defecto es verdadero (activo)
  },
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    populate: {
      path: 'autor',
      select: 'role' // Selecciona el rol del usuario
    }
  },
  tags:[{
    titulo: String
  }]
}, { 
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})

const Novedades = mongoose.model('Novedades', novedadesSchema)

module.exports = Novedades



/**
 * 
{
  "titulo": "Nueva Novedad en la Escuela",
  "descripcion": [
    "Descripción detallada de la nueva novedad en la escuela.",
    "Información adicional sobre la novedad."
  ],
  "fotos": [
    "https://example.com/foto1.jpg",
    "https://example.com/foto2.jpg"
  ],
  "foto_portada": "https://example.com/foto_portada.jpg",
  "fecha": "2024-08-05T12:00:00Z",
  "url": [
    "https://example.com/novedad",
    "https://example.com/mas_info"
  ],
  "departamento": "64c5a5e8c9a74b2f2e8b4568", // ID del departamento en formato ObjectId
  "isActive": true,
  "autor": "64c5a5e8c9a74b2f2e8b4567", // ID del usuario en formato ObjectId
  "tags": [
  "inauguración",
  "laboratorio",
  "ciencias"
  ]
}

 * 
 */