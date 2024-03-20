const mongoose = require('mongoose')

const { Schema } = mongoose

const novedadesSchema = new Schema({
    titulo: { type: String, required: true,  trim: true },
    descripcion:{type: String, required: true,  trim: true },
    foto_1:{ type:String , require: true , trim:true },
    foto_2:{type:String , require: false , trim:true },
    fecha:{type: Date},
    autor:{type: ObjectId, ref: 'User', required: true},
    url:{type:String , require: false , trim: true},
    departamento:{type: ObjectId, ref: 'Departamento', required: true}
})

const Novedades = mongoose.model('Novedades', novedadesSchema)

module.exports = Novedades