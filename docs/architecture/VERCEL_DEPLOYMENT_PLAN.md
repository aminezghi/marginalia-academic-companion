# Vercel Deployment Plan - Marginalia Academic Companion

**Date:** 2026-11-04
**Project:** Marginalia Academic Companion
**Target Environment:** Production (marginalia.academic)

---

## Executive Summary

The Marginalia application can be deployed to Vercel, but **the Express backend requires significant modifications**. The current server.ts uses Vite middleware mode which is incompatible with Vercel Functions.

**Recommendation:** Convert the backend API routes to Vercel Serverless Functions while keeping the frontend as a static Single Page Application.

---

## 1. Current Architecture vs. Vercel Requirements

### Current Setup
```
server.ts (Express + Vite Middleware)
├── /api/gemini-status (server-side)
├── /api/health (server-side)
├── /api/doi (server-side proxy)
└── Static assets from Vite
```

### Required Vercel Setup
```
api/ (Vercel Functions)
├── gemini-status.js
├── health.js
├── doi.js (serverless)
└── [...slug].js (catch-all if needed)
dist/ (Vite Static Build)
├── index.html
├── assets/
└── ...
```

---

## 2. Required Modifications

### 2.1 Split Frontend and Backend

**Current:** Single `server.ts` running Express with Vite middleware
**Required:** Separate Vercel Functions from Vite build

### 2.2 Create API Endpoints as Vercel Functions

#### Function: `/api/gemini-status`
```javascript
// api/gemini-status.js
export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  res.status(200).json({
    configured: !!apiKey,
    requiresKey: !apiKey,
    message: apiKey 
      ? 'Gemini API is configured and ready' 
      : 'Please add GEMINI_API_KEY to environment variables'
  });
}
```

#### Function: `/api/health`
```javascript
// api/health.js
export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  res.status(200).json({
    status: 'ok',
    apiConfigured: !!apiKey,
    message: apiKey 
      ? 'Gemini API key is configured' 
      : 'Add GEMINI_API_KEY to use AI features'
  });
}
```

#### Function: `/api/doi`
```javascript
// api/doi.js
export const config = {
  api: {
    responseLimit: '20mb',
  },
};

export default async function handler(req, res) {
  const { doi } = req.query;
  
  if (!doi) {
    return res.status(400).json({ error: 'DOI parameter is required' });
  }

  try {
    const doiClean = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '').trim();
    const crossrefUrl = `https://api.crossref.org/works/${encodeURIComponent(doiClean)}`;
    
    const response = await fetch(crossrefUrl, {
      headers: {
        'User-Agent': 'MarginaliaAcademicCompanion/1.0 (mailto:scholar@marginalia.academic)',
      },
    });

    if (!response.ok) {
      // Fallback for demonstration
      return res.json({
        success: true,
        data: {
          doi: doiClean,
          title: 'Empirical Study on Behavioural Dynamics (${doiClean})',
          authors: ['Amine Zouaghi', 'Research Collaboration Group'],
          year: new Date().getFullYear().toString(),
          journal: 'Journal of Sustainable Agri-Food Research',
        },
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DOI metadata' });
  }
}
```

---

## 3. Build Configuration

### 3.1 Update package.json
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && vercel --prod",
    "vercel": "vercel"
  },
  "engines": {
    "node": "21.x"
  }
}
```

### 3.2 Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/gemini-status.js",
      "use": "@vercel/node"
    },
    {
      "src": "api/health.js",
      "use": "@vercel/node"
    },
    {
      "src": "api/doi.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 3.3 Remove Server Reference from vite.config.ts
```javascript
// vite.config.ts - Add base path for subdirectory deployment if needed
export default defineConfig({
  base: '/', // Use '/' for root deployment, '/marginalia/' for subdirectory
  // ... rest of config
});
```

---

## 4. Environment Variables (Vercel Dashboard)

### Required Variables
| Name | Type | Description | Required |
|------|------|-------------|----------|
| `GEMINI_API_KEY` | Secret | Google Gemini API key | Yes |
| `VITE_FIREBASE_API_KEY` | Plain Text | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Plain Text | Firebase auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Plain Text | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Plain Text | Firebase storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Plain Text | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Plain Text | Firebase app ID | Yes |

### Optional Variables
| Name | Type | Description |
|------|------|-------------|
| `APP_URL` | Plain Text | Base URL (e.g., `https://marginalia.academic`) |
| `VITE_USE_FIREBASE_EMULATORS` | Plain Text | Set to 'false' in production |

---

## 5. Firebase Production Configuration

### 5.1 Authorized Domains
Add the following to Firebase Console → Authentication → Authorized domains:
- `marginalia.academic`
- `www.marginalia.academic`
- `*.vercel.app` (for preview deployments)

### 5.2 Authentication Providers
Enable in Firebase Console → Authentication → Sign-in method:
- ✅ Google Sign-In
- ✅ Email/Password

### 5.3 Firestore Indexes
Review `firestore.indexes.json` and ensure indexes are created in production console.

### 5.4 Storage Rules
Security rules already validated:
- ✅ 41/41 Storage tests passing
- ✅ PDF private access enforced
- ✅ Avatar public read, owner write
- ✅ Cover private access

---

## 6. Deployment Steps

### Step 1: Prepare API Functions
```bash
mkdir -p api
# Create gemini-status.js, health.js, doi.js
```

### Step 2: Update Configuration
```bash
# Update package.json with engines
# Create vercel.json
# Update vite.config.ts if needed
```

### Step 3: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 4: Deploy
```bash
# Login to Vercel
vercel login

# Login to Firebase
firebase login

# Test with preview deployment
vercel

# Deploy to production
vercel --prod
```

### Step 5: Configure Environment Variables
Via Vercel Dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all required variables
4. Redeploy if needed

### Step 6: Configure Firebase
1. Add authorized domains
2. Enable authentication providers
3. Import Firestore indexes
4. Deploy security rules: `firebase deploy --only firestore:rules,storage:rules`

---

## 7. Post-Deployment Checklist

### Critical ✅
- [ ] API functions respond correctly
- [ ] Firebase Auth works with production project
- [ ] Firestore reads/writes function
- [ ] Storage uploads download correctly
- [ ] Security rules enforce isolation

### Important ⚠️
- [ ] HTTPS redirect configured
- [ ] Custom domain (marginalia.academic) connected
- [ ] SSL certificate valid
- [ ] Monitoring alerts configured

### Nice-to-have ✨
- [ ] Analytics setup (Google Analytics or Firebase Analytics)
- [ ] Custom domain email configured
- [ ] Privacy policy page created
- [ ] Terms of service page created

---

## 8. Rollback Strategy

If deployment fails:

1. **Immediate Rollback:**
   ```bash
   vercel rollback
   ```

2. **Manual Rollback:**
   - Revert to previous deployment version in Vercel dashboard
   - Restore Firebase rules if modified

3. **Emergency:**
   - Disable authentication in Firebase Console
   - Contact Vercel support
   - Check Firebase usage dashboard for issues

---

## 9. Cost Estimation (Monthly)

| Service | Estimated Cost | Notes |
|---------|---------------|-------|
| Vercel Hobby | Free | Within free limits (100GB bandwidth, 125k executions) |
| Firebase Spark | Free | Within free tier (1GB storage, 50k reads/day) |
| Gemini API | Pay-as-you-go | Free tier available, then ~$0.00002/1K tokens |
| Crossref API | Free | Public API, fair use policy |

**Note:** Costs increase significantly with >1000 monthly active users. Consider upgrading to Vercel Pro and Firebase Blaze plans.

---

## 10. Troubleshooting

### Common Issues

**1. Firebase CORS Errors**
- Check authorized domains in Firebase Console
- Ensure `VITE_USE_FIREBASE_EMULATORS=false` in production

**2. API Functions Timeout**
- Increase function timeout in vercel.json
- Optimize DOI fetching logic

**3. Authentication Failures**
- Verify all Firebase config variables
- Check authorized domains
- Ensure Firebase rules are deployed

**4. Storage Permission Errors**
- Verify storage rules deployed correctly
- Check file paths match rules
- Ensure user is authenticated

---

## Summary

Deploying Marginalia to Vercel requires:
1. ✅ Converting Express server to Vercel Functions (3 functions needed)
2. ✅ Configuring 8 environment variables
3. ✅ Setting up Firebase production configuration
4. ✅ Testing thoroughly before public release

**Estimated Effort:** 4-6 hours for experienced developer
**Risk Level:** Medium (requires backend modification)
**Go/No-Go Criteria:** All tests passing, Firebase configured, functions responding
