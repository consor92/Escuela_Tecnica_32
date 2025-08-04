const express = require('express');
const router = express.Router();

const Asignaturas = require('../schemas/asignaturas'); // Asegúrate de que la ruta al esquema sea correcta
const Especialidades = require('../schemas/especialidades'); // Importar el esquema de Especialidades

// Endpoints básicos
router.get('/', getAll);
router.get('/:id', getId);
router.get('/especialidad/:especialidadName', getByEspecialidad); // Actualizado para recibir nombre de la especialidad
router.get('/especialidad/:especialidadName/anio/:anio', getByEspecialidadYPorAño); // Actualizado para recibir especialidad y año
router.post('/', insertAsignatura);
router.put('/:id', sustituirAsignatura);
router.patch('/:id', editAsignatura);
router.delete('/:id', desactivarAsignatura); // Actualizado para desactivar
router.delete('/:id/activar', activarAsignatura); // Actualizado para ser un DELETE pero mantiene su función

// Obtener todas las asignaturas
async function getAll(req, res, next) {
    try {
        const asignaturas = await Asignaturas.find({}).populate('especialidad');
        res.json(asignaturas);
    } catch (err) {
        next(err);
    }
}

// Obtener asignatura por ID
async function getId(req, res, next) {
    try {
        const asignatura = await Asignaturas.findById(req.params.id).populate('especialidad');
        if (!asignatura) {
            return res.status(404).json({ message: 'Asignatura no encontrada' });
        }
        res.json(asignatura);
    } catch (err) {
        next(err);
    }
}

// Obtener asignaturas por nombre de especialidad
async function getByEspecialidad(req, res, next) {
    try {
        const especialidad = await Especialidades.findOne({ name: req.params.especialidadName.toLowerCase(), isActive: true });
        if (!especialidad) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }

        const asignaturas = await Asignaturas.find({ especialidad: especialidad._id, isActive: true }).populate('especialidad');
        res.json(asignaturas);
    } catch (err) {
        next(err);
    }
}

// Obtener asignaturas por nombre de especialidad y año
async function getByEspecialidadYPorAño(req, res, next) {
    try {

        //console.log( await Especialidades.find({}) )


        const especialidad = await Especialidades.findOne({ name: req.params.especialidadName.toLowerCase(), isActive: true });
        if (!especialidad) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }

        const asignaturas = await Asignaturas.find({ 
            especialidad: especialidad._id, 
            año: req.params.anio, 
            isActive: true 
        }).populate('especialidad');

        res.json(asignaturas);
    } catch (err) {
        next(err);
    }
}

// Insertar nueva asignatura
async function insertAsignatura(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized');
        }

        const asignatura = req.body;

        // Verifica si se proporcionaron datos
        if (!asignatura || !asignatura.especialidad) {
            return res.status(400).send('No se proporcionaron datos o falta especialidad');
        }

        // Busca la especialidad por nombre
        const especialidad = await Especialidades.findOne({ name: asignatura.especialidad.toLowerCase() });

        if (!especialidad) {
            return res.status(404).send('Especialidad no encontrada');
        }

        // Reemplaza el nombre de la especialidad con el ID encontrado
        asignatura.especialidad = especialidad._id;

        // Crea y guarda la nueva asignatura
        const newAsignatura = new Asignaturas(asignatura);
        await newAsignatura.save();
        res.status(201).json(newAsignatura);
    } catch (err) {
        next(err);
    }
}

// Sustituir asignatura por ID
async function sustituirAsignatura(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized');
        }

        const updates = req.body;
        if (!updates) {
            return res.status(400).send('No se proporcionaron datos');
        }

        const asignatura = await Asignaturas.findOneAndUpdate(
            { _id: req.params.id },
            updates,
            { new: true, runValidators: true }
        );
        if (!asignatura) {
            return res.status(404).json({ message: 'Asignatura no encontrada' });
        }
        res.json(asignatura);
    } catch (err) {
        next(err);
    }
}

// Editar asignatura parcialmente por ID
async function editAsignatura(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized');
        }

        const updates = req.body;
        if (!updates) {
            return res.status(400).send('No se proporcionaron datos');
        }

        const asignatura = await Asignaturas.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updates },
            { new: true, runValidators: true }
        );
        if (!asignatura) {
            return res.status(404).json({ message: 'Asignatura no encontrada' });
        }
        res.json(asignatura);
    } catch (err) {
        next(err);
    }
}

// Desactivar asignatura por ID (actualización de `isActive`)
async function desactivarAsignatura(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized');
        }

        const asignatura = await Asignaturas.findOneAndUpdate(
            { _id: req.params.id },
            { isActive: false },
            { new: true }
        );
        if (!asignatura) {
            return res.status(404).json({ message: 'Asignatura no encontrada' });
        }
        res.json({ message: 'Asignatura desactivada exitosamente' });
    } catch (err) {
        next(err);
    }
}

// Activar asignatura por ID (actualización de `isActive`)
async function activarAsignatura(req, res, next) {
    try {
        if (!req.isAdmin()) {
            return res.status(401).send('Unauthorized');
        }

        const asignatura = await Asignaturas.findOneAndUpdate(
            { _id: req.params.id },
            { isActive: true },
            { new: true }
        );
        if (!asignatura) {
            return res.status(404).json({ message: 'Asignatura no encontrada' });
        }
        res.json({ message: 'Asignatura activada exitosamente' });
    } catch (err) {
        next(err);
    }
}

module.exports = router;

/**
 *
{
  "ciclo": "Superior",
  "año": 3,
  "nombre": "Matemáticas Avanzadas",
  "taller": false,
  "cant_horas": 6,
  "especialidad": "64c5a5e8c9a74b2f2e8b4567", // ID del especialidad en formato ObjectId
  "docente_aCargo": {
    "user": "64c5a5e8c9a74b2f2e8b4567" // ID del usuario en formato ObjectId
  }
}
 *
 */
