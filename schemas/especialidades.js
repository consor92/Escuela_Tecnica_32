const mongoose = require('mongoose')
const validate = require('mongoose-validator')
const { Schema } = mongoose

// Validador de URL
const urlValidator = validate({
  validator: 'isURL',
  message: 'La URL {VALUE} no es válida.'
})

// Definición de ciclos y turnos
const Ciclo = ['Basico', 'Superior']
const Turnos = ['Manana', 'Tarde', 'Vespertino']

// Esquema de materias
const materiasSchema = new Schema({
  name: { type: Schema.Types.ObjectId, ref: 'Asignaturas' }
}, { _id: false })

const especialidadesSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true, 
    unique: true 
  },
  titulo: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true 
  },
  duracion: { 
    type: Number, 
    required: true 
  },
  resolucion: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true, 
    unique: true 
  },
  ciclo: { 
    type: String, 
    enum: Ciclo 
  },
  descripcion: { 
    type: [String], 
    required: true, 
    validate: {
      validator: function(v) {
        return v.every(desc => desc.length <= 300);
      },
      message: 'Cada descripción debe tener un máximo de 300 caracteres.'
    }
  },
  foto_portada: { 
    type: String, 
    required: true, 
    validate: urlValidator 
  },
  fotos: { 
    type: [String], 
    validate: {
      validator: function(v) {
        return v.every(url => urlValidator.validate(url));
      },
      message: 'Una o más URLs de fotos no son válidas.'
    }
  },
  planEstudio: [materiasSchema],
  turno: { 
    type: [String], 
    enum: Turnos 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true // Agrega campos createdAt y updatedAt automáticamente
})

const Especialidades = mongoose.model('Especialidades', especialidadesSchema)

module.exports = Especialidades


/**
 * 
{
  "name": "ingeniería informática",
  "titulo": "Ingeniero en Informática",
  "duracion": 4,
  "resolucion": "1234/2023",
  "ciclo": "Superior",
  "descripcion": [
    "Este es un programa de cuatro años que cubre aspectos avanzados de la informática.",
    "El enfoque está en el desarrollo de software, redes y sistemas avanzados."
  ],
  "foto_portada": "https://example.com/portada.jpg",
  "fotos": [
    "https://example.com/foto1.jpg",
    "https://example.com/foto2.jpg"
  ],
  "planEstudio": [
    { "name": "60d5f9d5f7c8d79e74e3b8b0" },  // ID de materia en Asignaturas
    { "name": "60d5f9d5f7c8d79e74e3b8b1" }   // Otro ID de materia
  ],
  "turno": [
    "Manana",
    "Tarde"
  ]
}



 */