require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const Note = require('./models/note')
const PORT = process.env.PORT

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error,req,res,next) => {
    console.log(error.message)

    if (error.name == 'CastError')
        return res.status(400).send({ error: 'malformatted id' })
    else
        if (error.name === 'ValidationError')
            return res.status(400).send({ error: error.message })

    next(error)
}

app.use(cors())
app.use(express.json())
app.use(requestLogger)

app.get('/',(req,res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes',(req,res) => {
    Note.find({}).then(notes => res.send(notes))
})

app.get('/api/notes/:id',(req,res,next) => {
    const id = req.params.id
    Note.findById(id).then(n => {
        if (n)
            res.json(n)
        else
            res.status(404).end()
    })
        .catch(error => next(error))
})

app.delete('/api/notes/:id',(req,res,next) => {
    const idToDelete = req.params.id
    Note.findByIdAndDelete(idToDelete)
        .then(response => res.status(204))
        .catch(err => next(err))
})

app.post('/api/notes',(req,res, next) => {
    const body = req.body

    if (body.content === undefined){
        return res.status(400).json({
            error: 'content missing'
        })
    }

    console.log(req.body)
    const note = new Note({
        content: req.body.content,
        important: req.body.important || false,
    })
    note.save().then(savedNote => {
        res.json(savedNote)
    })
        .catch(error => next(error))
})

app.put('/api/notes/:id',(req,res,next) => {
    const { content, important } = req.body
    Note.findByIdAndUpdate(
        req.params.id,
        { content, important },
        { new:true, runValidators: true, context: 'query' }
    )
        .then(updatedNote => res.json(updatedNote))
        .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)


app.listen(PORT)
console.log(`Server running on port ${PORT}`)
