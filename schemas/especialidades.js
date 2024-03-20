const mongoose = require('mongoose');

const Schema = mongoose.Schema;



const especialidadesSchema = new Schema(
    {
        value: { type: String,  lowercase: true, trim: true }
    });

const Especialidades = mongoose.model('Especialidades', especialidadesSchema);

module.exports = Especialidades;