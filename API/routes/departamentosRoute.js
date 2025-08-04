const express = require('express')
const router = express.Router()

const Departamento = require('../schemas/departamento')

router.get('/', getAllDepartamentos)
router.post('/', agregarDepartamentos)
router.put('/:id', editarDepartamentos)
router.delete('/:id', desactivarDepartamentos)


async function getAllDepartamentos(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const departamento = await Departamento.find({})
        res.json(departamento)
    } catch (err) {
        next(err)
    }
}

async function agregarDepartamentos(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const { name, coordinador, isActive } = req.body;
        const nuevoDepartamento = new Departamento({ name, coordinador, isActive });
        await nuevoDepartamento.save();
        res.status(201).json(nuevoDepartamento);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function editarDepartamentos(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }
        
        const { name, coordinador, isActive } = req.body;
        const departamentoActualizado = await Departamento.findByIdAndUpdate(
            req.params.id,
            { name, coordinador, isActive },
            { new: true }
        ).populate('coordinador', 'nombre apellido email');

        if (!departamentoActualizado) return res.status(404).json({ message: 'Departamento no encontrado' });
        res.json(departamentoActualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function desactivarDepartamentos(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('No autorizado')
        }

        const { name, coordinador, isActive } = req.body;
        const nuevoDepartamento = new Departamento({ name, coordinador, isActive });
        await nuevoDepartamento.save();
        res.status(201).json(nuevoDepartamento);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = router