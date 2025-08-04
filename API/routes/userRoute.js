const { Router } = require('express')
const bcrypt = require('bcrypt');

const User = require('../schemas/user')

const router = new Router()

router.post('/registro', createUser)
router.post('/rol', createRol)
router.get('/viewAll', viewAll)
router.get('/view/:id', view)
router.get('/view/:id', view)
router.put('/editar/:id', edit)
//---- POST ----

async function createRol(req, res, next) {
  console.log('Creacion de nuevo rol: ', req.body)

  const user = req.body

  try {
    if (!req.isAdmin()) {
      return res.status(403).send('Unauthorized')
    }

    if (!user) {
      res.status(404).send('Sin datos')
    }

    const roleCreated = await User.create({ ...user })

    res.send(roleCreated)
  } catch (err) {
    next(err)
  }
}

async function createUser(req, res, next) {
  try {
    // Desestructuramos los campos recibidos
    const { email, username, password, roles, nombre, apellido, descripcion, turnos, ip } = req.body;

    // Validaciones de roles
    if (!roles || roles.length === 0) {
      return res.status(400).json({ message: 'Los roles son obligatorios.' });
    }

    /* Comprobar si el usuario o email ya existen
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail) {
      return res.status(400).json({ message: 'El email ya está registrado.' });
    }
    if (existingUsername) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
    }
    */

    // Encriptar la contraseña antes de guardar el usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo usuario
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      roles,
      nombre,
      apellido,
      descripcion,
      turnos
    });

    // Guardar el nuevo usuario
    await newUser.save();

    // Responder con éxito
    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        email: newUser.email,
        username: newUser.username,
        nombre: newUser.nombre,
        apellido: newUser.apellido,
      },
    });
  } catch (error) {
    next(error); // Maneja el error correctamente
  }
}

async function viewAll(req, res, next) {
  try {
    // Usamos populate para incluir los detalles de los roles relacionados
    const users = await User.find({})
      .populate('roles') // Poblamos los roles de cada usuario
      .exec();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios.' });
    }

    res.status(200).json(users); // Devuelve los usuarios con sus roles poblados
  } catch (error) {
    next(error); // Maneja cualquier error
  }
}

async function view(req, res, next) {
  try {
    const { id } = req.params;
    // Usamos populate para incluir los detalles de los roles relacionados
    const users = await User.findById(id)
      .populate('roles', 'name isActive -_id') // Poblar roles seleccionando solo 'name' y 'isActive', excluyendo '_id'
      .exec();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No se encontraron usuarios.' });
    }

    res.status(200).json(users); // Devuelve los usuarios con sus roles poblados
  } catch (error) {
    next(error); // Maneja cualquier error
  }
}

async function edit(req, res, next) {
  try {
    const { id } = req.params; // Obtener el ID del usuario desde los parámetros de la ruta
    const { email, username, nombre, apellido, descripcion, turnos, roles, isActive, ip } = req.body; // Campos a actualizar

    // Buscar el usuario por su ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Actualizar los campos del usuario
    user.email = email || user.email; // Si no se pasa un valor en el cuerpo de la solicitud, se deja el valor actual
    user.username = username || user.username;
    user.nombre = nombre || user.nombre;
    user.apellido = apellido || user.apellido;
    user.descripcion = descripcion || user.descripcion;
    user.turnos = turnos || user.turnos;
    user.roles = roles || user.roles; // Asegúrate de pasar un array de IDs válidos de roles
    user.isActive = isActive !== undefined ? isActive : user.isActive; // Para asegurar que se cambie correctamente
    user.ip = ip || user.ip; // No es obligatorio actualizar la IP si no se pasa en la solicitud

    // Guardar los cambios
    await user.save();

    // Responder con el usuario actualizado
    res.status(200).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      nombre: user.nombre,
      apellido: user.apellido,
      descripcion: user.descripcion,
      isActive: user.isActive,
      turnos: user.turnos,
      ip: user.ip,
      roles: user.roles, // Los roles pueden ser actualizados si es necesario
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });

  } catch (error) {
    next(error); // Manejo de errores
  }
}



module.exports = router
