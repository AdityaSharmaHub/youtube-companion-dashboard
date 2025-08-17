const config = require('./config');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(config.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const noteSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  content: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const eventLogSchema = new mongoose.Schema({
  action: String,
  videoId: String,
  details: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);
const EventLog = mongoose.model('EventLog', eventLogSchema);

// Helper function to log events
const logEvent = async (action, videoId, details = {}) => {
  try {
    await EventLog.create({ action, videoId, details });
  } catch (error) {
    console.error('Event logging error:', error);
  }
};

// YouTube API Routes
app.get('/api/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    
    if (!config.YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }
    
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,statistics,status',
        id: videoId,
        key: config.YOUTUBE_API_KEY
      }
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await logEvent('video_viewed', videoId);
    res.json(response.data.items[0]);
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ error: 'Failed to fetch video data' });
  }
});

app.get('/api/comments/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/commentThreads`, {
      params: {
        part: 'snippet,replies',
        videoId: videoId,
        key: config.YOUTUBE_API_KEY,
        maxResults: 20
      }
    });

    await logEvent('comments_viewed', videoId);
    res.json(response.data);
  } catch (error) {
    console.error('Comments API error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Notes CRUD Routes
app.get('/api/notes/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { search } = req.query;
    
    let query = { videoId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });
    await logEvent('notes_viewed', videoId, { search });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { videoId, title, content, tags } = req.body;
    const note = new Note({
      videoId,
      title,
      content,
      tags: tags || []
    });
    
    await note.save();
    await logEvent('note_created', videoId, { noteId: note._id });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    
    const note = await Note.findByIdAndUpdate(
      id,
      { title, content, tags, updatedAt: new Date() },
      { new: true }
    );
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    await logEvent('note_updated', note.videoId, { noteId: id });
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findByIdAndDelete(id);
    
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    await logEvent('note_deleted', note.videoId, { noteId: id });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Comments management routes
app.post('/api/comments/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text } = req.body;
    
    // Note: This requires OAuth2 authentication for actual posting
    // For demo purposes, we'll simulate the comment creation
    const simulatedComment = {
      id: 'demo_' + Date.now(),
      snippet: {
        textDisplay: text,
        authorDisplayName: 'Demo User',
        publishedAt: new Date().toISOString()
      }
    };
    
    await logEvent('comment_added', videoId, { text });
    res.json(simulatedComment);
  } catch (error) {
    console.error('Comment creation error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

app.delete('/api/comments/:videoId/:commentId', async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    
    // Note: This requires OAuth2 authentication for actual deletion
    // For demo purposes, we'll simulate the deletion
    await logEvent('comment_deleted', videoId, { commentId });
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Comment deletion error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Video editing routes
app.put('/api/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;
    
    // Note: This requires OAuth2 authentication for actual editing
    // For demo purposes, we'll simulate the update
    const updatedVideo = {
      id: videoId,
      snippet: {
        title: title,
        description: description,
        updatedAt: new Date().toISOString()
      }
    };
    
    await logEvent('video_updated', videoId, { title, description });
    res.json(updatedVideo);
  } catch (error) {
    console.error('Video update error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Event logs route
app.get('/api/logs/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const logs = await EventLog.find({ videoId }).sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});