const mongoose = require('mongoose')
const validate = require('mongoose-validator')

const { Schema } = mongoose

// Validador para URL
const urlValidator = validate({
  validator: 'isURL',
  message: 'Debe ser una URL válida'
})

const CalendarioSchema = new Schema({
  novedad: {
    type: Schema.Types.ObjectId,
    ref: 'Novedades',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  fecha: {
    type: Date,
    default: Date.now // Valor por defecto: la fecha y hora actuales
  },
  fechaFin: {
    type: Date,
    default: Date.now, // Valor por defecto: la fecha y hora actuales
    require: false
  },
  hora: {
    type: String, // Se puede almacenar como una cadena en formato HH:MM
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    trim: true,
    validate: urlValidator // Validación de URL
  },
  isActive: { type: Boolean, default: true },
  fechaImportante: { type: Boolean, default: false}
}, { 
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})

const Calendario = mongoose.model('Calendario', CalendarioSchema)

module.exports = Calendario

/**
 
{
  "novedad": "64c5a5e8c9a74b2f2e8b4567", // ID del documento en formato ObjectId
  "titulo": "Evento de Capacitación",
  "fecha": "2024-08-15", // Fecha en formato ISO 8601 (sin hora)
  "fechaFin": "2024-08-15",
  "hora": "10:00", // Hora en formato HH:MM
  "descripcion": "Capacitación para nuevos usuarios del sistema.",
  "url": "https://example.com/evento",
  "fechaImportante": true
}

 * 
 */