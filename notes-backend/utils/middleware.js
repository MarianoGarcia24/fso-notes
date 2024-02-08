const logger = require('./logger')

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error,req,res,next) => {
    logger.error(error.message)

    if (error.name == 'CastError')
        return res.status(400).send({ error: 'malformatted id' })
    else
        if (error.name === 'ValidationError')
            return res.status(400).send({ error: error.message })

    next(error)
}

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}


module.exports = {
    unknownEndpoint,
    errorHandler,
    requestLogger
}