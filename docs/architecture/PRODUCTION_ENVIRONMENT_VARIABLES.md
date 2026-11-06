# Production Environment Variables - Marginalia Academic Companion

**Date:** 2026-11-04
**Purpose:** Configuration required for Vercel production deployment

---

## Overview

This document lists all environment variables required to run Marginalia in production. Variables are categorized by source (Vercel, Firebase, Gemini) and marked with their requirement status.

---

## 1. Vercel Serverless Function Variables

These variables are needed by the API endpoints deployed as Vercel Functions.

### Production-Only Variables
| Variable Name | Location | Required | Example Value | Description |
|--------------|----------|----------|---------------|-------------|
| `GEMINI_API_KEY` | Vercel Secret | **Yes** | `AIzaSy...` | Google Gemini API key for AI Research Assistant |

**How to Set in Vercel:**
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add as Secret (not Plain Text)
3. Environment: Production
4. Value: Your actual Gemini API key

---

## 2. Firebase Client-Side Variables

These variables are required by the Firebase JavaScript SDK in the browser.

### Required Variables
| Variable Name | Prefix | Required | Example Value | Description |
|--------------|--------|----------|---------------|-------------|
| `VITE_FIREBASE_API_KEY` | VITE_ | **Yes** | `AIzaSy...` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | VITE_ | **Yes** | `your-project.firebaseapp.com` | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | VITE_ | **Yes** | `your-project-id` | Unique Firebase project identifier |
| `VITE_FIREBASE_STORAGE_BUCKET` | VITE_ | **Yes** | `your-project-id.appspot.com` | Firebase Storage bucket name |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | VITE_ | **Yes** | `123456789012` | Firebase Cloud Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | VITE_ | **Yes** | `1:123456789012:web:abcdef123456` | Firebase Web App ID |

### Optional Variables
| Variable Name | Prefix | Required | Example Value | Description |
|--------------|--------|----------|---------------|-------------|
| `VITE_USE_FIREBASE_EMULATORS` | VITE_ | No | `false` | **Must be `false` in production** - Disables emulator connections |

**How to Set in Vercel:**
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add as Plain Text (not Secret)
3. Environment: Production
4. Values from Firebase Console → Project Settings → General → Your apps

**Get Values From:**
Firebase Console → Project Settings → General → Your apps → Web app → Firebase SDK snippet

---

## 3. Application Variables

These variables control application behavior in production.

### Optional Variables
| Variable Name | Required | Example Value | Description |
|--------------|----------|---------------|-------------|
| `APP_URL` | No | `https://marginalia.academic` | Base URL for OAuth callbacks and redirects |

**Note:** This is used for:
- Google OAuth redirect configuration
- DOI proxy URL generation
- Social sharing

---

## 4. Variable Configuration Checklist

### Firebase Console Setup
Before deploying, ensure you have:
- [ ] Created Firebase project
- [ ] Enabled Authentication (Google + Email/Password)
- [ ] Created Firestore database
- [ ] Created Storage bucket
- [ ] Configured authorized domains
- [ ] Copied all config values

### Vercel Console Setup
| Step | Action | Variable Type |
|------|--------|---------------|
| 1 | Add `GEMINI_API_KEY` | Secret |
| 2 | Add `VITE_FIREBASE_API_KEY` | Plain Text |
| 3 | Add `VITE_FIREBASE_AUTH_DOMAIN` | Plain Text |
| 4 | Add `VITE_FIREBASE_PROJECT_ID` | Plain Text |
| 5 | Add `VITE_FIREBASE_STORAGE_BUCKET` | Plain Text |
| 6 | Add `VITE_FIREBASE_MESSAGING_SENDER_ID` | Plain Text |
| 7 | Add `VITE_FIREBASE_APP_ID` | Plain Text |
| 8 | Add `VITE_USE_FIREBASE_EMULATORS` | Plain Text |
| 9 | Add `APP_URL` (optional) | Plain Text |

---

## 5. Environment Variable Validation

### Test Script
Create a validation script to verify all variables are set:

```bash
#!/bin/bash
# verify-env.sh

required_vars=(
  "GEMINI_API_KEY"
  "VITE_FIREBASE_API_KEY"
  "VITE_FIREBASE_AUTH_DOMAIN"
  "VITE_FIREBASE_PROJECT_ID"
  "VITE_FIREBASE_STORAGE_BUCKET"
  "VITE_FIREBASE_MESSAGING_SENDER_ID"
  "VITE_FIREBASE_APP_ID"
)

missing=0
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
    missing=1
  else
    echo "✅ Set: $var"
  fi
done

# Check emulator mode is disabled
if [ "${VITE_USE_FIREBASE_EMULATORS}" = "true" ]; then
  echo "⚠️ WARNING: VITE_USE_FIREBASE_EMULATORS should be 'false' in production"
fi

if [ $missing -eq 0 ]; then
  echo "✅ All required environment variables are set"
else
  echo "❌ Some variables are missing"
  exit 1
fi
```

### TypeScript Validation
The application already validates Firebase config in src/config/firebase.ts:
```typescript
const isFirebaseConfigured = () => {
  return Object.values(firebaseConfig).every(value => 
    value !== '' && value !== 'your-api-key'
  );
};
```

---

## 6. Secrets Management

### What NOT to Store in Environment
- Firebase private keys (not used by client)
- Production database passwords (not used by Firebase)
- User data or tokens
- Any actual user credentials

### What to Keep Secure
- `GEMINI_API_KEY` - Limit API usage, rotate if compromised
- `VITE_FIREBASE_API_KEY` - Can be public but restricted by Firebase rules
- All other variables - Configure appropriate Firebase security rules

---

## 7. Environment-Specific Configuration

### Development (.env.local)
```
GEMINI_API_KEY=your_dev_key
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_USE_FIREBASE_EMULATORS=true
APP_URL=http://localhost:3000
```

### Production (.env.production - local reference only)
```
GEMINI_API_KEY=your_production_key
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_USE_FIREBASE_EMULATORS=false
APP_URL=https://marginalia.academic
```

**Important:** Never commit `.env` files to version control. Update `.gitignore` to ensure they're excluded.

---

## 8. Required Vercel Project Settings

### Node.js Version
- Go to Project Settings → General → Node.js Version
- Set to **21.x** (or latest LTS)

### Build Settings
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework Preset: **Other** (not Next.js)

### Functions Configuration
- Max Duration: 10 seconds (default)
- Memory: 512 MB (default)
- Include Files: Ensure `api/` directory is included

---

## 9. Firebase Production Configuration

### Authorized Domains (Firebase Console)
1. Authentication → Authorized domains
2. Add:
   - `marginalia.academic`
   - `www.marginalia.academic`
   - `marginalia.vercel.app` (preview deployments)

### Authentication Providers (Firebase Console)
1. Authentication → Sign-in method
2. Enable:
   - Google
   - Email/Password

---

## 10. Validation Testing

### Test Each Variable
After deployment, verify each environment variable works by testing:

| Test | Endpoint | Expected Result |
|------|----------|-----------------|
| Gemini API | `/api/gemini-status` | Shows configured or requires key |
| Health Check | `/api/health` | Returns `{status: 'ok'}` |
| DOI Resolution | `/api/doi?doi=10.xxxx` | Returns metadata JSON |

### Test Firebase Connections
1. Register new user - Should create Firestore document
2. Upload PDF - Should appear in Storage bucket
3. Download PDF - Should use signed URL or Storage SDK
4. Sign out - Should clear auth state

---

## Summary Table

| Category | Variables | Status | Action Required |
|----------|-----------|--------|-----------------|
| Gemini API | GEMINI_API_KEY | 🔴 Missing | Add as Vercel Secret |
| Firebase | 6 VITE_ vars | 🔴 Missing | Add as Plain Text |
| App Config | VITE_USE_FIREBASE_EMULATORS, APP_URL | ⚠️ Partial | Set emulator=false, add APP_URL |
| **Total** | **9 variables** | | |

✅ **Ready when all 9 variables are properly configured in Vercel**
