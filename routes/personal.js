const { Router } = require('express')
const bcrypt = require('bcrypt')


const Medico = require('../schemas/user')
const Role = require('../schemas/role')

const router = new Router()

//  ----------  END POINT -----------

router.get('/:matricula', datosDeUnMedico)
router.patch('/:matricula', editarMedico)


//------ GET -------
async function datosDeUnMedico(req, res, next) {
    try {

        const { matricula } = req.params;
        if (!matricula) {
            return res.status(400).json({ mensaje: 'Se requiere la matrícula del médico en los parámetros.' });
        }

        if ((!req.isAdmin() || !req.isMedico)) {
            return res.status(403).send('Unauthorized')
        }

        const medicoRoleId = await Role.findOne({ name: 'medico' }).select('_id');
        const users = await Medico.findById({ isActive: true, role: medicoRoleId, _id: matricula })
            .populate('role')
            .populate({
                path: 'pref',
                model: 'Pais',
                select: 'pref',
            }).populate({
                path: 'especialidad',
                model: 'Especialidades',
                select: 'value'
            }).populate(
                {
                    path: 'cobertura',
                    model: 'Coberturas',
                    select: 'value'
                }
            ).populate({
                path: 'sanatorio.localidades',
                model: 'Localidades',
            }).populate({
                path: 'localidad',
                model: 'Pais',
                options: { $slice: 1 }
            }).exec();

        res.send(users)
    } catch (err) {
        next(err)
    }
}

//------ PATCH ------

async function editarMedico(req, res, next) {
    try {
        const  matricula  = req.params;
        const  datos  = req.body;

        // Verificar si se proporciona la matrícula del médico en los parámetros
        if (!matricula) {
            return res.status(400).json({ mensaje: 'Se requiere la matrícula del médico en los parámetros.' });
        }


        // Verificar si la matrícula del médico existe en la base de datos
        const medicoExistente = await Medico.findOne( matricula );

        if (!medicoExistente) {
            return res.status(404).json({ mensaje: 'Médico no encontrado en la base de datos.' });
        }


        if (!(req.isAdmin() || (req.isMedico() && medicoExistente._id != req.user._id))) {
            return res.status(403).send('Unauthorized')
        }


        // Verificar si se proporciona las propiedad en el cuerpo de la solicitud
        if (!datos) {
            return res.status(400).json({ mensaje: 'Se requiere las propiedad en el cuerpo de la solicitud.' });
        }


        datos.email = '';
        datos.matricula = '';
        datos.dni = '';
        datos.role = '';
        datos.nick = '';
        const passEncrypted = datos.password ? await bcrypt.hash(datos.password, 10): ''

        // Actualizar la disponibilidad del médico
        const medicoActualizado = await Medico.findOneAndUpdate(
            { _id: medicoExistente._id },
            {   
                password: passEncrypted ,
                nombre: datos.nombre,
                apellido: datos.apellido,
                tel: datos.tel,
                pref: datos.pref ,
                localidad: datos.localidad,
                sanatorio: datos.sanatorio,
                nacimiento: datos.nacimiento,
                edad: datos.edad,
                genero: datos.genero,
                especialidad: datos.especialidad              
            }

        );

        res.status(200).send(medicoActualizado);
        
    } catch (error) {
        console.error(error); // Imprime el error en la consola para propósitos de depuración
        res.status(500).json({ mensaje: 'Error interno del servidor.' });
        next();
    }
}

module.exports = router