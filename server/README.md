# StudyBridge Backend Server

Backend API server for StudyBridge that handles Google Gemini API calls.

## Setup Instructions

### 1. Install Dependencies

Open a terminal in the **server** folder and run:

```bash
cd server
npm install
```

### 2. Configure Environment Variables

1. Open the `.env` file in the server folder
2. Replace `your_api_key_here` with your actual Gemini API key:

```env
GEMINI_API_KEY=your-gemini-api-key-here
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Get your Gemini API key:**
- Go to https://aistudio.google.com/app/apikey
- Create a new API key
- Copy and paste it into the `.env` file

### 3. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

You should see:
```
StudyBridge API server running on http://localhost:3001
Environment: development
Gemini API Key: ✓ Configured
CORS enabled for: http://localhost:5173
```

## API Endpoints

### POST /api/process-notes

Processes raw lecture notes using Google Gemini.

**Request:**
```json
{
  "rawNotes": "Your lecture notes here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": "Comprehensive summary...",
    "glossary": [
      {
        "term": "Term name",
        "definition": "Definition",
        "usage": "Example usage"
      }
    ],
    "memoryLinks": [
      "Key point to remember",
      "Important concept"
    ]
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-05T10:00:00.000Z",
  "env": "development"
}
```

## Running Both Frontend and Backend

You need **two terminals**:

**Terminal 1 (Frontend):**
```bash
# In root folder
npm run dev
```

**Terminal 2 (Backend):**
```bash
# In server folder
cd server
npm start
```

## Security Notes

- **NEVER** commit your `.env` file with your actual API key
- The `.env.example` file shows the structure without sensitive data
- In production, use proper environment variable management
- The API key is kept secure on the server side, never exposed to the browser

## Troubleshooting

**Server won't start:**
- Make sure you're in the `server` folder
- Check that all dependencies are installed (`npm install`)
- Verify your Gemini API key is valid

**CORS errors:**
- Make sure the FRONTEND_URL in `.env` matches your React app's URL
- Default is `http://localhost:5173` for Vite

**AI processing fails:**
- Check the server console for detailed error messages
