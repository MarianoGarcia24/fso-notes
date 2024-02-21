const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.post('/',async (req,res,next) => {
    const { username, name, password } = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password,saltRounds)

    const user = new User({
        username: username,
        name: name,
        passwordHash: passwordHash
    })

    try{
        const savedUser = await user.save()
        res.status(201).json(savedUser)
    }
    catch (e){
        next(e)
    }
})

usersRouter.get('/', async(req,res) => {
    const users = await User.find({}).populate('notes',{ content: 1, important: 1 })
    res.json(users)
})

module.exports = usersRouter