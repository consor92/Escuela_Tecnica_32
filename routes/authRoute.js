const { Router } = require('express')
const bcrypt = require('bcrypt')

const User = require('../schemas/user')
const Role = require('../schemas/role')
const generateUserToken = require('../utils/generateToken')

const router = new Router()

router.post('/login', createUserToken)
router.patch('/', createUser)
router.patch('/:role', createRoles)

async function createUserToken(req, res, next) {

  if (!req.body.email) {
    if (!req.body.username) {
      console.error('Nombre Usuario: VACIO')
      return res.status(400).end()
    }
  }

  if (!req.body.password) {
    console.error('Password: VACIO')
    return res.status(400).end()
  }



  try {
    const user = await User.findOne({ username: req.body.username }, '+password')

    if (!user) {
      const user = await User.findOne({ email: req.body.email }, '+password')

      if (!user) {
        console.error('Usuario: NO ENCONTRADO')
        return res.status(401).end()
      }
    }
    const result = await user.checkPassword(req.body.password)

    if (result.isLocked) {
      console.error('Usuario:  BLOQUEADO')
      return res.status(400).end()
    }

    if (!result.isOk) {
      console.error('Usuario:  DATOS ERRONEOS')
      return res.status(401).end()
    }
    console.log(`Creando un nuevo TOKEN ${req.body.username}`)
    const response = await generateUserToken(req, user)

    res.status(201).json(response)
  } catch (err) {
    next(err)
  }
}

async function createUser(req, res, next) {
  const user = req.body

  try {
    let roleQuery = {
      name: { $in: user.role },
    }

    const role = await Role.find(roleQuery)
    if (!role.length) {
      res.status(404).send('Role not found')
    }

    const roleIds = role.map(role => role._id)
    console.log(roleIds)
    const passEncrypted = await bcrypt.hash(user.password, 10)
    const userCreated = await User.create({ ...user, password: passEncrypted, roles: roleIds });

    res.send(userCreated)
  } catch (err) {
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ errors: validationErrors })
    }
    if (err.code && err.code === 11000) {
      return res.status(400).json({ error: 'Email ya está en uso' })
    }
    next(err)
  }
}

async function createRoles(req, res, next) {
  const rol = req.body
  try {

    console.log('Role create: ', rol)
    const roleCreated = await Role.create(rol)

    res.status(201).send(roleCreated)
  } catch (err) {
    next(err)
  }
}
module.exports = router
