const { Router } = require('express')

const User = require('../schemas/user')

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


module.exports = router
