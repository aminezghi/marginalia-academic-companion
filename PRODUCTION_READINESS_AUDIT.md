# Production Readiness Audit - Marginalia Academic Companion

**Date:** 2026-11-04
**Auditor:** Codex Agent
**Project:** Marginalia Academic Knowledge Companion

---

## 1. Architecture Assessment

### Frontend (Vite + React)
| Component | Status | Notes |
|-----------|--------|-------|
| Vite Build | ✅ READY | `npm run build` produces working `/dist` directory |
| React SPA | ✅ READY | Single-page application with client-side routing |
| Environment Variables | ✅ READY | Uses `VITE_` prefix correctly for client-side vars |
| Build Output | ✅ READY | Static assets in `dist/` directory |

### Backend (Express + Vite Middleware)
| Component | Status | Notes |
|-----------|--------|-------|
| Server Framework | ⚠️ NEEDS CONFIGURATION | Express server requires Vercel Functions rewrite |
| API Routes | ✅ READY | DOI resolution, health check, Gemini status |
| File Upload Size | ✅ READY | 20MB limit configured |
| Long-running Processes | ⚠️ NEEDS ATTENTION | DOI fetching with external APIs |
| Server-side Rendering | ✅ READY | Vite middleware mode for SSR-like dev experience |

### Firebase Services
| Service | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ READY | Google + Email/Password configured |
| Firestore | ✅ READY | Security rules validated (103 tests passing) |
| Storage | ✅ READY | Security rules validated (41 tests passing) |

---

## 2. Firebase Production Configuration

### Authentication Providers
| Provider | Status | Configuration Required |
|----------|--------|----------------------|
| Google Sign-In | ✅ READY | Already configured in rules |
| Email/Password | ✅ READY | Already configured in rules |
| Password Reset | ⚠️ NEEDS DEVELOPMENT | No visible UI in application |
| Anonymous/Guest | ✅ READY | Local storage guest mode implemented |

### Authorized Domains
| Domain | Status | Configuration Required |
|--------|--------|------|
| localhost:3000 | ✅ READY | For development |
| marginalia.academic | ⚠️ NEEDS CONFIGURATION | Add to Firebase console |
| *.vercel.app | ⚠️ NEEDS CONFIGURATION | Vercel preview URLs |

### Firestore Database
| Item | Status | Notes |
|------|--------|-------|
| Database Mode | ✅ READY | Production database created |
| Indexes | ⚠️ NEEDS CONFIGURATION | `firestore.indexes.json` exists but may need production tuning |
| Data Structure | ✅ READY | Subcollections for papers, collections, notes, highlights, goals, activities |
| Size Limits | ⚠️ NEEDS MONITORING | No size limits configured |

### Security Rules
| File | Status | Tests Passing |
|------|--------|---------------|
| firestore-emulator.rules | ✅ READY | 34/34 tests pass |
| storage-emulator.rules | ✅ READY | 41/41 tests pass |

**Key Security Rules Verified:**
- ✅ PDF: Private, owner-only with timestamp/UUID filename validation
- ✅ Avatars: Public read, owner-write with PNG/size validation (2MB max)
- ✅ Covers: Private, owner-only with JPEG validation (5MB max)
- ✅ Default deny: All other paths rejected
- ✅ Cross-user isolation: Enforced at document/collection level

### Storage Configuration
| Item | Status | Notes |
|------|--------|-------|
| Bucket Location | ⚠️ NEEDS CONFIGURATION | Default bucket created |
| File Validation | ✅ READY | MIME type, size, filename validated |
| Public Access | ✅ REVIEWED | Avatars are public-read by design (intentional) |
| CDN/Caching | ⚠️ NEEDS CONFIGURATION | Not configured |

---

## 3. Multi-User Readiness

### Registration & Authentication
| Feature | Status | Details |
|---------|--------|---------|
| Email Registration | ✅ READY | Tests passing with validation |
| Google Sign-In | ✅ READY | Provider configured |
| Password Reset | ⚠️ NEEDS DEVELOPMENT | No UI implementation found |
| Session Persistence | ✅ READY | Tested with page refresh |
| Token Refresh | ✅ READY | Firebase handles automatically |

### Guest Mode
| Feature | Status | Details |
|---------|--------|---------|
| Guest Access | ✅ READY | Available without authentication |
| Guest Data Storage | ✅ READY | Local storage with persistence |
| Guest-to-Account Migration | ✅ VERIFIED | 13 E2E tests passing |

### Data Isolation
| Feature | Status | Tests Verifying |
|---------|--------|--------------|
| Owner-only Firestore reads | ✅ READY | 34 security tests pass |
| Owner-only Firestore writes | ✅ READY | 34 security tests pass |
| Cross-user PDF access denial | ✅ READY | 41 security tests pass |
| Cross-user cover access denial | ✅ READY | Security rules enforce |
| Cross-user deletion protection | ✅ READY | Security rules enforce |
| Subcollection access control | ✅ READY | Rules verify @name matches uid |

### Synchronization
| Feature | Status | Details |
|---------|--------|---------|
| Cloud Sync | ✅ READY | `syncToCloud()` function implemented |
| Offline Support | ✅ READY | LocalStorage with IndexedDB persistence |
| Conflict Resolution | ⚠️ LIMITED | Last-write-wins strategy |
| Cross-Device Sync | ✅ READY | Firebase provides real-time sync |

### Account Management
| Feature | Status | Details |
|---------|--------|---------|
| Account Deletion | ❌ BLOCKER | No UI or implementation |
| Data Export | ❌ BLOCKER | No UI or implementation |
| Profile Update | ✅ READY | UI exists |

---

## 4. Privacy & Security Assessment

### Exposed Secrets
| Variable | Risk | Status |
|----------|------|--------|
| VITE_FIREBASE_API_KEY | Medium | ✅ Client config required for Firebase SDK |
| VITE_FIREBASE_AUTH_DOMAIN | Medium | ✅ Client config required |
| GEMINI_API_KEY | High | ⚠️ Only in server, needs production key management |
| .env files | Medium | ✅ Should be excluded from git |

### Public Download URLs
| Scenario | Risk | Status |
|----------|------|--------|
| PDF Download URLs | High | ✅ **RESOLVED** - No permanent URLs stored |
| Public Avatar URLs | Medium | ✅ Intentional per security rules |
| Private PDF Access | High | ✅ **SECURED** - Uses authenticated Storage SDK |

**✅ RESOLVED:** The application no longer uses `getDownloadURL()` for PDFs. PDF access uses authenticated Firebase Storage SDK reads with temporary object URLs that are revoked after use.

### Server-Side Authorization
| Feature | Status | Details |
|---------|--------|---------|
| Client-Side Validation | ⚠️ INSUFFICIENT | Client validation can be bypassed |
| Server-Side Enforcement | ✅ READY | Firebase Security Rules enforce |
| Request Validation | ✅ READY | Storage/Firestore rules validate all requests |

### CORS & Headers
| Feature | Status | Notes |
|---------|--------|-------|
| Firebase CORS | ✅ READY | Firebase handles automatically |
| Custom Headers | ❌ MISSING | No security headers configured |
| CSRF Protection | ⚠️ NEEDED | Express lacks CSRF middleware |

### File Upload Security
| Validation | Status | Details |
|------------|--------|---------|
| MIME Type | ✅ READY | PDF only, PNG for avatars |
| File Size | ✅ READY | 100MB PDF max, 2MB avatar max |
| Filename | ✅ READY | Regex validation enforced by rules |
| Virus Scanning | ❌ MISSING | Not implemented |

### Error Handling & Logging
| Feature | Status | Notes |
|---------|--------|-------|
| Error Messages | ✅ READY | Generic messages, no sensitive data |
| Logging | ⚠️ LIMITED | Console logs only, no production logging |
| Rate Limiting | ❌ MISSING | No rate limiting implemented |

---

## 5. Vercel Compatibility Assessment

### Build Configuration
| Item | Value | Status |
|------|-------|--------|
| Build Command | `npm run build` | ✅ READY |
| Output Directory | `dist/` | ✅ READY |
| Output Format | Static SPA | ✅ READY |

### Environment Variables for Vercel
| Variable Name | Prefix | Required | Status |
|--------------|--------|----------|--------|
| GEMINI_API_KEY | None | Recommended | ⚠️ NEEDS CONFIGURATION |
| VITE_FIREBASE_API_KEY | VITE_ | Yes | ⚠️ NEEDS CONFIGURATION |
| VITE_FIREBASE_AUTH_DOMAIN | VITE_ | Yes | ⚠️ NEEDS CONFIGURATION |
| VITE_FIREBASE_PROJECT_ID | VITE_ | Yes | ⚠️ NEEDS CONFIGURATION |
| VITE_FIREBASE_STORAGE_BUCKET | VITE_ | Yes | ⚠️ NEEDS CONFIGURATION |
| VITE_FIREBASE_MESSAGING_SENDER_ID | VITE_ | Yes | ⚠️ NEEDS CONFIGURATION |
| VITE_FIREBASE_APP_ID | VITE_ | Yes | ⚠️ NEEDS CONFIGURATION |
| VITE_USE_FIREBASE_EMULATORS | VITE_ | No (dev only) | ✅ CONFIGURED |
| APP_URL | None | Recommended | ⚠️ NEEDS CONFIGURATION |
| PORT | None | No | N/A |

### Express Backend Compatibility
**ISSUE:** The current Express backend (server.ts) uses:
- Vite middleware mode
- `createServer()` from Vite
- Development-focused architecture

**Vercel Compatibility:** ❌ NOT COMPATIBLE
- Vercel Functions run on AWS Lambda
- Cannot run persistent Express server
- Vite middleware not available in serverless context

**Required Changes:**
1. **Remove Express server** or convert to Vercel Functions
2. **Migrate DOI API** to serverless functions
3. **Move Gemini API** to serverless functions (if server-side needed)
4. **Keep Vite build** for frontend

### Vercel Configuration Required
```json
// vercel.json (needs to be created)
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ],
  "functions": {
    "api/doi.js": {
      "maxDuration": 10
    },
    "api/gemini-status.js": {
      "maxDuration": 5
    }
  }
}
```

---

## 6. External User Experience

### Landing Page
| Aspect | Status | Notes |
|--------|--------|-------|
| Entry Point | ✅ READY | index.html with Vite build |
| Branding | ✅ READY | Marginalia Academic Companion |
| Navigation | ✅ READY | TopNav with LIBRARY, NOTES, etc. |

### Registration Flow
| Step | Status | Notes |
|------|--------|-------|
| Guest Access | ✅ READY | No registration required |
| Sign Up | ✅ READY | Email + Password, Google |
| Login | ✅ READY | Both providers supported |
| Password Reset | ❌ MISSING | No UI or flow implemented |

### Onboarding
| Feature | Status | Notes |
|---------|--------|-------|
| Empty State | ✅ READY | Visual bookshelf with 12 default volumes |
| Guest Mode | ✅ READY | Available immediately |
| AI Assistant Prompt | ✅ READY | Appears when AI key not configured |

### Responsive Design
| Breakpoint | Status | Notes |
|------------|--------|-------|
| Desktop | ✅ READY | Full feature set |
| Tablet | ✅ READY | Responsive layout |
| Mobile | ✅ READY | Bottom navigation, mobile-optimized |

### Privacy & Compliance
| Feature | Status | Notes |
|---------|--------|-------|
| Privacy Policy | ❌ MISSING | No privacy policy or terms |
| Cookie Consent | ❌ MISSING | Not implemented |
| GDPR Compliance | ⚠️ UNKNOWN | No data processing disclosures |
| Data Export | ❌ MISSING | No export functionality |
| Account Deletion | ❌ MISSING | No deletion functionality |

### Error Handling
| Scenario | Status | Notes |
|----------|--------|-------|
| Loading States | ✅ READY | Proper loading indicators |
| Network Errors | ✅ READY | Error boundaries in place |
| Auth Errors | ✅ READY | User-friendly messages |
| API Errors | ✅ READY | Graceful error handling |

---

## 7. Summary & Recommendations

### READY ✅ (12 items)
1. Vite frontend build and deployment
2. Firebase Authentication (Google + Email/Password)
3. Firestore database with security rules
4. Storage security rules (PDFs, avatars, covers)
5. Cross-user data isolation
6. Guest mode access
7. Responsive design
8. DOI metadata resolution API
9. **PDF upload with secure filename generation**
10. **No permanent download URLs stored (security fix applied)**
11. **Guest-to-account migration verified**
12. **User document schema aligned with rules**

### NEEDS CONFIGURATION ⚠️ (10 items)
1. Vercel environment variables
2. Firebase authorized domains
3. API key management for production
4. Production Firestore indexes
5. Storage bucket configuration
6. CORS security headers
7. Privacy policy and terms
8. Account deletion feature
9. Data export functionality
10. Password reset functionality

### NEEDS DEVELOPMENT ⚠️ (4 items)
1. Password reset UI and flow
2. Account deletion implementation
3. Data export implementation
4. GDPR compliance documentation

### BLOCKER ❌ (3 items - REDUCED from 5)
1. **Express backend Vercel incompatibility** - Cannot deploy as-is
2. **No password reset** - User lockout risk
3. **No account deletion/export** - Compliance risk
4. ~~Public PDF download URLs~~ - **RESOLVED**
5. ~~Missing privacy policy~~ - Still needed but not a security blocker

---

## Prioritized Fix List

### Immediate (Pre-Deployment)
1. ⚠️ Convert Express server to Vercel Functions
2. ⚠️ Implement password reset UI
3. ⚠️ Add account deletion/export UI
4. ⚠️ Create privacy policy and terms

### Before Beta Launch
5. ⚠️ Configure Vercel environment variables
6. ⚠️ Add authorized domains to Firebase
7. ⚠️ Implement rate limiting
8. ⚠️ Add security headers
9. ⚠️ Test multi-device synchronization

### Before Production
10. ⚠️ GDPR compliance review
11. ⚠️ Production security audit
12. ⚠️ Load testing
13. ⚠️ Backup strategy
14. ⚠️ Monitoring setup

---

## Security Validation Evidence

### Firebase Security Tests: 103/103 PASS
- rules-validation.test.js: 28/28 PASS
- storage-security.test.js: 41/41 PASS
- firestore-rules-standalone.test.js: 34/34 PASS

### Browser E2E Tests: 29/29 PASS
- auth.spec.ts: 6/6 PASS
- data-isolation.spec.ts: 3/3 PASS
- guest-migration.spec.ts: 13/13 PASS
- pdf-upload.spec.ts: 3/3 PASS
- sync.spec.ts: 4/4 PASS

**Total: 132/132 Tests Passing**

## Phase 1 update — Authentication/profile integration (2026-11-04)

**Readiness: BROKEN / INCOMPLETE.** Source now stores settings under the allowed per-user settings document, preserves existing settings on login, uses a shared missing-document initializer with per-page in-flight deduplication, and keeps profile changes on the root document. Firestore rules remain unchanged. Account callback typing and the Playwright import errors are fixed.

Validation evidence: lint PASS; production build PASS; Firebase security rules 106/106 PASS; E2E 29/30 PASS. AUTH-001 currently fails: signup authenticates but leaves the root profile absent after an owner-only read denial at `firestore-emulator.rules:22`. The attempted auth settle delay and forced token refresh did not fix the race. Expected denial warnings in the rules suite correspond to explicit security tests; the AUTH-001 denial is an application failure. Production readiness remains blocked on resolving this and rerunning the full E2E suite with clean application permission logs.

## Live Firebase production recheck — 2026-11-05

This section supersedes the older Firebase deployment and test claims above where they conflict with the live project state.

### Project and service state

- **Firebase project:** `marginalia-academia` (the repository's configured default).
- **Firestore:** Standard edition, location `eur3`. The previously active live rules matched only `/users/{userId}`; they did not cover the app's user-owned subcollections. The prior live Firestore rules are preserved at `artifacts/prod-firestore-rules-before-launch.rules`.
- **Firestore rules:** `firestore.production.rules` is now deployed. It is based on the strict owner-scoped emulator rules, explicitly uses rules version 2, and passed the security suite below. No Firestore documents were modified.
- **Authentication:** Email/password and Google are enabled. The Vercel production alias `marginalia-academic-knowledge-compa.vercel.app` was added to Firebase Auth's authorized domains.
- **Cloud Storage:** Not initialized; no live Storage rules release exists. Firebase CLI reports Storage has not been set up. Project billing is disabled, and Firebase requires the Blaze pay-as-you-go plan to provision/use a Storage bucket. `storage.production.rules` is prepared and tested but has **not** been deployed.
- **Vercel production environment:** Firebase Web SDK configuration was added from the registered Firebase Web App to Production only, including `VITE_USE_FIREBASE_EMULATORS=false`. The AI key was not added. Preview does not receive production Firebase configuration.
- **Production website:** Not redeployed. PDF uploads/reads cannot work until Storage is provisioned and its bucket is configured. Deployment protection also remains enabled.

### Verification on the production candidate rules

- Firebase security tests: **111/111 passed** against emulators loading `firestore.production.rules` and `storage.production.rules`.
- Playwright E2E tests: **40/40 passed** against emulators loading the production candidate rules.
- TypeScript lint: **passed** (`npm run lint`).
- Production Vite build: **passed** (`npm run build`); Vite reports the main JS chunks exceed 500 kB.
- Emulator log scan after the E2E run: no `PERMISSION_DENIED` entries. The wrong-password message logged during the intentional invalid-password E2E case is expected.

### Remaining production gate

The owner must enable Blaze billing and create the default Storage bucket, selecting its permanent location. An EU location aligns with Firestore's European placement; Firebase's Always Free Storage tier is limited to specified US regions, so EU usage follows Cloud Storage pricing. After the owner completes that choice, refresh the registered Web App's Storage bucket config, deploy `storage.production.rules`, rerun the PDF upload/read checks, and deploy the Vercel production build. Do not call the website production-ready before those checks pass.
