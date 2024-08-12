const mongoose = require('mongoose');
const validate = require('mongoose-validator');
const bcrypt = require('bcrypt');

// Definición del esquema
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

// Validadores
const emailValidator = validate({ validator: 'isEmail' });
const ipValidator = validate({ validator: 'isIP' });
const usernameValidator = validate({ validator: 'isAlphanumeric' });
//const lengthValidator = validate({  validator: 'isLength',  arguments: [8, 16],  message: 'La contraseña debe tener entre 8 y 16 caracteres.'});
const lowercaseValidator = validate({  validator: function (v) {return /[a-z]/.test(v);}, message: 'La contraseña debe contener al menos una letra minúscula.'});
const uppercaseValidator = validate({ validator: function (v) {return /[A-Z]/.test(v);  },
  message: 'La contraseña debe contener al menos una letra mayúscula.'});
const numberValidator = validate({ validator: function (v) { return /\d/.test(v);},  message: 'La contraseña debe contener al menos un número.'});


// Turnos posibles
const Turnos = ['Mañana', 'Tarde', 'Vespertino'];

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: emailValidator,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: usernameValidator,
  },
  password: {
    type: String,
    required: true,
    select: false,
    validate: [
      //lengthValidator, //no responde el validador
      lowercaseValidator,
      uppercaseValidator,
      numberValidator
    ]
  },
  roles: [{ type: ObjectId, ref: 'Role', required: true }],
  nombre: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: props => 'El nombre debe ser texto.'
    }
  },
  apellido: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: props => 'El apellido debe ser texto.'
    }
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [300, 'La descripción no puede tener más de 300 caracteres.']
  },
  isActive: { type: Boolean, default: true },
  turnos: { type: [String], enum: Turnos, required: true },
  ip: {
    type: String,
    validate: ipValidator,
    required: false
  },
}, {
  timestamps: true // Agrega createdAt y updatedAt
});

/* Pre-hook para encriptar la contraseña antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10); // Incrementar el factor de costo para mayor seguridad
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});
*/

// Método para verificar la contraseña
userSchema.methods.checkPassword = async function (potentialPassword) {
  if (!potentialPassword) {
    return Promise.reject(new Error('Password is required'));
  }

  const isMatch = await bcrypt.compare( potentialPassword , this.password);
  console.log(isMatch)
  return { isOk: isMatch, isLocked: !this.isActive };
};

// Método para actualizar la IP
userSchema.methods.updateIp = function (req) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  this.ip = ip;
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;


/**
para que cargue la IP 
function loginUser(req, res) {
  const userId = req.user._id; // Suponiendo que tienes el ID del usuario después del inicio de sesión
  User.findById(userId).then(user => {
    user.updateIp(req)
      .then(() => res.status(200).send('User IP updated'))
      .catch(err => res.status(500).send(err.message));
  }).catch(err => res.status(500).send(err.message));
}


ROLES:
  'Docente',
  'Directivo',
  'Secretaria',
  'OfAlumnos',
  'Coordinacion',
  'DOE',
  'Cooperadora',
  'Jefe',


 {
  "_id": "64f5e7b2a1e9d08d564c12f3",
  "email": "juan.perez@example.com",
  "username": "juanperez",
  "password": "ContraSeña1234",  
  "roles": [
    "64f5e7b2a1e9d08d564c12f4",  // ID de rol para Docente
    "64f5e7b2a1e9d08d564c12f6"   // ID de rol para Coordinador
  ],
  "nombre": "Juan",
  "apellido": "Pérez",
  "descripcion": "Profesor de Matemáticas con más de 10 años de experiencia en la enseñanza.",
  "isActive": true,
  "turnos": ["Mañana", "Tarde"],  // Ejemplo de turnos en los que trabaja el usuario
  "ip": "192.168.1.100"
}

 */