const mongoose = require('mongoose')
const { Schema } = mongoose
const { ObjectId } = Schema.Types

const departamentoSchema = new Schema({
  name: { 
    type: String, 
    required: true, 
    lowercase: true, 
    trim: true, 
    unique: true 
  },
  coordinador: { 
    type: ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  isActive: { 
    type: Boolean, 
    default: true // Por defecto, un departamento está activo 
  }
}, { 
  timestamps: true // Agrega createdAt y updatedAt automáticamente
})

const Departamento = mongoose.model('Departamento', departamentoSchema)

module.exports = Departamento


/**
 * 
 {
  "name": "Departamento de Matemáticas",
  "coordinador": "64d71f4d8a8c3a3e5b9b6d4e", // ID de User
}

 * 
 */