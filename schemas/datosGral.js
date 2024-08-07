const mongoose = require('mongoose')
const validate = require('mongoose-validator')

const { Schema } = mongoose

// Validadores
const urlValidator = validate({
  validator: 'isURL',
  message: 'Debe ser una URL válida'
})

const emailValidator = validate({
  validator: 'isEmail',
  message: 'Debe ser un correo electrónico válido'
})

const phoneValidator = validate({
  validator: 'isMobilePhone',
  message: 'Debe ser un número de teléfono válido'
})

const cuitValidator = validate({
  validator: 'isNumeric',
  arguments: { min: 11, max: 11 },
  message: 'Debe ser un CUIT válido de 11 dígitos'
})

const arrayUrlValidator = [
  validate({
    validator: 'isURL',
    message: 'Debe ser una URL válida'
  })
]

const generalSchema = new Schema({
  telefonos: {
    type: [String],
    validate: phoneValidator
  },
  radioVirtualUrl: {
    type: String,
    validate: urlValidator
  },
  emails: {
    type: [String],
    validate: emailValidator
  },
  direccion: {
    type: String,
    trim: true,
    required: true
  },
  googleMapUrl: {
    type: String,
    validate: urlValidator
  },
  redesSociales: [{
    nombre: {
      type: String,
      required: true
    },
    url: {
      type: String,
      validate: urlValidator
    }
  }],
  cooperadora: {
    cuota_anual: {
      type: Number,
      required: true
    },
    cuota_2_cuotas: {
      type: Number,
      required: true
    },
    beneficios: {
      type: String,
      required: true
    },
    horarios: [{
      dia: String,
      horario: String
    }],
    cuit: {
      type: String,
      validate: cuitValidator,
      required: true
    },
    email: {
      type: String,
      validate: emailValidator,
      required: true
    },
    alias: {
      type: String,
      required: true
    },
    titular: {
      type: String,
      required: true
    },
    cbu: {
      type: String,
      validate: validate({
        validator: 'isNumeric',
        arguments: { min: 22, max: 22 },
        message: 'Debe ser un CBU válido de 22 dígitos'
      }),
      required: true
    },
    cargos: [{
      cargo: String,
      nombre: String
    }],
    comisionRevisora: [{
      cargo: String,
      nombre: String
    }]
  }
}, {
  timestamps: true
})

const General = mongoose.model('General', generalSchema)

module.exports = General



/**
 * 
 {
  "telefonos": ["+541122233344", "+541199887766"],
  "radioVirtualUrl": "https://example.com/radio",
  "emails": ["contacto@example.com", "info@example.com"],
  "direccion": "Av. Siempre Viva 123, Springfield",
  "googleMapUrl": "https://maps.google.com/?q=Av.+Siempre+Viva+123",
  "redesSociales": [
    {
      "nombre": "Facebook",
      "url": "https://facebook.com/example"
    },
    {
      "nombre": "Twitter",
      "url": "https://twitter.com/example"
    }
  ],
  "cooperadora": {
    "cuota_anual": 1000,
    "cuota_2_cuotas": 500,
    "beneficios": "Beneficios para los miembros de la cooperadora.",
    "horarios": [
      {
        "dia": "Lunes",
        "horario": "9:00-12:00"
      },
      {
        "dia": "Miércoles",
        "horario": "14:00-17:00"
      }
    ],
    "cuit": "30711223344",
    "email": "cooperadora@example.com",
    "alias": "MiCooperadora",
    "titular": "Juan Pérez",

 * 
 */