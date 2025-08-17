# YouTube Companion Dashboard

A mini-dashboard that connects to the YouTube API to help users manage their uploaded videos with detailed analytics and note-taking functionality.

## 🌐 Live Demo

- **Frontend**: https://yt-comp-dash.vercel.app
- **Backend API**: https://yt-comp-dash-server.onrender.com

## ✅ Completed Features

- ✅ Display video details via YouTube API
- ✅ Notes management system (CRUD operations)
- ✅ Search functionality with tags
- ✅ Event logging system  
- ✅ Responsive design
- ✅ Deployed and live

## 🚀 How to Use

1. Visit the live demo URL above
2. Enter a YouTube video ID (try: `dQw4w9WgXcQ`)
3. Click "Load Video" to see video details
4. Add notes with titles, content, and tags
5. Use search to find specific notes
6. Edit/delete notes as needed

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express.js + MongoDB
- **APIs**: YouTube Data API v3
- **Deployment**: Vercel (Frontend) + Render (Backend)

## Quick Setup

### 1. Clone and Install
```bash
# Backend
mkdir youtube-companion-backend
cd youtube-companion-backend
npm init -y
# Copy backend package.json and install dependencies

# Frontend  
npm create vite@latest youtube-companion-frontend -- --template react
cd youtube-companion-frontend
# Copy frontend package.json and install dependencies
```

### 2. Environment Setup
```bash
# Backend .env
YOUTUBE_API_KEY=your_api_key_here
MONGODB_URI=your_mongodb_connection_string
PORT=5000

# Frontend .env
VITE_API_BASE=http://localhost:5000/api
```

### 3. Get YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project → Enable YouTube Data API v3
3. Create credentials → API Key
4. Restrict to YouTube Data API v3

### 4. Database Setup
MongoDB Atlas (Recommended)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string


### 5. Run Development
```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2) 
cd frontend
npm run dev
```

## API Endpoints

### Video Management
- `GET /api/video/:videoId` - Get video details
- `GET /api/comments/:videoId` - Get video comments

### Notes Management
- `GET /api/notes/:videoId` - Get all notes for video
- `GET /api/notes/:videoId?search=term` - Search notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Event Logging
- `GET /api/logs/:videoId` - Get event logs for video

## Database Schema

### Notes Collection
```javascript
{
  _id: ObjectId,
  videoId: String,        // YouTube video ID
  title: String,          // Note title
  content: String,        // Note content
  tags: [String],         // Array of tags
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

### Event Logs Collection
```javascript
{
  _id: ObjectId,
  action: String,         // Action performed (e.g., 'video_viewed', 'note_created')
  videoId: String,        // YouTube video ID
  details: Mixed,         // Additional action details
  timestamp: Date         // When action occurred
}
```

## Usage Instructions

### 1. Upload Video to YouTube
- Upload an unlisted video to your YouTube channel
- Copy the video ID from the URL (e.g., `dQw4w9WgXcQ`)

### 2. Load Video in Dashboard
- Paste video ID in the input field
- Click "Load Video" to fetch details

### 3. Manage Notes
- Add notes with titles, content, and tags
- Use search to find specific notes
- Edit or delete notes as needed

### 4. Monitor Activity
- All actions are automatically logged
- View logs via `/api/logs/:videoId` endpoint