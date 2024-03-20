const mongoose = require('mongoose')

const { Schema } = mongoose

const Cargos = ['Rector' ,' Vicerector', 'Regente Tecnico' , 'Regente Cultural' , 'Jefe de Taller' , 'Secretario' , 'ProSecretaria']

const directivosSchema = new Schema({
  usuario: { type: ObjectId, ref: 'User', required: true },
  cargo:{type: String, enum: Sectores , required: false}
})

const Directivos = mongoose.model('Directivos', directivosSchema)

module.exports = Directivos