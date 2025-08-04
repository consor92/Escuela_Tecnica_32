const express = require('express')
const router = express.Router()

const OfAlumnos = require('../schemas/OfAlumnos')

router.get('/', getAllActiveOfAlumnos)
router.get('/:id', getOfAlumnoById)
router.post('/', createOfAlumno)
router.put('/:id', updateOfAlumno)
router.patch('/:id', partialUpdateOfAlumno)
router.delete('/:id', deactivateOfAlumno)


async function getAllActiveOfAlumnos(req, res, next) {
    try {
        const ofAlumnos = await OfAlumnos.find({ isActive: true }) // Solo activos
        if (!ofAlumnos.length) {
            return res.status(404).json({ message: 'No active entries found' })
        }
        res.json(ofAlumnos)
    } catch (err) {
        next(err)
    }
}

async function getOfAlumnoById(req, res, next) {
    try {
        const ofAlumno = await OfAlumnos.findOne({ _id: req.params.id, isActive: true })
        if (!ofAlumno) {
            return res.status(404).json({ message: 'Entry not found' })
        }
        res.json(ofAlumno)
    } catch (err) {
        next(err)
    }
}

async function createOfAlumno(req, res, next) {
    try {

        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized')
        }

        const ofAlumno = req.body
        if (!ofAlumno) {
            return res.status(400).send('No data provided')
        }

        const newOfAlumno = new OfAlumnos(ofAlumno)
        await newOfAlumno.save()
        res.status(201).json(newOfAlumno)
    } catch (err) {
        next(err)
    }
}

async function updateOfAlumno(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized')
        }

        const updates = req.body
        if (!updates) {
            return res.status(400).send('No data provided')
        }

        const ofAlumno = await OfAlumnos.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            updates,
            { new: true, runValidators: true }
        )
        if (!ofAlumno) {
            return res.status(404).json({ message: 'Entry not found or inactive' })
        }
        res.json(ofAlumno)
    } catch (err) {
        next(err)
    }
}

async function partialUpdateOfAlumno(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized')
        }

        const updates = req.body
        if (!updates) {
            return res.status(400).send('No data provided')
        }

        const ofAlumno = await OfAlumnos.findOneAndUpdate(
            { _id: req.params.id, isActive: true },
            { $set: updates },
            { new: true, runValidators: true }
        )
        if (!ofAlumno) {
            return res.status(404).json({ message: 'Entry not found or inactive' })
        }
        res.json(ofAlumno)
    } catch (err) {
        next(err)
    }
}

async function deactivateOfAlumno(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized')
        }

        const ofAlumno = await OfAlumnos.findOneAndUpdate(
            { _id: req.params.id },
            { isActive: false },
            { new: true }
        )
        if (!ofAlumno) {
            return res.status(404).json({ message: 'Entry not found' })
        }
        res.json({ message: 'Entry deactivated successfully' })
    } catch (err) {
        next(err)
    }
}

module.exports = router
