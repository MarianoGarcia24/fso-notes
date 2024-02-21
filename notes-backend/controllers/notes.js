const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = (req) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')){
        return authorization.replace('Bearer ', '')
    }
    return null
}

notesRouter.get('/', async (req,res) => {
    const notes = await Note.find({}).populate('user',{ username: 1, name: 1 })
    res.json(notes)
})

notesRouter.get('/:id',async (req,res,next) => {
    const id = req.params.id
    try{
        const note = await Note.findById(id)
        if (note)
            res.json(note)
        else
            res.status(404).end()
    }
    catch(exc){
        next(exc)
    }
})

notesRouter.delete('/:id',async (req,res,next) => {
    const idToDelete = req.params.id
    try{
        await Note.findByIdAndDelete(idToDelete)
        res.status(204).end()
    }
    catch(exc){
        next(exc)
    }
})

notesRouter.post('/',async (req,res, next) => {
    const body = req.body

    const Token = jwt.verify(getTokenFrom(req), process.env.SECRET)

    if (!Token.id){
        return res.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(Token.id)

    // if (body.content === undefined){
    //     return res.status(400).json({
    //         error: 'content missing'
    //     })
    // }

    const note = new Note({
        content: body.content,
        important: body.important === undefined ? false : body.important,
        user: user.id
    })

    try {
        const savedNote = await note.save()
        user.notes = user.notes.concat(savedNote._id)
        await user.save()
        res.status(201).json(savedNote)
    }
    catch(ex) {
        next(ex)
    }

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