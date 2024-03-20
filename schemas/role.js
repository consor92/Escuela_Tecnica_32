const mongoose = require('mongoose')

const { Schema } = mongoose

const roleSchema = new Schema({
  name: { type: String, required: true, lowercase: true, trim: true, unique: true },
})

const Role = mongoose.model('Role', roleSchema)

module.exports = Role