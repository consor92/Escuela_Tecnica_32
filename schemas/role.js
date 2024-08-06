const mongoose = require('mongoose')

const { Schema } = mongoose

const roleSchema = new Schema({
  name: { type: String, required: true, lowercase: true, trim: true, unique: true },
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
 * 
 * {
  "_id": "64f5e7b2a1e9d08d564c12f7",
  "name": "docente",
  "isActive": true,
  "description": "Role assigned to teachers responsible for educating students.",
  "permissions": {
    "read": true,
    "write": true,
    "delete": false,
    "update": false
  }

 */