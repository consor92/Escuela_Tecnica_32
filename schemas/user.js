const mongoose = require('mongoose')
const validate = require('mongoose-validator')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types
const emailValidator = validate({ validator: 'isEmail' })

const Generos = ['Masculino','Femenino','Otro']


const userSchema = new Schema({
  email: {        type: String,    required: true,    unique: true,    lowercase: true,    trim: true,    validate: emailValidator,},
  matricula: {    type: Number, required: false, trim: true},
  dni:{           type: Number, required:true ,  unique: true },
  password: {     type: String, required: true, select: false },
  role: {         type: ObjectId, ref: 'Role', required: true },
  nombre: {       type: String, required: true, lowercase: true, trim: true },
  apellido: {     type: String, required: true, lowercase: true, trim: true },
  tel: {          type: String , required: true , trim: true },
  pref: {         type: ObjectId, ref: 'Pais' },
  nick: {         type: String , unique: true, required: true, trim: true},
  localidad: {    type: ObjectId, ref: 'Pais' },
  /*{    
    pais:{        type: ObjectId, ref: 'Pais' },
    recidencia:{   type: ObjectId, ref: 'Pais' }
  },*/
  sanatorio:{     type: ObjectId, ref: 'Pais', required: false},
  nacimiento: {   type: Date},
  edad: {         type: Number , trim: true },
  genero: {       type: String , enum: Generos },
  especialidad: { type: ObjectId, ref: 'Especialidades', required: false},
  descripcion: {  type: String , trim: true },
  antecedentes: {
    area: {             type: ObjectId, ref: 'Especialidades', required: false },
    año: {              type: Number, trim: true, required: false },
    info: {             type: String, trim: true, required: false }
  },
  cobertura: {          type: ObjectId, ref: 'Coberturas', required: false},
  numeroAfiliado: {     type: Number, ref: 'Coberturas', required: false},
  saldo: {              type: Number, ref: 'Coberturas', required: false},
  HistoriaClinica: {
    profesional: {      type: Number, required: false },
    fecha: {            type: Date },
    especialidad: {     type: String, trim: true, required: false },
    descripcion: {      type: String, trim: true, required: false }
  },
  isActive: {           type: Boolean, default: true }
})

//userSchema.index({ 'matricula': 1, 'email': 1, 'nick': 1 , 'dni' : 1}, { unique: true })
userSchema.index({ 'matricula': 1 }, { partialFilterExpression: { matricula: { $exists: true } } });

userSchema.method('checkPassword', async function checkPassword(potentialPassword) {
  if (!potentialPassword) {
    return Promise.reject(new Error('Password is required'))
  }

  const isMatch = await bcrypt.compare(potentialPassword, this.password)

  return { isOk: isMatch, isLocked: !this.isActive }
})


const User = mongoose.model('User', userSchema)

module.exports = User