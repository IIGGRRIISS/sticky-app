import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('sticky-notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [passwordInputs, setPasswordInputs] = useState({});

  useEffect(() => {
    localStorage.setItem('sticky-notes', JSON.stringify(notes));
  }, [notes]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const addNote = () => {
    if (newTitle.trim() === '' || newContent.trim() === '') return;

    const note = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      password: newPassword.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes([note, ...notes]);
    setNewTitle('');
    setNewContent('');
    setNewPassword('');
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const editNote = (id) => {
    const noteToEdit = notes.find((note) => note.id === id);
    const updatedTitle = prompt('Edit Title', noteToEdit.title);
    const updatedContent = prompt('Edit Content', noteToEdit.content);

    if (updatedTitle !== null && updatedContent !== null) {
      const updatedNotes = notes.map((note) =>
        note.id === id
          ? { ...note, title: updatedTitle, content: updatedContent }
          : note
      );
      setNotes(updatedNotes);
    }
  };

  const handlePasswordKeyPress = (e, note) => {
    if (e.key === 'Enter') {
      const enteredPassword = passwordInputs[note.id] || '';
      if (enteredPassword === note.password) {
        // Do nothing — correct password; component will re-render to show content
      } else {
        alert('Wrong password!');
        setPasswordInputs((prev) => ({ ...prev, [note.id]: '' }));
      }
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <div className="app">
        <div className="toggle-btn">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="container">
          <h1>Sticky Notes 📝</h1>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="input-area">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Note title"
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Note content"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Optional password"
              className="password-input"
            />
            <button onClick={addNote}>Add Note</button>
          </div>

          <div className="notes-container">
            {filteredNotes.length === 0 ? null : (
              filteredNotes.map((note) => (
                <div key={note.id} className="note">
                  <div className="note-header">
                    <h3>{note.title}</h3>
                    <div className="note-actions">
                      <button onClick={() => editNote(note.id)}>✏️</button>
                      <button onClick={() => deleteNote(note.id)}>🗑️</button>
                    </div>
                  </div>
                  <p className="note-date">{formatDate(note.createdAt)}</p>

                  {note.password ? (
                    passwordInputs[note.id] === note.password ? (
                      <p className="note-content">
                        <strong>Title:</strong> {note.title}
                        <br />
                        <strong>Content:</strong> {note.content}
                      </p>
                    ) : (
                      <>
                        <p className="note-password-label">Enter password to view the content:</p>
                        {(() => {
                          const actualValue = passwordInputs[note.id] || '';
                          const maskedValue =
                            actualValue.length > 1
                              ? '●'.repeat(actualValue.length - 1) +
                                actualValue.slice(-1)
                              : actualValue;

                          return (
                            <input
                              type="text"
                              value={maskedValue}
                              onKeyDown={(e) => handlePasswordKeyPress(e, note)}
                              onChange={(e) => {
                                const maskedInput = e.target.value;
                                const prevActual = passwordInputs[note.id] || '';
                                let updatedActual = prevActual;

                                if (maskedInput.length > maskedValue.length) {
                                  updatedActual = prevActual + maskedInput.slice(-1);
                                } else {
                                  updatedActual = prevActual.slice(0, -1);
                                }

                                setPasswordInputs({
                                  ...passwordInputs,
                                  [note.id]: updatedActual,
                                });
                              }}
                            />
                          );
                        })()}
                      </>
                    )
                  ) : (
                    <p className="note-content">
                      <strong>Title:</strong> {note.title}
                      <br />
                      <strong>Content:</strong> {note.content}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
