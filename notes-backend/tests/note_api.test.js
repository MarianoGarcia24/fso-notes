const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const Note = require('../models/note')
const User = require('../models/user')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')


describe('when there are some tests saved',() => {
    beforeEach(async () => {
        await Note.deleteMany({})

        const noteObjects = helper.initialNotes.map(note => new Note(note))
        const promiseArray = noteObjects.map(note => note.save())

        await Promise.all(promiseArray)

    })

    test('notes are returned as json', async () => {
        await api
            .get('/api/notes')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all notes are returned', async () => {
        const res = await api.get('/api/notes')
        assert.strictEqual(res.body.length,helper.initialNotes.length)
    })

    test('a specific note is within the returned notes', async () => {
        const res = await api.get('/api/notes')

        const contents = res.body.map(e => e.content)

        assert(contents.includes('HTML is easy'))

    })
})

describe('viewing a specific note', () => {
    test('a specific note can be viewed', async () => {
        const notesAtStart = await helper.notesInDb()

        const noteToView = notesAtStart[0]

        const resultNote = await api
            .get(`/api/notes/${noteToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        assert.deepStrictEqual(resultNote.body, noteToView)

    })

    test('fails with statuscode 404 if note does not exist', async () => {
        const validNonexistingId = await helper.nonExistingId()

        await api
            .get(`/api/notes/${validNonexistingId}`)
            .expect(404)
    })
})

describe('addition of a new note',() => {
    test('a valid note can be added', async () => {
        const newNote = {
            content: 'async/await simplifies making async calls',
            important: true
        }
        await api
            .post('/api/notes')
            .send(newNote)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const notesAtEnd = await helper.notesInDb()
        assert.strictEqual(notesAtEnd.length,helper.initialNotes.length + 1)


        const contents = notesAtEnd.map(r => r.content)

        assert(contents.includes('async/await simplifies making async calls'))
    })

    test('a invalid note won`t be added', async () => {
        const notesAtStart = await helper.notesInDb()
        const newNote = {
            important: true
        }

        await api
            .post('/api/notes')
            .send(newNote)
            .expect(400)

        const notesAtEnd = await helper.notesInDb()

        assert.strictEqual(notesAtEnd.length,notesAtStart.length)
    })
})

describe('deletion of a note', () => {
    test('a note can be deleted', async () => {
        const notesAtStart = await helper.notesInDb()
        const noteToDelete = notesAtStart[0]

        await api
            .delete(`/api/notes/${noteToDelete.id}`)
            .expect(204)

        const notesAtEnd = await helper.notesInDb()

        assert.strictEqual(notesAtEnd.length,notesAtStart.length - 1)

        const contents = notesAtEnd.map(n => n.content)

        assert(!contents.includes(noteToDelete.content))

    })
})

describe('when there is initally one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany()
        const pwHash = await bcrypt.hash('sekret',10)
        const user = new User({ username: 'root',pwHash })

        await user.save()
    })

    test('creation succeeds w a fresh username', async () => {
        const  usersAtStart = await helper.usersInDb()


        const newUser = {
            username: 'Marian24',
            name: 'Marian',
            password: 'salamaleko'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()

        assert.strictEqual(usersAtEnd.length,usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails w username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            password: 'sekret',
            name: 'Superuser'
        }

        const res = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type',/application\/json/)

        const usersAtEnd = await helper.usersInDb()

        assert(res.body.error.includes('expected `username` to be unique'))
        assert(usersAtEnd.length,usersAtStart.length)

    })
})

after(async () => {
    await mongoose.connection.close()
})