const mongoose = require('mongoose')
mongoose.set('strictQuery',false)
const url = process.env.MONGODB_URI
console.log(url)

mongoose.connect(url)
    .then(result => {
        console.log('Connected to mongoDB')
    })
    .catch(error => {
        console.log('Error connecting to MongoDB: ', error.message)
    })

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minLength: 4,
        required: true
    },
    important: Boolean
})

noteSchema.set('toJSON',{
    transform: (doc,returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Note',noteSchema)