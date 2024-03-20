const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const userRoute = require('./routes/user')
const turnosRoute = require('./routes/turnos')
const personalRoute = require('./routes/personal')
const pacienteRoute = require('./routes/paciente')
const agendaRoute = require('./routes/agenda')
const authRoute = require('./routes/auth')

const especialidadRoute = require('./routes/especialidades')
const localidadRoute = require('./routes/paises')
const coberturaRoute = require('./routes/coberturas')

const authentication = require('./middlewares/authentication')
const authorization = require('./middlewares/authorization')

const app = express() 

app.use(logger('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(authorization)

// This is to aviod error
app.get('/favicon.ico', (req, res) => res.status(204))

// ----------  ***  -----------------
//app.use('/', statusRouter)

// ----------  DATOS GRAL. USUARIO  ----------
app.use('/'                       , authRoute) // localhost:4000/login 
app.use('/user' ,  authentication , userRoute) // localhost:4000/user                                                  -- GET   (muestras los datos del usuario)

// ----------  ENDPOINT DE DATOS  ----------
app.use('/localidades' ,  authentication, localidadRoute)
app.use('/coberturas' ,  authentication, coberturaRoute)
app.use('/especialidades' ,  authentication, especialidadRoute)

// ----------  ENDPOINT DE PERSONAL  ----------
app.use('/personal' ,  authentication, personalRoute)

// ---------- ENDPOINT DE AGENDAS ------------
app.use('/medico/agenda', authentication, agendaRoute)                    


                                         

// ------------ENDPOINT DE TURNOS
//app.use('/turno:idTurno', turnosRoute) // localhost:4000/                                           -- GET  (muestra los datos de un turno)
//app.use('/turnos', turnosRoute) // localhost:4000/                                                  -- GET  (muestra todos los turno existentes)
//app.use('/turno:idTurno', turnosRoute) // localhost:4000/                                           -- PATCH
//app.use('/turno/cancelr:idTurno', turnosRoute) // localhost:4000/                                   -- PATCH
//app.use('/turno/edit:idTurno', turnosRoute) // localhost:4000/                                      -- PATCH

//app.use('/users', authentication, userRouter)

module.exports = app