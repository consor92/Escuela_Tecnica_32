const express = require('express')
const path = require('path');
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const ofAlumnosRoutes = require('./routes/ofAlumnosRoute')
const novedadesRoutes = require('./routes/novedadesRoute');
const especialidadesRoutes = require('./routes/especialidadesRoute');
const directivosRoutes = require('./routes/directivosRoute');
const departamentosRoutes = require('./routes/departamentosRoute');
const datosGeneralesRoutes = require('./routes/datosGeneralesRoute')
const cooperadoraRoutes = require('./routes/cooperadoraRoute');
const calendarioRoutes = require('./routes/calendarioRoute');
const asignaturasRoutes = require('./routes/asignaturasRoute')
const logInRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const trabajosRoute = require('./routes/trabajosRoute');
const rolesRoute = require('./routes/rolesRoute');

const authentication = require('./middlewares/authentication')
const authorization = require('./middlewares/authorization')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(authorization)


app.get('/favicon.ico', (req, res) => res.status(204))

app.use('/', logInRoute);
app.use('/usuarios', authentication, userRoute);
app.use('/trabajos', authentication, trabajosRoute);
app.use('/roles', authentication, rolesRoute);
app.use('/ofalumnos', authentication, ofAlumnosRoutes);
app.use('/novedades', authentication, novedadesRoutes);
app.use('/especialidades', authentication, especialidadesRoutes);
app.use('/directivos', authentication, directivosRoutes);
app.use('/departamentos', authentication, departamentosRoutes);
app.use('/general', authentication, datosGeneralesRoutes);
app.use('/cooperadora', authentication, cooperadoraRoutes);
app.use('/calendario', authentication, calendarioRoutes);
app.use('/asignaturas', authentication, asignaturasRoutes);

app.use(errorHandler);


module.exports = app
