const mongoose = require('mongoose')

const { Schema } = mongoose


const CalendarioSchema = new Schema({
  novedad: { type: ObjectId, ref: 'Novedades', required: true },
  titulo:{type: String, required: true , trim: true},
  fecha:{ type: Date},
  descripcion:{type: String , require: true , trim: true},
  url:{ Type:String , require:false , trim:true}
})

const Calendario = mongoose.model('Calendario', CalendarioSchema)

module.exports = Calendario