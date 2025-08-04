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

// Esquema de asignaturas involucradas
const asignaturasInvolucradasSchema = new Schema({
  name: { type: Schema.Types.ObjectId, ref: 'Asignaturas' }
}, { _id: false })

// Esquema de docentes involucrados
const docentesInvolucradosSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  nombreCompleto: { type: String }
}, { _id: false })

const TrabajosAlumnosSchema = new Schema({
  ciclo: { 
    type: String, 
    enum: Ciclo, 
    required: true 
  },
  año: { 
    type: Number, 
    required: true, 
    min: [1, 'El año debe estar entre 1 y 6'], 
    max: [6, 'El año debe estar entre 1 y 6'] 
  },
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
  },
  especialidad: { 
    type: Schema.Types.ObjectId,
    ref: 'Especialidades', // Referencia al esquema de especialidades
    required: function() { return this.ciclo !== 'Basico' }
  },
  division: { 
    type: Number, 
    required: true, 
    min: [1, 'La división debe estar entre 1 y 10'], 
    max: [10, 'La división debe estar entre 1 y 10'] 
  },
  fecha: { 
    type: Date, 
    required: true 
  },
  
  descripcion: { 
    type: [String], 
    required: true, 
    validate: {
      validator: function(v) {
        return v.every(desc => desc.length <= 1000); // Cada descripción debe tener hasta 300 caracteres
      },
      message: 'Cada descripción no puede tener más de 1000 caracteres.'
    }
  },
  asignaturasInvolucradas: [asignaturasInvolucradasSchema],
  docentesInvolucrados: {
    type: Schema.Types.Mixed, // Permite tanto un objeto con 'user' como un objeto con 'nombreCompleto'
    validate: {
      validator: function(v) {
        if (v.user && v.nombreCompleto) return false; // No puede tener ambos campos
        if (!v.user && !v.nombreCompleto) return false; // Debe tener al menos uno
        return true;
      },
      message: 'Debe proporcionar un usuario o un nombre completo, pero no ambos.'
    }
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
  videos: { 
    type: [String], 
    validate: {
      validator: function(v) {
        return v.every(url => urlValidator.validate(url));
      },
      message: 'Una o más URLs de videos no son válidas.'
    }
  },
  linkPortafolio: { 
    type: String, 
    validate: urlValidator
  },
  tags:[{
    titulo: String,
    trim: true
  }]
}, 
{ 
  timestamps: true // Agrega campos createdAt y updatedAt automáticamente
})

const TrabajosAlumnos = mongoose.model('TrabajosAlumnos', TrabajosAlumnosSchema)

module.exports = TrabajosAlumnos



/**
 * 

{
  "ciclo": "Superior",
  "año": 3,
  "nombre": "Proyecto de Investigación",
  "especialidad": "6404e5f44cda2c000f1a23c4",  // ID de especialidad en el formato ObjectId
  "division": 5,
  "fecha": "2024-08-01T00:00:00.000Z",
  "descripcion": [
    "Este proyecto involucra una investigación sobre nuevas técnicas de aprendizaje.",
    "Se realizaron varias pruebas y experimentos para validar los resultados."
  ],
  "asignaturasInvolucradas": [
    { "name": "60a6f9d5e2e8c0b5f76b3e1a" },  // ID de asignatura en el formato ObjectId
    { "name": "60a6f9d5e2e8c0b5f76b3e1b" }   // Otro ID de asignatura en el formato ObjectId
  ],
  "docentesInvolucrados": {
    "user": "60a6f9d5e2e8c0b5f76b3e1c"  // ID del usuario en el formato ObjectId
  },
  "fotos": [
    "https://example.com/foto1.jpg",
    "https://example.com/foto2.jpg"
  ],
  "videos": [
    "https://example.com/video1.mp4",
    "https://example.com/video2.mp4"
  ],
  "linkPortafolio": "https://example.com/portafolio",
  "timestamps": {
    "createdAt": "2024-08-01T00:00:00.000Z",
    "updatedAt": "2024-08-01T00:00:00.000Z"
  },
  "tags": [
  "inauguración",
  "laboratorio",
  "ciencias"
  ]  
}


  
 */