const { Router } = require('express')

const Prestador = require('../schemas/coberturas')

const router = new Router()

//  ----------  END POINT -----------

router.post('/', createCobertura)
router.get('/', getAll)


async function createCobertura(req, res, next) {
  console.log('Crear Cobertura Medica: ', req.body)

  const cobertura = req.body

  try {
    if (!cobertura) {
      res.status(404).send('Sin datos')
    }

    //const coverturaCreated = await Prestador.create({ ...cobertura })
    const coverturaCreated = await Prestador.insertMany(cobertura)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.error(error);
      });

    res.send(coverturaCreated)
  } catch (err) {
    next(err)
  }
}



async function getAll(req, res, next) {
  try {
    const cobertura = await Prestador.find()
    res.send(cobertura)
  } catch (err) {
    next(err)
  }
}


module.exports = router