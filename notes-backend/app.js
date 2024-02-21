//NPM INITIALIZATIONS
const express = require('express')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')

//PROJECT INITIALIZATIONS
const config = require('./utils/config')
const logger = require('./utils/logger')

//ROUTERS
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const middleware = require('./utils/middleware')

mongoose.set('strictQuery',false)

logger.info('conecting to',config.MONGODB_URI)

//DB CONNECTION
mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB: ',error.message)
    })

//FIRST-STEP MIDDLEWARES
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

//ROUTERS --> URLs to the resources
app.use('/api/notes',notesRouter)
app.use('/api/users',usersRouter)
app.use('/api/login',loginRouter)

//AFTER-REQ MIDDLEWARES
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app