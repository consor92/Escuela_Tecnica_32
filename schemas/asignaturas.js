const mongoose = require('mongoose')

const { Schema } = mongoose
const Ciclo = ['Basico','Superior']

const AsignaturasSchema = new Schema({
  cliclo: {type: String , enum: Ciclo} ,
  año: { Type: Number , required: true },
  nombre:{type: String, required: true , trim: true},
  taller:{ type: Boolean , require: false ,trim: true },
  cant_horas:{type: Number , require: true , trim: true}
})

const Asignaturas = mongoose.model('Asignaturas', AsignaturasSchema)

module.exports = Asignaturas