const mongoose = require('mongoose')
const validate = require('mongoose-validator')
const { trim } = require('validator')

const { Schema } = mongoose

// Validador para URL
const urlValidator = validate({
  validator: 'isURL',
  message: 'Debe ser una URL válida'
})


const novedadesSchema = new Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.every(desc => typeof desc === 'string' && desc.length > 0 && desc.length <= 1000);
      },
      message: 'Cada descripción debe ser un string de entre 1 y 1000 caracteres.'
    }
  },
  fotos: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.every(url => require('validator').isURL(url));
      },
      message: 'Cada foto debe ser una URL válida.'
    }
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
    required: false
  },
  url: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.every(url => require('validator').isURL(url));
      },
      message: 'Cada URL debe ser válida.'
    }
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
    //populate: {
    //  path: 'autor',
    //  select: 'role' // Selecciona el rol del usuario
    //}
  },
  tags:[{
    type: String,
    trim: true
  }]
}, { 
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})


novedadesSchema.index({ titulo: 1 });
novedadesSchema.index({ departamento: 1 });
novedadesSchema.index({ tags: 1 });
novedadesSchema.index({ isActive: 1 });


novedadesSchema.pre(/^find/, function (next) {
  //this.populate({ path: 'autor', select: 'role' });
  
  next();
});

novedadesSchema.pre('save', function (next) {
  console.log('Guardando novedad:', this.titulo);
  next();
});

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