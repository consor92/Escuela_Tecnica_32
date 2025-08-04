#!/usr/bin/env node
/* eslint-disable no-undef */

const jwt = require('jsonwebtoken')
//const fs = require('fs')
//const path = require('path')

const Role = require('../schemas/role');

async function generateUserToken(req, user) {
  //const role = await Role.findById(user.role).exec()

  const roles = await Role.find({ _id: { $in: user.roles } }).exec();
  if (!roles.length) {
    throw new Error('Roles no encontrados.');
  }

  const roleNames = roles.map(role => role.name);

  const payload = {
    _id: user._id,
    role: roleNames,
    email: user.email,
    nick: user.username,
    name: `${user.nombre} ${user.apellido}`
  }

  /* eslint-disable-next-line no-undef */
  // const privateKey = fs.readFileSync(path.join(__dirname, `../keys/base-api-express-generator.pem`))

  // Unsecure alternative
  const token = jwt.sign(payload, process.env.API_KEY_PUBLIC, {
    subject: user._id.toString(),
    issuer: process.env.API_KEY_PRIVATE,
  })

  // const token = jwt.sign(payload, privateKey, {
  //   subject: user._id.toString(),
  //   issuer: 'base-api-express-generator',
  //   algorithm: 'RS256',
  // })

  return { token }
}

module.exports = generateUserToken
