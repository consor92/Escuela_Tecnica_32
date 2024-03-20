const mongoose = require('mongoose')
const validate = require('mongoose-validator')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types
const emailValidator = validate({ validator: 'isEmail' })

const Generos = ['Masculino','Femenino','Otro']


const userSchema = new Schema({
    email: {        type: String,    required: true,    unique: true,    lowercase: true,    trim: true,    validate: emailValidator,},
    dni:{           type: Number, required:true ,  unique: true },
  password: {     type: String, required: true, select: false },
  role: {         type: ObjectId, ref: 'Role', required: true },
  nombre: {       type: String, required: true, lowercase: true, trim: true },
  apellido: {     type: String, required: true, lowercase: true, trim: true },
  tel: {          type: String , required: true , trim: true },
  nick: {         type: String , unique: true, required: true, trim: true},
  localidad: {    type: ObjectId, ref: 'Pais' },
  nacimiento: {   type: Date},
  edad: {         type: Number , trim: true },
  genero: {       type: String , enum: Generos },
  especialidad: { type: ObjectId, ref: 'Especialidades', required: false},
  descripcion: {  type: String , trim: true },
  isActive: {           type: Boolean, default: true }
})


userSchema.method('checkPassword', async function checkPassword(potentialPassword) {
    if (!potentialPassword) {
      return Promise.reject(new Error('Password is required'))
    }
  
    const isMatch = await bcrypt.compare(potentialPassword, this.password)
  
    return { isOk: isMatch, isLocked: !this.isActive }
  })

  
const User = mongoose.model('User', userSchema)

module.exports = User