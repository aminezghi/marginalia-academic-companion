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

**Prerequisites:** Node.js 24, Java 21, npm, and Git. The local Firebase Auth, Firestore and Storage emulators run on ports 9099, 8080 and 9199.

Windows PowerShell:

```powershell
# Install the exact dependency versions from the lockfile
npm ci

# Create .env only if one is not already present, then set the Firebase project
# to marginalia-test-emulator and VITE_USE_FIREBASE_EMULATORS=true.
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad .env

# Start the app and only the dedicated local test emulators
npm run dev:local
```

Open http://localhost:3000. Press Ctrl+C in the same terminal to stop the app and emulators. Add a valid `GEMINI_API_KEY` to `.env` to enable the online Gemini features; the key is optional for the rest of the local app. Do not put production Firebase settings in `.env` when using `dev:local`.

## Windows Desktop Installer

The Windows installer is emulator-only and stores its Auth, Firestore, and PDF Storage data on this PC. It never connects to the production Firebase project. Email/password accounts created in the desktop app are local emulator accounts; Google sign-in uses the emulator flow and is not a real Google account connection. This is intended for local use, not cross-device sync.

Requirements for building the installer: Windows x64, Node/npm, the root dependencies installed, the cached Firebase emulator downloads, and a Java 21 JDK. The installer builder bundles the Java runtime and Firebase emulator files, so end users do not need Node.js or Java. Build PowerShell:

```powershell
npm ci
npm --prefix desktop ci
npm run desktop:windows
```

The build refuses to proceed unless the existing `.env` selects `marginalia-test-emulator` and enables the emulators. The installer is written to `artifacts/windows/Marginalia-Setup-1.0.0-x64.exe`. User data persists in the Windows app-data folder after closing the app. DOI lookup requires an internet connection. The optional AI workspace stays locked until a Gemini key is entered; the Windows app protects the key with Windows secure storage. AI requests send the user's question and selected paper metadata/abstract to Google Gemini.

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
