const { Router } = require('express')

const bcrypt = require('bcrypt')
const User = require('../schemas/user')
const Role = require('../schemas/role')
const generateUserToken = require('../utils/generateToken')

const router = new Router()

router.post('/login', createUserToken)                                                                                  // localhost:4000/login                       -- POST ( pasa credenciales y devuelve TOKEN JWT )

//----- POST -----
async function createUserToken(req, res, next) {
    console.log(`Creando un nuevo TOKEN ${req.body.nick}`)

    if (!req.body.email) {
        if (!req.body.nick) {
            console.error('Nombre Usuario: VACIO')
            return res.status(400).end()
        }
    }

    if (!req.body.password) {
        console.error('Password: VACIO')
        return res.status(400).end()
    }

    try {
        const user = await User.findOne({ nick: req.body.nick }, '+password')

        if (!user) {
            const user = await User.findOne({ email: req.body.nick }, '+password')

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



module.exports = router