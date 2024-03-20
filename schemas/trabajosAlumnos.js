const mongoose = require('mongoose')

const { Schema } = mongoose

const TrabajosAlumnosSchema = new Schema({
  cliclo: {type: String , enum: Ciclo} ,
  año: { Type: Number , required: true },
  nombre:{type: String, required: true , trim: true},
  taller:{ type: Boolean , require: false ,trim: true },
  cant_horas:{type: Number , require: true , trim: true}
})

const TrabajosAlumnos = mongoose.model('TrabajosAlumnos', TrabajosAlumnosSchema)

module.exports = TrabajosAlumnos