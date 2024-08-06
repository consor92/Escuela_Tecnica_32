const { Router } = require('express')
const bcrypt = require('bcrypt')

const User = require('../schemas/user')
const Role = require('../schemas/role')

const router = new Router()

router.post('/register', (req, res, next) => createUser(req, res, next, 'paciente'))
router.post('/rol', createRol)

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

async function createUser(req, res, next, rol) {
  const user = req.body

  try {
    if (!req.isAdmin() && rol === 'medico') {
      return res.status(403).send('Unauthorized')
    }

    let roleQuery = {
      name: user.rol === 'admin' || user.role === 'medico' ? 'paciente' : user.role,
    }

    if (rol && rol.trim() !== '') {
      roleQuery = { name: rol.trim() }
    }

    const role = await Role.findOne(roleQuery)

    if (!role) {
      res.status(404).send('Role not found')
    }

    const passEncrypted = await bcrypt.hash(user.password, 10)

    console.log('createUser: ', { ...user, password: passEncrypted, role: role._id })
    const userCreated = await User.create({ ...user, password: passEncrypted, role: role._id })

    if (rol === 'medico') {
      const agendaCreated = await Agenda.create({
        matricula: userCreated._id,
        descripcion: 'Sin descripcion',
        tags: 'Habilitada',
        type: 'success',
      })
    }

    res.send(userCreated)
  } catch (err) {
    next(err)
  }
}

module.exports = router
