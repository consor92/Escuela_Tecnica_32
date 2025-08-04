const express = require('express')
const router = express.Router()

const Especialidades = require('../schemas/especialidades')

router.get('/', getAllEspecialidades)
router.get('/:id', getEspecialidadById)
router.post('/', createEspecialidad)
router.put('/:id', updateEspecialidad)
router.patch('/:id', patchEspecialidad)
router.delete('/:id', deactivateEspecialidad)
router.delete('/active/:id', activateEspecialidad)

async function getAllEspecialidades(req, res, next) {
    try {
        const especialidades = await Especialidades.find({ isActive: true })
        res.json(especialidades)
    } catch (err) {
        next(err)
    }
}

async function getEspecialidadById(req, res, next) {
    try {
        const especialidad = await Especialidades.findOne({ _id: req.params.id, isActive: true })
        if (!especialidad) {
            return res.status(404).json({ message: 'Especialidad no encontrada' })
        }
        res.json(especialidad)
    } catch (err) {
        next(err)
    }
}

async function createEspecialidad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const especialidadData = req.body
        if (!especialidadData) {
            return res.status(400).send('Datos no proporcionados')
        }

        const nuevaEspecialidad = new Especialidades(especialidadData)
        await nuevaEspecialidad.save()
        res.status(201).json(nuevaEspecialidad)
    } catch (err) {
        next(err)
    }
}

async function updateEspecialidad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const updates = req.body
        if (!updates) {
            return res.status(400).send('Datos no proporcionados')
        }

        const especialidad = await Especialidades.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            updates,
            { new: true, runValidators: true }
        )
        if (!especialidad) {
            return res.status(404).json({ message: 'Especialidad no encontrada o inactiva' })
        }
        res.json(especialidad)
    } catch (err) {
        next(err)
    }
}

async function patchEspecialidad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const updates = req.body
        if (!updates) {
            return res.status(400).send('Datos no proporcionados')
        }

        const especialidad = await Especialidades.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            { $set: updates },
            { new: true, runValidators: true }
        )
        if (!especialidad) {
            return res.status(404).json({ message: 'Especialidad no encontrada o inactiva' })
        }
        res.json(especialidad)
    } catch (err) {
        next(err)
    }
}

async function deactivateEspecialidad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const especialidad = await Especialidades.findOneAndUpdate(
            { _id: req.params.id },
            { isActive: false },
            { new: true }
        )
        if (!especialidad) {
            return res.status(404).json({ message: 'Especialidad no encontrada' })
        }
        res.json({ message: 'Especialidad desactivada correctamente' })
    } catch (err) {
        next(err)
    }
}

async function activateEspecialidad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const especialidad = await Especialidades.findOneAndUpdate(
            { _id: req.params.id },
            { isActive: true },
            { new: true }
        )
        if (!especialidad) {
            return res.status(404).json({ message: 'Especialidad no encontrada' })
        }
        res.json({ message: 'Especialidad activada correctamente' })
    } catch (err) {
        next(err)
    }
}

module.exports = router

/*
{
  "name": "ingeniería informática",
  "titulo": "Ingeniero en Informática",
  "duracion": 4,
  "resolucion": "1234/2023",
  "ciclo": "Superior",
  "descripcion": [
    "Este es un programa de cuatro años que cubre aspectos avanzados de la informática.",
    "El enfoque está en el desarrollo de software, redes y sistemas avanzados."
  ],
  "foto_portada": "https://example.com/portada.jpg",
  "fotos": [
    "https://example.com/foto1.jpg",
    "https://example.com/foto2.jpg"
  ],
  "planEstudio": [
    { "name": "60d5f9d5f7c8d79e74e3b8b0" },
    { "name": "60d5f9d5f7c8d79e74e3b8b1" }
  ],
  "turno": [
    "Manana",
    "Tarde"
  ]
}
*/
