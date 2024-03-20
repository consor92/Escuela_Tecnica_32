const mongoose = require('mongoose')

const { Schema } = mongoose


const OfAlumnosSchema = new Schema({
  novedad: { type: ObjectId, ref: 'Novedades', required: true },
  nombre:{type: String, required: true , trim: true},
  foto:{ type: String , require: false ,trim: true },
  descripcion:{type: String , require: true , trim: true},
  documento:{ Type:String , require:false , trim:true}
})

const OfAlumnos = mongoose.model('OfAlumnos', OfAlumnosSchema)

module.exports = OfAlumnos