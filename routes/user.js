const { Router } = require('express')
const bcrypt = require('bcrypt')

const User = require('../schemas/user')
const Role = require('../schemas/role')
const Agenda = require('../schemas/agenda')

const { route } = require('./turnos')

const router = new Router()
const propiedades = ['email', 'matricula', 'nombre', 'sanatorio', 'especialidad', 'descripcion', 'apellido', 'dni', 'role', 'nick', 'genero', 'password', 'HistoriaClinica', 'tel', 'pref', 'localidad', 'nacimiento', 'antecedentes', 'edad', 'genero', 'cobertura', 'saldo', 'numeroAfiliado'];

//  ----------  END POINT -----------
router.post('/register', (req, res, next) => createUser(req, res, next, 'paciente'))
router.post('/rol', createRol)                                                              // localhost:4000/user/rol                    -- POST (agrega un  nuevo rol de usuario )
router.get('/all', getAllUsers)                                                             // localhost:4000/user/all                    -- GET ( obtiene todos los usuario (admin-paciente-medico) )
router.get('/medicos', (req, res, next) => getUsersMedicos(req, res, next, 'medico'))       // localhost:4000/user/medicos                -- GET ( obtiene los usuarios que son medicos )
router.get('/pacientes', (req, res, next) => getUsersMedicos(req, res, next, 'paciente'))   // localhost:4000/user/pacientes              -- GET ( obtiene los usuarios que son pacientes )
// localhost:4000/register                    -- POST ( crea un nuevo usuario )
router.post('/medico/register', (req, res, next) => createUser(req, res, next, 'medico'))      // localhost:4000/medico/register             -- POST ( crea un nuevo medico )
router.get('/:id', datosDeUnPaciente)
router.patch('/:id', editarPaciente)
router.patch('/activate/:id', activeUser)
router.patch('/historia/:id', historiaClinica)


//---- POST ----
async function createRol(req, res, next) {
  console.log('createRol: ', req.body)

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

async function createUser(req, res, next, rol) {

  const user = req.body

  try {
    if (!req.isAdmin() && rol === 'medico') {
      return res.status(403).send('Unauthorized')
    }

    let roleQuery = { name: (user.rol === 'admin' || user.role === 'medico') ? 'paciente' : user.role }

    if (rol && rol.trim() !== '') {
      roleQuery = { name: rol.trim() };
    }

    const role = await Role.findOne(roleQuery);

    if (!role) {
      res.status(404).send('Role not found')
    }

    const passEncrypted = await bcrypt.hash(user.password, 10)

    console.log('createUser: ', { ...user, password: passEncrypted, role: role._id })
    const userCreated = await User.create({ ...user, password: passEncrypted, role: role._id })

    if( rol === 'medico')
    {
      const agendaCreated = await Agenda.create({ matricula: userCreated._id , descripcion: 'Sin descripcion' , tags:'Habilitada' , type:'success'})
    }


    res.send(userCreated)
  } catch (err) {
    next(err)
  }
}


//---- GETS ----
async function getAllUsers(req, res, next) {
  try {

    if ((!req.isAdmin() || !req.isMedico)) {
      return res.status(403).send('Unauthorized')
    }

    const users = await User.find({ isActive: true }).populate('role').populate({
      path: 'pref',
      model: 'Pais',
      select: 'pref',
    }).populate({
      path: 'especialidad',
      model: 'Especialidades',
      select: 'value'
    }).populate(
      {
        path: 'cobertura',
        model: 'Coberturas',
        select: 'value'
      }
    ).populate({
      path: 'sanatorio.localidades',
      model: 'Localidades',
    }).populate({
      path: 'localidad',
      model: 'Pais',
      options: { $slice: 1 }
    }).exec();

    res.send(users)
  } catch (err) {
    next(err)
  }
}

async function getUsersMedicos(req, res, next, rol) {
  try {

    if ((!req.isAdmin() || !req.isMedico)) {
      return res.status(403).send('Unauthorized')
    }

    const medicoRoleId = await Role.findOne({ name: rol }).select('_id');
    const users = await User.find({ isActive: true, role: medicoRoleId })
      .populate('role')
      .populate({
        path: 'pref',
        model: 'Pais',
        select: 'pref',
      }).populate({
        path: 'especialidad',
        model: 'Especialidades',
        select: 'value'
      }).populate(
        {
          path: 'cobertura',
          model: 'Coberturas',
          select: 'value'
        }
      ).populate({
        path: 'sanatorio',
        model: 'Pais',
        select: 'provincia'
      }).populate({
        path: 'localidad',
        model: 'Pais',
        select: 'provincia',
        options: { $slice: 1 }
      }).exec();

      const usersFormatted = users.map((user) => {
        // Clonar el objeto para no modificar el original
        const formattedUser = { ...user._doc };
        
        // Formatear la fecha de nacimiento
        formattedUser.nacimiento = new Date(formattedUser.nacimiento).toISOString().split('T')[0];
  
        return formattedUser;
      });

    res.send(usersFormatted)
  } catch (err) {
    next(err)
  }
}

async function datosDeUnPaciente(req, res, next) {
  try {

    const id = req.params;
    if (!id) {
      return res.status(400).json({ mensaje: 'Se requiere la matrícula del médico en los parámetros.' });
    }

    if ((!req.isAdmin() || !req.isMedico)) {
      return res.status(403).send('Unauthorized')
    }

    const users = await User.findById(id.id)
      .populate('role')
      .populate({
        path: 'pref',
        model: 'Pais',
        select: 'pref',
      }).populate({
        path: 'especialidad',
        model: 'Especialidades',
        select: 'value'
      }).populate(
        {
          path: 'cobertura',
          model: 'Coberturas',
          select: 'value'
        }
      ).populate({
        path: 'sanatorio.localidades',
        model: 'Localidades',
      }).populate({
        path: 'localidad',
        model: 'Pais',
        options: { $slice: 1 }
      }).exec();

    res.send(users)
  } catch (err) {
    next(err)
  }
}


//------ PATH  ---------
async function editarPaciente(req, res, next) {
  try {
    const id = req.params;
    const datos = req.body;

    // Verificar si se proporciona la matrícula del médico en los parámetros
    if (!id) {
      return res.status(400).json({ mensaje: 'Se requiere usuario en los parámetros.' });
    }


    // Verificar si la matrícula del médico existe en la base de datos
    const pacienteExistente = await User.findById(id.id);

    if (!pacienteExistente) {
      return res.status(404).json({ mensaje: 'Paciente no encontrado en la base de datos.' });
    }


    if (!(req.isAdmin() || (req.isPaciente() && pacienteExistente._id != req.user._id))) {
      return res.status(403).send('Unauthorized')
    }


    // Verificar si se proporciona las propiedad en el cuerpo de la solicitud
    if (!datos) {
      return res.status(400).json({ mensaje: 'Se requiere las propiedad en el cuerpo de la solicitud.' });
    }

    propiedades.forEach(propiedad => {
      datos[propiedad] = '';
    });

    const passEncrypted = (datos.password ? await bcrypt.hash(datos.password, 10) : '')

    // Actualizar la disponibilidad del usuario
    const medicoActualizado = await User.findOneAndUpdate(
      { _id: id.id },
      {
        password: passEncrypted,
        nombre: datos.nombre,
        apellido: datos.apellido,
        tel: datos.tel,
        pref: datos.pref,
        localidad: datos.localidad,
        sanatorio: datos.sanatorio,
        nacimiento: datos.nacimiento,
        edad: datos.edad,
        genero: datos.genero,
        especialidad: datos.especialidad,
        localidad: datos.localidad,
        cobertura: datos.cobertura
      }

    );

    res.status(200).send(medicoActualizado);

  } catch (error) {
    console.error(error); // Imprime el error en la consola para propósitos de depuración
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
    next();
  }
}

async function activeUser(req, res, next) {
  try {
    const id = req.params;
    const datos = req.body;

    // Verificar si se proporciona user en los parámetros
    if (!id) {
      return res.status(400).json({ mensaje: 'Se requiere usuario en los parámetros.' });
    }


    // Verificar si la matrícula del médico existe en la base de datos
    const usuarioExistente = await User.findById(id.id);

    if (!usuarioExistente) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado en la base de datos.' });
    }


    if (!(req.isAdmin() || usuarioExistente._id != req.user._id)) {
      return res.status(403).send('Unauthorized')
    }


    // Verificar si se proporciona las propiedad en el cuerpo de la solicitud
    if (!datos) {
      return res.status(400).json({ mensaje: 'Se requiere las propiedad en el cuerpo de la solicitud.' });
    }



    propiedades.forEach(propiedad => {
      datos[propiedad] = '';
    });

    // Actualizar la disponibilidad del usuario
    const medicoActualizado = await User.findOneAndUpdate(
      { _id: id.id },
      {
        isActive: datos.isActive
      }

    );

    res.status(200).send(medicoActualizado);

  } catch (error) {
    console.error(error); // Imprime el error en la consola para propósitos de depuración
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
    next();
  }
}

async function historiaClinica(req, res, next) {
  try {
    const id = req.params;
    const datos = req.body;

    // Verificar si se proporciona user en los parámetros
    if (!id) {
      return res.status(400).json({ mensaje: 'Se requiere usuario en los parámetros.' });
    }


    // Verificar si la matrícula del médico existe en la base de datos
    const usuarioExistente = await User.findById(id.id);

    if (!usuarioExistente) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado en la base de datos.' });
    }


    if (!(req.isAdmin() || req.isMedico)) {
      return res.status(403).send('Unauthorized')
    }


    // Verificar si se proporciona las propiedad en el cuerpo de la solicitud
    if (!datos) {
      return res.status(400).json({ mensaje: 'Se requiere las propiedad en el cuerpo de la solicitud.' });
    }


    propiedades.forEach(propiedad => {
      (propiedad !== 'antecedentes' && propiedad !== 'historiaClinica') ? datos[propiedad] = '' : ''
    });


    if (!datos.historiaClinica && !datos.antecedentes) {
      return res.status(400).json({ mensaje: 'Al menos una de las propiedades es requerida.' });
    }

    const actualizaciones = {};


    if (datos.antecedentes && datos.antecedentes.length > 0) {
      actualizaciones.$addToSet = {
        antecedentes: {
          $each: datos.antecedentes
        }
      };
    }

    if (datos.antecedentes && datos.antecedentes.length > 0) {
      actualizaciones.$set = {
        'antecedentes.$[elemento]': datos.antecedentes[0]
      };
      actualizaciones.arrayFilters = [{ 'elemento.area': { $eq: datos.antecedentes[0].area } }];
    }


    if (datos.historiaClinica && datos.historiaClinica.length > 0) {
      actualizaciones.$addToSet = {
        historiaClinica: {
          $each: datos.historiaClinica
        }
      };
    }

    if (datos.historiaClinica && datos.historiaClinica.length > 0) {
      actualizaciones.$set = {
        'historiaClinica.$[elemento]': datos.historiaClinica[0]
      };
      actualizaciones.arrayFilters = [{ 'elemento.profesional': { $eq: datos.historiaClinica[0].profesional } }];
    }

    // Actualizar la disponibilidad del usuario
    const pacienteActualizado = await User.findOneAndUpdate(
      { _id: id.id },
      actualizaciones,
      { new: true }
    );

    res.status(200).send(pacienteActualizado);

  } catch (error) {
    console.error(error); // Imprime el error en la consola para propósitos de depuración
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
    next();
  }
}

/*
.populate({
  path: 'localidad',
  populate: {
    path: 'provincia',
    model: 'Provincia',
    populate: {
      path: 'pais',
      model: 'Pais',
    },
  },
})
*/


module.exports = router