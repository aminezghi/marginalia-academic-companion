<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Marginalia Academic Companion & Reading Studio

A modern, editorial personal academic knowledge companion built with Google AI Studio. Features immersive bookshelf archive, research assistant powered by Gemini AI, DOI metadata resolution, and literature synthesis tools.

**View in AI Studio:** https://ai.studio/apps/54bae8b1-3327-4418-8e60-cab41a61fce3

## Features

- **Physical Bookshelf Archive** - Interactive vintage bookshelf with 3D visualization
- **AI Research Assistant** - Ask questions about your research library (requires Gemini API key)
- **DOI Metadata Resolution** - Automatically fetch paper metadata via Crossref
- **Dedicated Reader** - Immersive paper reading experience with highlights
- **Research Notebook** - Write and organize literature notes
- **Reading Tracker** - Track progress and set reading goals
- **Collections & Tags** - Organize papers into custom collections
- **Mobile Responsive** - Full mobile support with bottom navigation

## AI Features & API Key Requirement

The AI Research Assistant requires a valid Gemini API key from [Google AI Studio](https://aistudio.google.com/).

**Without a valid API key:**
- The AI assistant button will show a prompt to get an API key
- Local synthesis fallback is available for basic functionality

**To get a free API key:**
1. Visit https://aistudio.google.com/
2. Sign in with your Google account
3. Create a new API key
4. Set it in your environment as `GEMINI_API_KEY`

## Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Create .env file with your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run development server
npm run dev
# Visit http://localhost:3000
```

## Deploy to Production

```bash
# Build the application
npm run build

# Deploy the /deploy folder which contains:
# - dist/ (compiled static assets)
# - server.cjs (production Express server)
# - package.json (deployment dependencies)

# From the deploy folder:
cd deploy
npm install
node server.cjs
```

## Project Structure

```
├── src/                    # React source code
│   ├── components/        # UI components
│   ├── data/              # Sample research data
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── server.ts              # Development server (with Vite)
├── deploy/
│   ├── server.cjs         # Production server
│   ├── package.json       # Deploy dependencies
│   ├── dist/              # Built static assets
│   └── .env               # API key configuration
└── index.html             # Entry point
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI features | Recommended |
| `APP_URL` | Base URL for the application | Optional |
| `PORT` | Server port (default: 3000) | No |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gemini-status` | GET | Check if Gemini API is configured |
| `/api/health` | GET | Health check endpoint |
| `/api/doi` | GET | Resolve DOI to metadata |
| `/api/ai/ask` | POST | Ask AI research assistant |

## Testing

After starting the server, test the endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# Gemini status
curl http://localhost:3000/api/gemini-status

# DOI resolution
curl "http://localhost:3000/api/doi?doi=10.1038/s41586-020-2649-2"

# AI assistant (with papers)
curl -X POST http://localhost:3000/api/ai/ask \
  -H "Content-Type: application/json" \
  -d '{"query":"summarize", "papers": [...], "mode":"summarize"}'
```
