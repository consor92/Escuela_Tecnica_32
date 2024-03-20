const { Router } = require('express')

const Especialidades = require('../schemas/especialidades')

const router = new Router()

//  ----------  END POINT -----------

router.post('/' , createEspecialidad)
router.get('/' , getAll)


  async function createEspecialidad(req, res, next) {
    console.log('Crear Especialida: ', req.body)
  
    const especialida = req.body
  
    try {
      if (!especialida) {
        res.status(404).send('Sin datos')
      }
  
      const especialidadCreated = await Especialidades.create({ ...especialida })
    

      res.send(especialidadCreated)
    } catch (err) {
      next(err)
    }
  }  



  async function getAll(req, res, next) {
    try {
      const especialidades = await Especialidades.find()
      res.send(especialidades)
    } catch (err) {
      next(err)
    }
  }

  
module.exports = router