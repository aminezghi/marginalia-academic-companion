# Marginalia Academic Companion - Deploy Folder

This folder contains the production-ready version of the Marginalia Academic Companion.

## Quick Start

```bash
# Install production dependencies
npm install

# Set your Gemini API key (optional for AI features)
echo "GEMINI_API_KEY=your_key_here" > .env

# Start the server
npm start
```

The app will be available at http://localhost:3000

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | (none) |
| `PORT` | Server port | 3000 |

## API Endpoints

- `GET /api/health` - Health check (returns API key status)
- `GET /api/gemini-status` - Check if Gemini API is configured
- `GET /api/doi?doi=...` - Resolve DOI to metadata
- `POST /api/ai/ask` - AI research assistant

## AI Features Note

Without a valid GEMINI_API_KEY, the AI assistant will:
1. Show an ApiKeyPrompt when users try to use AI features
2. Fall back to local synthesis for the `/api/ai/ask` endpoint
3. Users can get a free key at https://aistudio.google.com/

## File Structure

```
deploy/
├── server.cjs     # Production Express server
├── server.ts      # Server source code
├── package.json   # Dependencies
├── package-lock.json
├── .env          # Environment variables (API key)
├── dist/         # Built static assets
│   ├── index.html
│   └── assets/
│       ├── index-*.js
│       └── index-*.css
└── README.md
```

## Production Deployment

For production deployment, you may want to:

1. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.cjs
   ```

2. Use a reverse proxy like Nginx for SSL termination

3. Set a proper GEMINI_API_KEY in the environment

4. Configure the PORT environment variable if needed
