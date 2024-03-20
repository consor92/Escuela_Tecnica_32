const mongoose = require('mongoose')
const validate = require('mongoose-validator')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types

const agendSchema = new Schema({
    matricula: { type: ObjectId, ref: 'User', required: true, unique: true, trim: true },
    nombre: { type: String, trim: true },
    apellido: { type: String, trim: true },
    tags: { type: String, trim: true },
    descripcion: { type: String, trim: true },
    type: { type: String, trim: true },
    disponibilidad: {
        id_dias: [{ type: String }]
    }
})

const Agenda = mongoose.model('Agenda', agendSchema)

module.exports = Agenda