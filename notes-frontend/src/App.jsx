import { useState, useEffect } from 'react'
import axios from 'axios'
import Note from './components/Note'
import noteService from './services/notes'
import Notification from './components/Notification'

const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic',
    fontSize: 16
  }
  return (
    <div style={footerStyle}>
      <br />
      <em>Note app, Department of Computer Science, University of Helsinki 2023</em>
    </div>
  )
}

const App = () => {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMesage, setErrorMesage] = useState('Some just happened')

  useEffect(()=> {
        noteService.getAll().then(initialNotes => setNotes(initialNotes))
  },[])

  const handleNoteChange = (event) => {
    console.log(event.target.value)
    setNewNote(event.target.value)
  }

  const addNote = (event) => {
    event.preventDefault()

    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
      id: notes.length + 1
    }
    
    noteService.create(noteObject).then(newNote => {
      setNotes(notes.concat(newNote))
      setNewNote('')
    })

  }

  const notesToShow = showAll ? notes : notes.filter(n => n.important)

  const toggleImportanceOf = (id) => {
    const noteToChange = notes.find(n => n.id === id)
    const changedNote = {...noteToChange, important:!noteToChange.important}

    noteService.update(id,changedNote).then(returnedNote => {
      setNotes(notes.map(n => n.id !== id ? n : returnedNote))})
      .catch(error => {
        setErrorMesage(`Note '${note.content}' was already deleted from the server`)
        setTimeout(()=>{
          setErrorMesage(null)
        },5000)
        setNotes(notes.filter(n => n.id !== id))
      })

  }

  return (
    <div>
      <h1>Notes</h1>
      {/* <Notification message={errorMesage}/> */}
      <div>
        <button onClick={()=>setShowAll(!showAll)}>
                show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map(note => 
          <Note 
              key={note.id} 
              note={note}
              toggleImportance={()=> toggleImportanceOf(note.id)} />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input value= {newNote} onChange={handleNoteChange}/>
        <button tpye="submit">save</button>
      </form>
      <Footer/>
    </div>
  )
}

export default App