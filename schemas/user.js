const mongoose = require('mongoose')
const validate = require('mongoose-validator')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema
const { ObjectId } = Schema.Types
const emailValidator = validate({ validator: 'isEmail' })

const Sectores = ['Docente','Directivo','Secretaria','OfAlumnos','Coordinacion', 'DOE', 'Cooperadora','Jefe']


const userSchema = new Schema({
  email: {        type: String,    required: true,    unique: true,    lowercase: true,    trim: true,    validate: emailValidator,},
  password: {     type: String, required: true, select: false },
  role: {         type: ObjectId, ref: 'Role', required: true },
  nombre: {       type: String, required: true, lowercase: true, trim: true },
  apellido: {     type: String, required: true, lowercase: true, trim: true },
  area: { type: String, enum: Sectores , required: false},
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