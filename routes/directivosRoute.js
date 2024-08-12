const express = require('express')
const router = express.Router()

const Directivos = require('../schemas/directivos') // Asegúrate de que la ruta al esquema sea correcta

router.get('/', getAll)
router.get('/:id', getId)
router.post('/', insertDirectivos)
router.put('/:id', sustituirDirectivos)
router.patch('/:id', editDirectivos)
router.delete('/:id', deleteDirectivos)

async function getAll(req,res,next){
    try {
        const directivos = await Directivos.find({ isActive: true })
        res.json(directivos)
    } catch (err) {
        next(err)
    }
}

async function getId(req,res,next){
    try {
        const directivo = await Directivos.findOne({ _id: req.params.id, isActive: true })
        if (!directivo) {
            return res.status(404).json({ message: 'Directivo no encontrado' })
        }
        res.json(directivo)
    } catch (err) {
        next(err)
    }
}

async function insertDirectivos(req,res,next){
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized')
        }

        const directivo = req.body
        if (!directivo) {
            return res.status(400).send('No se proporcionaron datos')
        }

        const newDirectivo = new Directivos(directivo)
        await newDirectivo.save()
        res.status(201).json(newDirectivo)
    } catch (err) {
        next(err)
    }
}

async function sustituirDirectivos(req,res,next){
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized')
        }

        const updates = req.body
        if (!updates) {
            return res.status(400).send('No se proporcionaron datos')
        }

        const directivo = await Directivos.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            updates,
            { new: true, runValidators: true }
        )
        if (!directivo) {
            return res.status(404).json({ message: 'Directivo no encontrado o inactivo' })
        }
        res.json(directivo)
    } catch (err) {
        next(err)
    }
}

async function editDirectivos(req,res,next){
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized')
        }

        const updates = req.body
        if (!updates) {
            return res.status(400).send('No se proporcionaron datos')
        }

        const directivo = await Directivos.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            { $set: updates },
            { new: true, runValidators: true }
        )
        if (!directivo) {
            return res.status(404).json({ message: 'Directivo no encontrado o inactivo' })
        }
        res.json(directivo)
    } catch (err) {
        next(err)
    }
}

async function deleteDirectivos(req,res,next){
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized')
        }

        const directivo = await Directivos.findOneAndUpdate(
            { _id: req.params.id },
            { isActive: false },
            { new: true }
        )
        if (!directivo) {
            return res.status(404).json({ message: 'Directivo no encontrado' })
        }
        res.json({ message: 'Directivo desactivado exitosamente' })
    } catch (err) {
        next(err)
    }
}

module.exports = router


/**
 *
{
  "usuario": "60c72b2f9b1e8d6f7f3d0e9b",
  "cargo": "Rector"
}
 *
 */