import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function App() {
  const [videoId, setVideoId] = useState('');
  const [video, setVideo] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Note form states
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    tags: ''
  });
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load video data
  const loadVideo = async () => {
    if (!videoId.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_BASE}/video/${videoId}`);
      setVideo(response.data);
      await loadNotes();
    } catch (err) {
      setError('Failed to load video. Check your video ID and API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load notes
  const loadNotes = async () => {
    if (!videoId.trim()) return;
    
    try {
      const response = await axios.get(`${API_BASE}/notes/${videoId}`, {
        params: searchTerm ? { search: searchTerm } : {}
      });
      setNotes(response.data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  // Create or update note
  const saveNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      const noteData = {
        videoId,
        title: noteForm.title,
        content: noteForm.content,
        tags: noteForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      if (editingNote) {
        await axios.put(`${API_BASE}/notes/${editingNote._id}`, noteData);
      } else {
        await axios.post(`${API_BASE}/notes`, noteData);
      }

      setNoteForm({ title: '', content: '', tags: '' });
      setEditingNote(null);
      await loadNotes();
    } catch (err) {
      alert('Failed to save note');
      console.error(err);
    }
  };

  // Delete note
  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await axios.delete(`${API_BASE}/notes/${noteId}`);
      await loadNotes();
    } catch (err) {
      alert('Failed to delete note');
      console.error(err);
    }
  };

  // Edit note
  const editNote = (note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content,
      tags: note.tags.join(', ')
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingNote(null);
    setNoteForm({ title: '', content: '', tags: '' });
  };

  // Search notes
  useEffect(() => {
    if (videoId) {
      const timeoutId = setTimeout(loadNotes, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, videoId]);

  return (
    <div className="app">
      <header className="header">
        <h1>YouTube Companion Dashboard</h1>
      </header>

      <main className="main">
        {/* Video ID Input */}
        <section className="video-input">
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter YouTube Video ID"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadVideo()}
            />
            <button onClick={loadVideo} disabled={loading}>
              {loading ? 'Loading...' : 'Load Video'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </section>

        {video && (
          <>
            {/* Video Details */}
            <section className="video-details">
              <h2>Video Details</h2>
              <div className="video-info">
                <h3>{video.snippet.title}</h3>
                <p><strong>Channel:</strong> {video.snippet.channelTitle}</p>
                <p><strong>Published:</strong> {new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
                <p><strong>Views:</strong> {video.statistics.viewCount?.toLocaleString()}</p>
                <p><strong>Likes:</strong> {video.statistics.likeCount?.toLocaleString()}</p>
                <div className="description">
                  <strong>Description:</strong>
                  <p>{video.snippet.description.substring(0, 200)}...</p>
                </div>
                <div className="thumbnail">
                  <img src={video.snippet.thumbnails.medium.url} alt="Video thumbnail" />
                </div>
              </div>
            </section>

            {/* Notes Section */}
            <section className="notes-section">
              <h2>Notes & Ideas</h2>
              
              {/* Search */}
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Note Form */}
              <div className="note-form">
                <h3>{editingNote ? 'Edit Note' : 'Add New Note'}</h3>
                <input
                  type="text"
                  placeholder="Note title"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                />
                <textarea
                  placeholder="Note content"
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                  rows="4"
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={noteForm.tags}
                  onChange={(e) => setNoteForm({...noteForm, tags: e.target.value})}
                />
                <div className="form-buttons">
                  <button onClick={saveNote}>
                    {editingNote ? 'Update Note' : 'Add Note'}
                  </button>
                  {editingNote && (
                    <button onClick={cancelEdit} className="cancel">Cancel</button>
                  )}
                </div>
              </div>

              {/* Notes List */}
              <div className="notes-list">
                {notes.length === 0 ? (
                  <p>No notes yet. Add your first note above!</p>
                ) : (
                  notes.map(note => (
                    <div key={note._id} className="note-card">
                      <div className="note-header">
                        <h4>{note.title}</h4>
                        <div className="note-actions">
                          <button onClick={() => editNote(note)} className="edit">Edit</button>
                          <button onClick={() => deleteNote(note._id)} className="delete">Delete</button>
                        </div>
                      </div>
                      <p className="note-content">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="note-tags">
                          {note.tags.map(tag => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      <p className="note-date">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;