const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')


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


module.exports = app