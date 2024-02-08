const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/',(req,res) => {
    Note.find({}).then(notes => res.send(notes))
})

notesRouter.get('/:id',(req,res,next) => {
    const id = req.params.id
    Note.findById(id).then(n => {
        if (n)
            res.json(n)
        else
            res.status(404).end()
    })
        .catch(error => next(error))
})

notesRouter.delete('/:id',(req,res,next) => {
    const idToDelete = req.params.id
    Note.findByIdAndDelete(idToDelete)
        .then(response => res.status(204))
        .catch(err => next(err))
})

notesRouter.post('/',(req,res, next) => {
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

notesRouter.put('/:id',(req,res,next) => {
    const { content, important } = req.body
    Note.findByIdAndUpdate(
        req.params.id,
        { content, important },
        { new:true, runValidators: true, context: 'query' }
    )
        .then(updatedNote => res.json(updatedNote))
        .catch(error => next(error))
})

module.exports = notesRouter