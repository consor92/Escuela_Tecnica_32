const mongoose = require('mongoose')

const { Schema } = mongoose

const departamentoSchema = new Schema({
    name: { type: String, required: true, lowercase: true, trim: true, unique: true },
    coordinador: { type: ObjectId, ref: 'User', required: true, unique: true, trim: true } 
  })
  
  const Departamento = mongoose.model('Departamento', departamentoSchema)
  
  module.exports = Departamento