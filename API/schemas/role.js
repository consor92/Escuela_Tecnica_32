const mongoose = require('mongoose')

const { Schema } = mongoose

const roleSchema = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
    trim: true, 
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

const Role = mongoose.model('Role', roleSchema)

module.exports = Role


/**
 * 
 * ROLES:
  'Docente',
  'Directivo',
  'Secretaria',
  'OfAlumnos',
  'Coordinacion',
  'DOE',
  'Cooperadora',
  'Jefe',
  'Admin'
 * 
 * {
  "_id": "64f5e7b2a1e9d08d564c12f7",
  "name": "docente",
  "isActive": true
  }
 */