const express = require('express')
const router = express.Router()
const Novedades = require('../schemas/novedades')

// Obtener todas las novedades activas
router.get('/', getAllNovedades)

// Obtener una novedad por ID
router.get('/:id', getNovedadById)

// Crear una nueva novedad
router.post('/', createNovedad)

// Actualizar una novedad existente
router.put('/:id', updateNovedad)

// Editar parcialmente una novedad existente
router.patch('/:id', patchNovedad)

// Eliminar (desactivar) una novedad
router.delete('/:id', deactivateNovedad)

async function getAllNovedades(req, res, next) {
    try {
        const novedades = await Novedades.find({ isActive: true })
        res.json(novedades)
    } catch (err) {
        next(err)
    }
}

async function getNovedadById(req, res, next) {
    try {
        const novedad = await Novedades.findOne({ _id: req.params.id, isActive: true })
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad no encontrada' })
        }
        res.json(novedad)
    } catch (err) {
        next(err)
    }
}

async function createNovedad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const novedad = req.body
        if (!novedad) {
            return res.status(400).send('No se proporcionaron datos')
        }

        const nuevaNovedad = new Novedades(novedad)
        await nuevaNovedad.save()
        res.status(201).json(nuevaNovedad)
    } catch (err) {
        next(err)
    }
}

async function updateNovedad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const updates = req.body
        if (!updates) {
            return res.status(400).send('No se proporcionaron datos')
        }

        const novedad = await Novedades.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            updates,
            { new: true, runValidators: true }
        )
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad no encontrada o inactiva' })
        }
        res.json(novedad)
    } catch (err) {
        next(err)
    }
}

async function patchNovedad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const updates = req.body
        if (!updates) {
            return res.status(400).send('No se proporcionaron datos')
        }

        const novedad = await Novedades.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            { $set: updates },
            { new: true, runValidators: true }
        )
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad no encontrada o inactiva' })
        }
        res.json(novedad)
    } catch (err) {
        next(err)
    }
}

async function deactivateNovedad(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const novedad = await Novedades.findOneAndUpdate(
            { _id: req.params.id },
            { isActive: false },
            { new: true }
        )
        if (!novedad) {
            return res.status(404).json({ message: 'Novedad no encontrada' })
        }
        res.json({ message: 'Novedad desactivada exitosamente' })
    } catch (err) {
        next(err)
    }
}

module.exports = router

/*
{
  "titulo": "Nueva Novedad en la Escuela",
  "descripcion": [
    "Descripción detallada de la nueva novedad en la escuela.",
    "Información adicional sobre la novedad."
  ],
  "fotos": [
    "https://example.com/foto1.jpg",
    "https://example.com/foto2.jpg"
  ],
  "foto_portada": "https://example.com/foto_portada.jpg",
  "fecha": "2024-08-05T12:00:00Z",
  "url": [
    "https://example.com/novedad",
    "https://example.com/mas_info"
  ],
  "departamento": "64c5a5e8c9a74b2f2e8b4568", 
  "isActive": true,
  "autor": "64c5a5e8c9a74b2f2e8b4567", 
  "tags": [
    "inauguración",
    "laboratorio",
    "ciencias"
  ]
}
*/
