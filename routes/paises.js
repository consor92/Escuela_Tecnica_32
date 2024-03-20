const { Router } = require('express')

const { Pais, Localidades } = require('../schemas/paises')

const router = new Router()

//  ----------  END POINT -----------

router.post('/' , createPais)
router.get('/' , getAll)


  async function createPais(req, res, next) {
    console.log('Crear Localidad: ', req.body)
  
    const localidad = req.body
  
    try {
      if (!localidad) {
        res.status(404).send('Sin datos')
      }
  
      //const paisCreated = await Pais.create({ ...localidad })
      const paisCreated = await Pais.insertMany( localidad )
      .then((result) => {
          console.log(result);
      })
      .catch((error) => {
          console.error(error);
      });
  
      res.send(paisCreated)
    } catch (err) {
      next(err)
    }
  }  



  async function getAll(req, res, next) {
    try {
      const localidad = await Pais.find()
      res.send(localidad)
    } catch (err) {
      next(err)
    }
  }

  
module.exports = router