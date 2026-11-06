# Implementation Log: Marginalia Academic Companion

## Files Changed

### 1. deploy/server.ts
**Action**: Updated with complete API endpoints
**Changes**:
- Added `gemini-status` endpoint
- Added `health` endpoint  
- Added full `ai/ask` endpoint with Gemini integration
- Added GoogleGenAI import

### 2. deploy/server.cjs
**Action**: Compiled from server.ts
**Purpose**: Production-ready server for Node.js

### 3. deploy/package.json
**Action**: Created new
**Purpose**: Define production dependencies

### 4. README.md
**Action**: Completely rewritten
**Changes**:
- Added feature overview
- Documented AI API key requirements
- Added local development instructions
- Added deployment instructions
- Added API endpoint reference

### 5. deploy/README.md
**Action**: Created new
**Purpose**: Deployment-specific documentation

## Implementation Decisions

1. **API Key Placeholder**: Used `test_key_for_development` - app correctly falls back to local synthesis when key is invalid

2. **Fallback Mode**: AI assistant works without valid key using keyword-based local synthesis

3. **No Database**: Kept localStorage-only approach as per original design

4. **Vite Configuration**: Kept warning about `__dirname` usage but did not modify (works correctly)

## Bug Fixes

1. **Missing API Endpoints**: deploy/server.ts was incomplete - now has all required endpoints

2. **AI Status Check**: Frontend now correctly checks `/api/gemini-status` on mount

3. **Api Key Prompt**: Shows when `isAiConfigured` is false

## Dependencies Added/Removed

### Added to deploy/
- @google/genai
- dotenv
- express

### No removal needed - existing dependencies are appropriate

## Important Fixes

1. **Server.cjs compilation**: Fixed by using correct esbuild command with bundle option

2. **API endpoint ordering**: Static file serving now comes after API routes

3. **Environment variable loading**: dotenv.config() called before endpoints

## Build Commands Used

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build frontend
npm run build

# Compile server for deploy
cd deploy
npx esbuild server.ts --format=cjs --bundle --outfile=server.cjs --platform=node
```

## Testing Commands

```bash
# API tests
curl http://localhost:3000/api/health
curl http://localhost:3000/api/gemini-status
curl "http://localhost:3000/api/doi?doi=10.1038/s41586-020-2649-2"
curl -X POST http://localhost:3000/api/ai/ask -H "Content-Type: application/json" -d '{"query":"test"}'
```

## Timestamp
2026-11-02 - Initial deployment preparation and documentation
