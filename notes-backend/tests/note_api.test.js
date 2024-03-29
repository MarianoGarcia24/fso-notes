const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const Note = require('../models/note')


const app = require('../app')

const initialNotes = [
    {
        content: 'HTML is easy',
        important: false,
    },
    {
        content: 'Browser can execute only JavaScript',
        important: true,
    }
]


const api = supertest(app)

beforeEach(async () => {
    await Note.deleteMany({})
    let noteObject = new Note(initialNotes[0])
    await noteObject.save()
    noteObject = new Note(initialNotes[1])
    await noteObject.save()
})


test('notes are returned as json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two notes', async () => {
    const res = await api.get('/api/notes')
    assert.strictEqual(res.body.length,2)
})

test('the first note is about HTTP methods', async () => {
    const res = await api.get('/api/notes')

    const contents = res.body.map(e => e.content)

    assert(contents.includes('HTML is easy'))

})

after(async () => {
    await mongoose.connection.close()
})