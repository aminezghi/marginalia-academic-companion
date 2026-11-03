# Release Checklist: Marginalia Academic Companion

## Pre-Release Verification

### ✓ Verified (Can Deploy)
- [x] Application starts reliably
- [x] Health check endpoint (`/api/health`) works
- [x] All API endpoints respond correctly
- [x] Static files served properly
- [x] Build completes without errors
- [x] TypeScript compilation passes
- [x] AI endpoint with fallback works

### ⚠ Partially Verified
- [x] DOI resolution works with fallback for unavailable metadata
- [x] AI features require valid API key (tested with prompt)
- [ ] Mobile responsiveness - NOT TESTED in this environment
- [ ] User isolation - N/A (no authentication system)
- [ ] Performance with large libraries - NOT TESTED

### ❌ Not Implemented / Blocked
- [ ] Database backend - LocalStorage only (by design)
- [ ] User authentication - Not required for single-user app
- [] PDF text extraction - Simulated reader only
- [ ] Email notifications - N/A
- [ ] File uploads - Not implemented

## Production Readiness

### Application Startup
- [x] Development server starts
- [x] Production build completes
- [ ] Process management configured (recommend: PM2 or similar)
- [ ] Environment variables documented

### Core Features
- [x] Bookshelf/archive navigation
- [x] Research library browsing
- [x] Paper detail view
- [ ] PDF reader - simulated only
- [x] Notes creation/edit
- [x] Reading tracker
- [x] Collections management
- [x] DOI import with fallback
- [x] AI assistant (with API key prompt)

### Data Persistence
- [x] Library saves to localStorage
- [x] Settings persist
- [x] Notes persist
- [ ] Server-side backup (N/A - client only)

### Security
- [x] No secrets in source code
- [x] No exposed API keys
- [ ] Authentication (by design)
- [ ] Rate limiting (not critical for SPA)

## Deployment Steps

1. **Build**
   ```bash
   npm run build
   ```

2. **Prepare deploy folder**
   ```bash
   # Files in deploy/
   server.cjs     # Compiled server
   dist/          # Static assets
   .env           # Environment (set GEMINI_API_KEY)
   package.json   # Dependencies
   ```

3. **Install dependencies**
   ```bash
   cd deploy
   npm install --production
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env to add your GEMINI_API_KEY
   ```

5. **Start server**
   ```bash
   node server.cjs
   # or with process manager:
   pm2 start server.cjs
   ```

## Environment Variables Required

| Variable | Value | Notes |
|----------|-------|-------|
| GEMINI_API_KEY | Your key | Optional - app works in fallback mode |
| PORT | 3000 | Optional - defaults to 3000 |

## Known Limitations for Production

1. **No Database**: All data stored client-side. Users lose data when clearing browser.
2. **No Authentication**: Single-user application.
3. **No Real PDF Processing**: PDF reader is visual simulation.
4. **Rate Limits**: Crossref API has usage limits (~50k/month free).
5. **AI Costs**: Gemini API has usage limits and potential costs.

## Post-Deployment Validation

Run from your server after deployment:
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/gemini-status
```

Expected responses:
- Health: `{"status":"ok","apiConfigured":true/false,...}`
- Gemini Status: `{"configured":true/false,"requiresKey":true/false,...}`

## Checklist Status: READY FOR DEPLOYMENT

The application is functional and deployable. Key limitations are documented above.
