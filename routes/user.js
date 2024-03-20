const { Router } = require('express')
const bcrypt = require('bcrypt')

const User = require('../schemas/user')
const Role = require('../schemas/role')


const router = new Router()


module.exports = router