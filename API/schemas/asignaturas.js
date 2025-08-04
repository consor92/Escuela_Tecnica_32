const mongoose = require('mongoose')
const { Schema } = mongoose
const Ciclo = ['Basico', 'Superior']

const AsignaturasSchema = new Schema({
  ciclo: {
    type: String,
    enum: Ciclo,
    required: true
  },
  año: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  taller: {
    type: Boolean,
    default: false
  },
  cant_horas: {
    type: Number,
    required: true,
    min: 1
  },
  seccion_taller: {
    type: String, // Define el tipo según necesidades
    trim: true
  },
  especialidad: {
    type: Schema.Types.ObjectId,
    ref: 'Especialidades'
     },
  docente_aCargo: {
    type: Schema.Types.Mixed,
    required: false,
    validate: {
      validator: function(v) {
        if (v.user && v.nombreCompleto) return false; // No puede tener ambos campos
        if (!v.user && !v.nombreCompleto) return false; // Debe tener al menos uno
        return true;
      },
      message: 'Debe proporcionar un usuario o un nombre completo, pero no ambos.'
    }
  }
}, { 
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})

const Asignaturas = mongoose.model('Asignaturas', AsignaturasSchema)

module.exports = Asignaturas



/**
 * 
 {
  "ciclo": "Superior",
  "año": 3,
  "nombre": "Matemáticas Avanzadas",
  "taller": false,
  "cant_horas": 6,
  "especialidad": "64c5a5e8c9a74b2f2e8b4567", // ID del especialidad en formato ObjectId
  "docente_aCargo": {
    "user": "64c5a5e8c9a74b2f2e8b4567" // ID del usuario en formato ObjectId
  }
}
 * 
 */