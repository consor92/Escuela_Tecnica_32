const express = require('express')

const Agendas = require('../schemas/agenda')
const Dias = require('../schemas/dias')
const Turnos = require('../schemas/turnos')
const Especialidades = require('../schemas/especialidades')

const authentication = require('../middlewares/authentication')

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const router = express.Router()
const moment = require('moment');

//  ----------  END POINT -----------



router.get('/IdTurno/:idTurno', authentication, getTurnosById)
router.get('/IdDia/:idDia', authentication, getDiaById)
router.get('/turnos', authentication, getTurnos)
router.get('/dias', authentication, getDias)
router.post('/', authentication, createAgenda)                          // localhost:4000/medico/agenda                    -- POST (agrega una agenda nueva )
router.post('/dia', authentication, createDia)                          // localhost:4000/medico/agenda/dia                -- POST ( Agrega dias) 
router.post('/turno', authentication, createTurno)                      // localhost:4000/medico/agenda/turno              -- POST ( Agrega turnos) 
router.get('/', authentication, getAllAgendas)                          // localhost:4000/medico/agenda/                   -- GET ( muestra agendas )
router.get('/:medico', getAgendaDelMedico)                              // localhost:4000/medico/agenda/444444             -- GET (todas las agendas de un medico)
router.patch('/:medico', authentication, patchEditarPorAgenda)          // localhost:4000/medico/agenda/333333             -- PATCH ( edita agenda de un medico)
router.patch('/dia/:idDia', authentication, patchEditarPorDia)          // localhost:4000/medico/agenda/dia/1003           -- PATCH (edita el dia de una agenda) 
router.patch('/turno/:idTurno', authentication, patchEditarPorTurno)    // localhost:4000/medico/agenda/turno/102          -- PATCH ( esto edita un turno de un dia TOMAR TURNO)


module.exports = router

//-----  PATCH   ------
async function patchEditarPorTurno(req, res, next) {
    try {
        const turno = req.params;
        const datos = req.body;
        // Verificar si se proporciona el turno en los parámetros
        if (!turno) {
            return res.status(400).json({ mensaje: 'Se requiere un turno en los parámetros.' });
        }

        //console.log(req.isMedico)
        if ((!req.isAdmin() || !req.isMedico)) {
            return res.status(403).send('Unauthorized')
        }

        // Verificar si idDia existe en la base de datos
        const turnoExistente = await Turnos.findOne(turno);

        if (!turnoExistente) {
            return res.status(404).json({ mensaje: 'turno no encontrado en la base de datos.' });
        }

        // Verificar si se proporciona la propiedad 'disponibilidad' en el cuerpo de la solicitud
        if (!datos) {
            return res.status(400).json({ mensaje: 'Se requiere en el cuerpo de la solicitud.' });
        }

        const horaDate = moment(datos.hora, 'YYYY-MM-DDTHH:mm:ss').toDate();

        datos.idTurno = undefined
        // Actualizar la disponibilidad del médico
        const turnoActualizados = await Turnos.findOneAndUpdate(
            { idTurno: turno.idTurno },
            {
                hora: datos.horaDate,
                consultorio: datos.consultorio,
                paciente: datos.paciente,
                type: datos.type,
            },
            { new: true } // Esto indica a Mongoose que devuelva el documento modificado
        );

        res.status(200).send(turnoActualizados);
    } catch (error) {
        console.error(error); // Imprime el error en la consola para propósitos de depuración
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
        next();
    }
}

async function patchEditarPorDia(req, res, next) {
    try {
        const dia = req.params;
        const datos = req.body;
        
        console.log( datos )

        // Verificar si se proporciona el dia en los parámetros
        if (!dia) {
            return res.status(400).json({ mensaje: 'Se requiere un dia en los parámetros.' });
        }

        if ((!req.isAdmin() || !req.isMedico)) {
            return res.status(403).send('Unauthorized')
        }

        // Verificar si idDia existe en la base de datos
        const diaExistente = await Dias.findOne(dia);

        if (!diaExistente) {
            return res.status(404).json({ mensaje: 'Dia no encontrado en la base de datos.' });
        }

        // Verificar si se proporciona la propiedad 'disponibilidad' en el cuerpo de la solicitud
        if (!datos) {
            return res.status(400).json({ mensaje: 'Se requiere en el cuerpo de la solicitud.' });
        }

        // Verificar si se proporciona la propiedad 'id_dias' como un array en el cuerpo de la solicitud
        if (!datos.citas.id || !Array.isArray(datos.citas.id)) {
            return res.status(400).json({ mensaje: 'La propiedad "disponibilidad.id_dias" es requerida y debe ser un array.' });
        }

        datos.fecha = undefined

        // Actualizar la disponibilidad del médico
        const diaActualizados = await Dias.findOneAndUpdate(
            { idDia: dia.idDia },
            {
                descripcion: datos.descripcion,
                type: datos.type,
                'citas.id': datos.citas.id
            },
            { new: true } // Esto indica a Mongoose que devuelva el documento modificado
        );

        res.status(200).send(diaActualizados);
    } catch (error) {
        console.error(error); // Imprime el error en la consola para propósitos de depuración
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
        next();
    }
}

async function patchEditarPorAgenda(req, res, next) {
    try {
        const { medico } = req.params;
        const { disponibilidad } = req.body;

        // Verificar si se proporciona la matrícula del médico en los parámetros
        if (!medico) {
            return res.status(400).json({ mensaje: 'Se requiere la matrícula del médico en los parámetros.' });
        }

        if ((!req.isAdmin() || !req.isMedico)) {
            return res.status(403).send('Unauthorized')
        }

        // Verificar si la matrícula del médico existe en la base de datos
        const agendaExistente = await Agendas.findOne({ matricula: medico });

        if (!agendaExistente) {
            return res.status(404).json({ mensaje: 'Médico no encontrado en la base de datos.' });
        }

        // Verificar si se proporciona la propiedad 'disponibilidad' en el cuerpo de la solicitud
        if (!disponibilidad) {
            return res.status(400).json({ mensaje: 'Se requiere la propiedad "disponibilidad" en el cuerpo de la solicitud.' });
        }

        // Verificar si se proporciona la propiedad 'id_dias' como un array en el cuerpo de la solicitud
        if (!disponibilidad.id_dias || !Array.isArray(disponibilidad.id_dias)) {
            return res.status(400).json({ mensaje: 'La propiedad "disponibilidad.id_dias" es requerida y debe ser un array.' });
        }

        // Actualizar la disponibilidad del médico
        await Agendas.updateOne(
            { matricula: medico },
            { $addToSet: { 'disponibilidad.id_dias': { $each: disponibilidad.id_dias } } }
        );

        res.status(200).send(agendaExistente);
    } catch (error) {
        console.error(error); // Imprime el error en la consola para propósitos de depuración
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
        next();
    }
}


//--------- GETS ---------
async function getAgendaDelMedico(req, res, next) {
    try {
        const medico = req.params.medico;

        const agendas = await Agendas.find({ matricula: medico }).populate({
            path: 'matricula',
            model: 'User',
            select: 'matricula nombre apellido especialidad',
        })

        //const agendasFiltradas = agendas.filter(agenda => agenda.matricula.matricula === medico);
        //const especialidadInfo = await Especialidades.findById(agendas.matricula.especialidad);

        const agendasTransformadas = await Promise.all(agendas.map(async (agenda) => {
            // Extraer la información necesaria del médico
            const { nombre, apellido, matricula, _id: idUser } = agenda.matricula;
            const { descripcion, tags, type, _id } = agenda

            // Obtener información de la especialidad para la única matrícula
            const especialidadInfo = await Especialidades.findById(agenda.matricula.especialidad);
            const especialidad = especialidadInfo ? especialidadInfo.value : null;

            // Crear una nueva estructura con los campos deseados
            return {
                _id,
                idUser,
                matricula,
                nombre,
                apellido,
                especialidad, // Valor de Especialidades.value para la única matrícula
                disponibilidad: agenda.disponibilidad,
                descripcion,
                tags,
                type
            };
        }));

        let contadorAutoincrementable = 1;
        const datosTransformados = agendasTransformadas.map(elemento => ({
            ...elemento,
            key: contadorAutoincrementable++,
            disponibilidad: elemento.disponibilidad.id_dias
        }));


        // AHasta aca ya tengo pedido los datos a la agenda y en formato JSON como los necesito
        // ahora busco los datos de los dias y los turno para esa agenda y armo un array


        // Obtener todos los ObjectIds en un solo array
        const objectIds = datosTransformados.reduce((acc, obj) => {
            if (obj.disponibilidad && Array.isArray(obj.disponibilidad)) {
                acc.push(...obj.disponibilidad.map(id => new ObjectId(id)));
            }
            return acc;
        }, []);

        // Filtrar duplicados si es necesario
        const uniqueObjectIds = [...new Set(objectIds)];

        // Usar Promise.all para esperar a que todas las consultas se completen
        const resultados = await Promise.all(uniqueObjectIds.map(id => Dias.findById(id)));

        // Mapear resultados a un objeto por id para facilitar el acceso
        const resultadosPorId = resultados.reduce((acc, result) => {
            if (result && result._id) {
                acc[result._id] = result;
            }
            return acc;
        }, {});

        // Reemplazar cada elemento en la propiedad disponibilidad con los datos de resultados
        datosTransformados.forEach(obj => {
            if (obj.disponibilidad && Array.isArray(obj.disponibilidad)) {
                obj.disponibilidad = obj.disponibilidad.map(id => resultadosPorId[id]);
            }
        });

        ///////////////// array citas //////////////////

        // Función para transformar las citas
        const transformarCitas = async (citasIds, contador) => {
            const citasTransformadas = [];
            const idsArray = Array.isArray(citasIds) ? citasIds : [citasIds];

            for (const citaId of idsArray) {
                const cita = await Turnos.findById(citaId).lean();

                if (cita) {
                    // Utilizar JSON.parse(JSON.stringify()) para hacer una copia profunda del objeto y eliminar las referencias internas de Mongoose
                    const citaTransformada = JSON.parse(JSON.stringify({
                        idRecord: contador++,
                        idTurno: cita.idTurno,
                        hora: cita.hora,
                        consultorio: cita.consultorio,
                        paciente: cita.paciente ? cita.paciente._id : '',
                        type: cita.type
                    }));

                    citasTransformadas.push(citaTransformada);
                }
            }

            const citasFiltradas = citasTransformadas.filter(cita => Object.values(cita).some(value => value !== '' && value !== null));

            return citasFiltradas;
        };



        const nuevoDatosTransformados = await Promise.all(
            datosTransformados.map(async medico => {
                const nuevoMedico = { ...medico };
                nuevoMedico.disponibilidad = await Promise.all(
                    medico.disponibilidad.map(async disponibilidad => {
                        const citasTransformadas = await transformarCitas(disponibilidad.citas.id, 1);

                        if (citasTransformadas.length === 0) {
                            console.log(`No hay citas transformadas para médico ${medico.key}, disponibilidad ${disponibilidad._id}`);
                        }

                        return {
                            idDia: disponibilidad.idDia,
                            fecha: disponibilidad.fecha,
                            type: disponibilidad.type,
                            descripcion: disponibilidad.descripcion,
                            citas: citasTransformadas
                        };
                    })
                );

                return nuevoMedico;
            })
        );



        res.send(nuevoDatosTransformados)

    } catch (err) {
        console.error('Error al obtener las agendas del médico:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
        next(err);
    }

}

//ya que no pude realizar vien los populate() cuando los datos don Arrays, plantie el camino largo de armar el JSOn a mano 
async function getAllAgendas(req, res, next) {
    try {

        if ((!req.isAdmin() || !req.isMedico)) {
            return res.status(403).send('Unauthorized')
        }
        
        const agendas = await Agendas.find().populate({
            path: 'matricula',
            model: 'User',
            select: 'matricula nombre apellido especialidad ',
        })
        //const especialidadInfo = await Especialidades.findById(agendas.matricula.especialidad);

        const agendasTransformadas = await Promise.all(agendas.map(async (agenda) => {
            // Extraer la información necesaria del médico

            const { nombre, apellido, matricula, _id: idUser } = agenda.matricula;
            const { descripcion, tags, type, _id } = agenda

            // Obtener información de la especialidad para la única matrícula
            const especialidadInfo = await Especialidades.findById(agenda.matricula.especialidad);
            const especialidad = especialidadInfo ? especialidadInfo.value : null;

            // Crear una nueva estructura con los campos deseados
            return {
                _id,
                matricula,
                idUser,
                nombre,
                apellido,
                especialidad, // Valor de Especialidades.value para la única matrícula
                descripcion,
                tags,
                type,
                disponibilidad: agenda.disponibilidad,
            };
        }));

        let contadorAutoincrementable = 1;
        const datosTransformados = agendasTransformadas.map(elemento => ({
            ...elemento,
            key: contadorAutoincrementable++,
            disponibilidad: elemento.disponibilidad.id_dias,
        }));


        // AHasta aca ya tengo pedido los datos a la agenda y en formato JSON como los necesito
        // ahora busco los datos de los dias y los turno para esa agenda y armo un array


        // Obtener todos los ObjectIds en un solo array
        const objectIds = datosTransformados.reduce((acc, obj) => {
            if (obj.disponibilidad && Array.isArray(obj.disponibilidad)) {
                acc.push(...obj.disponibilidad.map(id => new ObjectId(id)));
            }
            return acc;
        }, []);

        // Filtrar duplicados si es necesario
        const uniqueObjectIds = [...new Set(objectIds)];

        // Usar Promise.all para esperar a que todas las consultas se completen
        const resultados = await Promise.all(uniqueObjectIds.map(id => Dias.findById(id)));

        // Mapear resultados a un objeto por id para facilitar el acceso
        const resultadosPorId = resultados.reduce((acc, result) => {
            if (result && result._id) {
                acc[result._id] = result;
            }
            return acc;
        }, {});

        // Reemplazar cada elemento en la propiedad disponibilidad con los datos de resultados
        datosTransformados.forEach(obj => {
            if (obj.disponibilidad && Array.isArray(obj.disponibilidad)) {
                obj.disponibilidad = obj.disponibilidad.map(id => resultadosPorId[id]);
            }
        });

        ///////////////// array citas //////////////////

        // Función para transformar las citas
        const transformarCitas = async (citasIds, contador) => {
            const citasTransformadas = [];
            const idsArray = Array.isArray(citasIds) ? citasIds : [citasIds];

            for (const citaId of idsArray) {
                const cita = await Turnos.findById(citaId).lean();

                if (cita) {
                    // Utilizar JSON.parse(JSON.stringify()) para hacer una copia profunda del objeto y eliminar las referencias internas de Mongoose
                    const citaTransformada = JSON.parse(JSON.stringify({
                        idRecord: contador++,
                        idTurno: cita.idTurno,
                        hora: cita.hora,
                        consultorio: cita.consultorio,
                        paciente: cita.paciente ? cita.paciente._id : '',
                        type: cita.type
                    }));

                    citasTransformadas.push(citaTransformada);
                }
            }

            const citasFiltradas = citasTransformadas.filter(cita => Object.values(cita).some(value => value !== '' && value !== null));

            return citasFiltradas;
        };



        const nuevoDatosTransformados = await Promise.all(
            datosTransformados.map(async medico => {
                const nuevoMedico = { ...medico };
                nuevoMedico.disponibilidad = await Promise.all(
                    medico.disponibilidad.map(async disponibilidad => {
                        const citasTransformadas = await transformarCitas(disponibilidad.citas.id, 1);

                        return {
                            idDia: disponibilidad.idDia,
                            fecha: disponibilidad.fecha,
                            type: disponibilidad.type,
                            descripcion: disponibilidad.descripcion,
                            citas: citasTransformadas
                        };
                    })
                );

                return nuevoMedico;
            })
        );



        res.send(nuevoDatosTransformados)

    } catch (err) {
        next(err)
    }

}

async function getDias(req, res, next) {
    if ((!req.isAdmin() || !req.isMedico)) {
        return res.status(403).send('Unauthorized')
    }

    const turnos = await Dias.find()

    res.send(turnos)
}

async function getTurnos(req, res, next) {
    if ((!req.isAdmin() || !req.isMedico)) {
        return res.status(403).send('Unauthorized')
    }

    const turnos = await Turnos.find().populate({
        path: 'paciente',
        model: 'User',
    })

    res.send(turnos)
}

async function getTurnosById(req, res, next) {
    const idTurno = req.params.idTurno;

    if (!idTurno) {
        return res.status(400).json({ mensaje: 'Se requiere la id del turno en los parámetros.' });
    }

    if ((!req.isAdmin() || !req.isMedico)) {
        return res.status(403).send('Unauthorized')
    }

    const turnos = await Turnos.find({ idTurno }).populate({
        path: 'paciente',
        model: 'User',
    })

    res.send(turnos)
}

async function getDiaById(req, res, next) {
    const idDia = req.params.idDia;

    if (!idDia) {
        return res.status(400).json({ mensaje: 'Se requiere la id del dia en los parámetros.' });
    }

    if ((!req.isAdmin() || !req.isMedico)) {
        return res.status(403).send('Unauthorized')
    }

    const turnos = await Dias.find({ idDia })

    res.send(turnos)
}

//----- POST ----
async function createTurno(req, res, next) {
    const turno = req.body

    try {
        if (!turno) {
            res.status(404).send('Sin datos')
        }

        if ((!req.isAdmin() || !req.isMedico)) {
            return res.status(403).send('Unauthorized')
        }

        /*
        const maxIdTurno = await getMaxIdTurnos();

        if (maxIdTurno !== null) {
            turno.idTurno = maxIdTurno + 1;
        } else {
            turno.idTurno = 1;
        }
        */
        const horaDate = moment(turno.hora, 'YYYY-MM-DDTHH:mm:ss').toDate();
        turno.hora = horaDate
        
        console.log('create Turno: ', turno)

        const turnoCreate = await Turnos.create(turno);

        res.send(turnoCreate)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear el día.')
        next(err)
    }
}

async function createDia(req, res, next) {

    const dia = req.body

    try {
        if (!dia) {
            res.status(404).send('Sin datos')
        }

        if ((!req.isAdmin() || !req.isMedico)) {
            return res.status(403).send('Unauthorized')
        }

        const maxIdDia = await getMaxIdDia();

        if (maxIdDia !== null) {
            dia.idDia = maxIdDia + 1;
        } else {
            dia.idDia = 1;
        }

        console.log('create Dia: ', dia)

        dia.fecha = moment(dia.fecha, 'YYYY-MM-DD').toDate();

        const diaCreate = await Dias.create(dia);

        res.send(diaCreate)
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al crear el día.')
        next(err)
    }
}

async function createAgenda(req, res, next) {
    console.log('create Agenda: ', req.body)

    const agenda = req.body

    try {
        if (!agenda) {
            res.status(404).send('Sin datos')
        }

        if ((!req.isAdmin() || !req.isMedico)) {
            return res.status(403).send('Unauthorized')
        }

        //const roleCreated  = await Agendas.create({ ...agenda })
        const agendaCreate = await Agendas.insertMany(agenda)

        res.send(agendaCreate)
    } catch (err) {
        next(err)
    }
}


//------ UTIL -----
async function getMaxIdDia() {
    try {
        const maxIdDiaDocument = await Dias.findOne({}, {}, { sort: { idDia: -1 } });

        if (maxIdDiaDocument) {
            const maxIdDia = maxIdDiaDocument.idDia;
            return maxIdDia;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener el número máximo de idDia:', error);
        throw error;
    }
}

async function getMaxIdTurnos() {
    try {
        const maxIdTurnoDocument = await Turnos.findOne({}, {}, { sort: { idTurno: -1 } });

        if (maxIdTurnoDocument) {
            const maxIdTurno = maxIdTurnoDocument.idTurno;
            return maxIdTurno;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error al obtener el número máximo de idDia:', error);
        throw error;
    }
}


module.exports = router