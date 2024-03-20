const mongoose = require('mongoose');

const Schema = mongoose.Schema;



const coberturasSchema = new Schema({
  value: { type: String, required: true, lowercase: true, trim: true, unique: true },
  label: { type: String, required: true, lowercase: true, trim: true }
});

const Coberturas = mongoose.model('Coberturas', coberturasSchema);

module.exports = Coberturas;