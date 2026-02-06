# StudyBridge

## [[StudyBridge Progressive Web App](https://studybridge-ai.vercel.app/)]

> AI-powered study companion that transforms lecture notes into structured study materials for IT students.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22-green.svg)](https://nodejs.org/)
[![Gemini API](https://img.shields.io/badge/Google-Gemini%20AI-orange.svg)](https://ai.google.dev/)

## Overview

StudyBridge is a Progressive Web App (PWA) designed for IT students to efficiently organize their courses, capture lecture notes, and generate AI-powered study materials. The app works offline-first with online AI processing capabilities.

### Key Features

- **Course Management** - Organize courses with schedules, venues, and instructors
- **Note Taking** - Capture raw lecture notes with session titles
- **AI Processing** - Generate glossaries, summaries, and memory links using Google Gemini
- **Study Bank** - Browse and review AI-generated study materials by course
- **PWA Support** - Install on mobile devices for offline access
- **Dark/Light Mode** - Automatic theme based on system preferences

## Architecture

```
studybridge/
├── src/                          # React frontend (Vite)
│   ├── pages/                    # Page components
│   │   ├── dashboard/            # Main dashboard with course overview
│   │   ├── sessions/             # Note-taking interface
│   │   ├── studybank/            # AI-generated study materials
│   │   ├── settings/             # Course & app settings
│   │   └── onboarding/           # First-time user welcome
│   ├── services/                 # Business logic
│   │   ├── aiService.js          # Backend API communication
│   │   └── storageService.js     # localStorage CRUD
│   └── utils/                    # Configuration & helpers
│
└── server/                       # Node.js backend (Express)
    ├── routes/                   
    │   └── aiRoutes.js           # Google Gemini API integration
    └── server.js                 # Express server setup
```

## Quick Start

### Prerequisites

- Node.js 22+ installed
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/Handson-A/studybridge.git
cd studybridge
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create `.env` file in `/server`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Setup Frontend

In a **new terminal**, from project root:

```bash
npm install
npm run dev
```

### 4. Open the App

Navigate to `http://localhost:5173` in your browser.

## Usage Guide

### First Time Setup

1. **Onboarding** - You'll see a welcome screen explaining features
2. **Add Course** - Go to Settings and add your first course (e.g., "Digital Forensics 101")
3. **Set Schedule** - Add class times, venue, and instructor details

### Taking Notes

1. From Dashboard, click **+ Add Notes** on a course card
2. Create a new session with a title (e.g., "Week 1 - Introduction")
3. Write or paste your lecture notes
4. Click **Process with AI** (requires internet connection)

### Viewing Study Materials

1. Click **Study Bank** from Dashboard
2. Select a course to view its study materials
3. Browse **Glossary**, **Summary**, and **Memory Link** tabs
4. Use Print PDF or Copy JSON buttons to export

## Data Storage

- **Frontend**: Uses browser `localStorage` - all data stays on your device
- **Backend**: Stateless - does not store any user data
- **Privacy**: Your notes never leave your device except for AI processing requests

## Development

### Frontend Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **CSS Modules** - Component-scoped styling
- **PWA** - Service worker for offline support

### Backend Stack

- **Express 4** - Web framework
- **Google Generative AI SDK** - Gemini integration
- **CORS** - Cross-origin requests
- **dotenv** - Environment variables

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

**Backend:**
```bash
npm start            # Start server
npm run dev          # Start with auto-reload (--watch)
```

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3001
```

### Backend (`server/.env`)

```env
GEMINI_API_KEY=your-api-key-here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Known Issues & Limitations

- Backend exits with code 1 occasionally (non-critical, AI processing works)
- Gemini API requires active internet connection
- Free tier Gemini API has rate limits (15 requests/minute)
- localStorage has ~5-10MB limit depending on browser

## Future Enhancements

- [ ] Cloud sync for multi-device access
- [ ] User authentication
- [ ] Share study materials with classmates
- [ ] Export to PDF/Markdown
- [ ] Spaced repetition reminders
- [ ] Edit and regenerate AI content
- [ ] Batch process multiple sessions
- [ ] Service worker for offline Study Bank viewing

## Contributing

This is a personal project for IT students. Feel free to fork and customize for your needs.

## License

none

## Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/Handson-A/studybridge/issues)
- Email: Contact via GitHub profile

## Acknowledgments

- Google Gemini API for AI processing
- React & Vite communities
- Icon designs from system emojis

---

Built with AI for IT students 