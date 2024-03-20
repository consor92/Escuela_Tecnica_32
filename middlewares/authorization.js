function authorization(req, res, next) {
    req.isAdmin = function isAdmin() {
      return req.user && req.user.role === 'admin'
    }
  
    req.isMedico = function isMedico() {
      return req.user && req.user.role === 'medico'
    }
  
    req.isPaciente= function isPaciente() {
        return req.user && req.user.role === 'paciente'
      }

    return next(null)
  }
  
  module.exports = authorization