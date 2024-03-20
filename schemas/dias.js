const mongoose = require('mongoose')
const validate = require('mongoose-validator')

const AutoIncrement = require('mongoose-sequence')(mongoose)

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

const Tipos = ['success','error','warning']

const diasSchema = new Schema({
    idDia: { type: Number, unique: true, trim: true },
    fecha: { type: Date },
    descripcion: { type: String},
    type: { type: String , enum: Tipos},
    citas: { 
        id: [{type: String}]
    }
})

const Dias = mongoose.model('Dias', diasSchema)

module.exports = Dias