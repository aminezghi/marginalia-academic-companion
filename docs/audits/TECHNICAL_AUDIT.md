# Technical Audit: Marginalia Academic Companion

## Executive Summary

This is a modern React/Vite-based academic knowledge companion built with Google AI Studio integration. The application uses client-side persistence (localStorage) and lacks a traditional database backend. All core features are functional with the exception of requiring a valid Gemini API key for full AI features.

## Architecture Assessment

### Frontend
- **Framework**: React 19.0.1 with TypeScript
- **Build Tool**: Vite 8.3.5
- **Styling**: TailwindCSS 4.3.3
- **UI Components**: Custom components with lucide-react icons
- **State Management**: React hooks (useState, useEffect, useCallback, useMemo)

### Backend
- **Development**: tsx (TypeScript execution)
- **Production**: Node.js with Express
- **API Routes**: RESTful endpoints for DOI resolution, AI queries, health checks

### Dependencies
```
Production:
- @google/genai@2.4.0 (AI integration)
- express@4.21.2 (server)
- dotenv@17.2.3 (environment)
- lucide-react@0.546.0 (icons)
- motion@12.23.24 (animations)

Development:
- vite@8.3.5 (build)
- @vitejs/plugin-react@6.1.1 (React plugin)
- tailwindcss@4.3.3 (CSS)
- typescript@7.0.2
- tsx@4.21.0 (dev server)
```

### Data Storage
- **No database**: Uses browser localStorage exclusively
- **Keys**: academic_archive_*_v2/v3, marginalia_shelf_*
- **Limitations**: Data lost on browser reset, no server-side persistence

## Database Assessment

**No database present.** All data is stored client-side in browser localStorage:
- Research items, collections, notes, highlights
- Reading sessions, goals, activities
- User preferences (shelf material, sort mode)

## Backend Assessment

### API Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/health` | GET | Health check | ✅ Working |
| `/api/gemini-status` | GET | AI config status | ✅ Working |
| `/api/doi` | GET | DOI metadata resolution | ✅ Working (fallback implemented) |
| `/api/ai/ask` | POST | AI research assistant | ✅ Working (with fallback) |

### Backend Issues Found

1. **Missing database**: No server-side persistence means data is lost on page refresh or browser clear
2. **No authentication**: No user accounts or login system
3. **No rate limiting**: External API calls could be abused

## Frontend Assessment

### Working Components
- ✅ Bookshelf archive with 3D visualization
- ✅ Research catalog/library view
- ✅ Dedicated PDF reader simulation
- ✅ Notes system
- ✅ Reading tracker
- ✅ Collections manager
- ✅ Category tabs
- ✅ Import modal (DOI, BibTeX placeholder)
- ✅ AI assistant interface

### Areas of Concern

1. **API Key Enforcement**: AI features show prompt but user can still interact with AI if `isAiConfigured` is true
2. **No real PDF processing**: PDF reader is simulated, no actual text extraction
3. **Mobile responsiveness**: Needs verification
4. **Performance**: Large libraries may cause issues with 3D bookshelf

## Security Assessment

### Issues Found
- ❌ No backend authentication
- ❌ No input validation on API endpoints
- ❌ No CSRF protection (not critical for SPA)
- ✅ No exposed secrets in source code
- ⚠️ Test API key in .env files (expected for development)

## Performance Assessment

### Bundle Sizes
- JS: ~740KB (gzipped ~208KB)
- CSS: ~66KB (gzipped ~12KB)
- Large but acceptable for feature-rich app

### Bookshelf Performance
- Uses virtualized rendering for large collections
- Smooth animations with CSS transforms
- Needs testing with 100+ books

## Technical Debt

1. **localStorage Only**: No server-side persistence
2. **No Authentication**: Single-user experience only
3. **Test API Key**: Falls back to local synthesis (good design)
4. **Vite Warning**: Using `__dirname` instead of `import.meta.dirname`

## Known Limitations

1. PDF functionality is simulated (no actual PDF rendering)
2. No database backend - all data in localStorage
3. AI features require valid Gemini API key
4. DOI resolution uses Crossref API (may fail for some DOIs)
