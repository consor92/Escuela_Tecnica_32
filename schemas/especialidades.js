const mongoose = require('mongoose')

const { Schema } = mongoose

const Ciclo = ['Basico','Superior']
const Turnos = ['Manaña','Tarde','Vespertino']
const materias = new Schema({
    name: { type: ObjectId, ref: 'Asignaturas' },
  });

const especialidadesSchema = new Schema({
  name: { type: String, required: true, lowercase: true, trim: true, unique: true },
  titulo:{ type: String, required: true, lowercase: true, trim: true},
  duracion:{ type:Number , require: true },
  resolucion:{type: String, required: true, lowercase: true, trim: true, unique: true},
  ciclo:{ type: String , enum: Ciclo},
  descripcion_1:{type: String, required: true, lowercase: true, trim: true},
  descripcion_2:{type: String, required: true, lowercase: true, trim: true},
  foto_1:{type: String, required: true, lowercase: true, trim: true},
  foto_2:{type: String, required: true, lowercase: true, trim: true},
  foto_portada:{type: String, required: true, lowercase: true, trim: true},
  planEstudio:[materias],
  turno:{type: String, enum: Turnos}
})

const Especialidades = mongoose.model('Especialidades', especialidadesSchema)

module.exports = Especialidades