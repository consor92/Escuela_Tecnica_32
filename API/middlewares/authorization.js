function authorization(req, res, next) {
  function hasRole(role) {
    return req.user && req.user.role && req.user.role.some(r => r.toString() === role.toString());
  }

  req.isAdmin = function isAdmin() {
    return hasRole('admin');
  };

  req.isRegente = function isRegente() {
    return hasRole('regente');
  };

  req.isOfAlumnos = function isOfAlumnos() {
    return hasRole('ofAlumnos');
  };

  req.isDocente = function isDocente() {
    return hasRole('docente');
  };

  req.isRector = function isRector() {
    return hasRole('rector');
  };

  req.isCoordinador = function isCoordinador() {
    return hasRole('coordinador');
  };
  next();
}

module.exports = authorization;
