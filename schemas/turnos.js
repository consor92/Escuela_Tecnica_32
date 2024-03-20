const mongoose = require('mongoose')
const validate = require('mongoose-validator')

const AutoIncrement = require('mongoose-sequence')(mongoose)

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

const Tipos = ['success','error','warning']


const turnosSchema = new Schema({
    idTurno: { type: Number, unique: true, trim: true },
    hora: { type: Date},
    consultorio: { type: Number},
    paciente: { type: ObjectId, ref: 'User'},
    type: { type:String , enum:Tipos}
})

const Turnos = mongoose.model('Turnos', turnosSchema)

module.exports = Turnos