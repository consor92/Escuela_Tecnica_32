function authorization(req, res, next) {
  req.isAdmin = function isAdmin() {
    return req.user && req.user.role === 'admin'
  }

  req.isRegente = function isRegente() {
    return req.user && req.user.role === 'regente'
  }

  req.isOfAlumnos = function isOfAlumnos() {
    return req.user && req.user.role === 'ofAlumnos'
  }

  req.isDocente = function isDocente() {
    return req.user && req.user.role === 'docente'
  }

  req.isRector = function isRector() {
    return req.user && req.user.role === 'rector'
  }

  req.isCoordinador = function isCoordinador() {
    return req.user && req.user.role === 'coordinador'
  }

  return next(null)
}

module.exports = authorization
