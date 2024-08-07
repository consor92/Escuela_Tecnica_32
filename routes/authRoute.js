const { Router } = require('express')
const bcrypt = require('bcrypt')

const User = require('../schemas/user')
const Role = require('../schemas/role')
const generateUserToken = require('../utils/generateToken')

const router = new Router()

router.post('/login', createUserToken) 
router.patch('/' , createUser)
router.patch('/:role' , createRoles)

async function createUserToken(req, res, next) {
  console.log(`Creando un nuevo TOKEN ${req.body.username}`)

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
      name: user.role,
    }

    const role = await Role.findOne(roleQuery)

    if (!role) {
      res.status(404).send('Role not found')
    }

    const passEncrypted = await bcrypt.hash(user.password, 10)
    console.log('createUser: ', { ...user, password: passEncrypted, role: role._id })
    const userCreated = await User.create({ ...user, password: passEncrypted, role: role._id })


    res.send(userCreated)
  } catch (err) {
    next(err)
  }
}

async function createRoles(req, res, next) {
  const rol = req.body
  try {

    console.log('Role create: ', rol)
    const roleCreated = await Role.create( rol )

    res.status(201).send(roleCreated)
  } catch (err) {
    next(err)
  }
}
module.exports = router
