const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const localidadSchema = new Schema({
  name: { type: String, trim: true, required: true },
});


const paisSchema = new Schema({
  pais: { type: String, trim: true, required: true },
  provincia: { type: String, trim: true, required: true },
  pref: { type: String, trim: true, required: true },
  localidades: [localidadSchema],
});

const Localidades = mongoose.model('Localidades', localidadSchema);
const Pais = mongoose.model('Pais', paisSchema);

module.exports =  { Pais, Localidades };  