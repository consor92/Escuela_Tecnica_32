const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

const Role = require('../schemas/role')

async function generateUserToken(req, user) {
  const role = await Role.findById(user.role).exec()

  const payload = {
    _id: user._id,
    role: role.name,
  }

  const userResponse = {
    _id: user._id,
    role: role.name,
    email: user.email,
    nick: user.nick,
    name: (user.nombre + " " + user.apellido),
    matricula: user.matricula
  }

  /* eslint-disable-next-line no-undef */
  // const privateKey = fs.readFileSync(path.join(__dirname, `../keys/base-api-express-generator.pem`))

  // Unsecure alternative
  const token = jwt.sign(payload, 'key-publica', {
    subject: user._id.toString(),
    issuer: 'key-publica',
  })

  // const token = jwt.sign(payload, privateKey, {
  //   subject: user._id.toString(),
  //   issuer: 'base-api-express-generator',
  //   algorithm: 'RS256',
  // })

  return { token, user: userResponse }

}

module.exports = generateUserToken