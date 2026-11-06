# Firebase Setup Guide for Marginalia Academic Companion

## Overview

This guide walks you through setting up Firebase for user authentication and cross-device data synchronization in the Marginalia Academic Companion app.

## Prerequisites

1. A Google account with access to Firebase Console
2. A Vercel account for deployment (optional, for production)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `marginalia-academic-companion` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

## Step 2: Enable Authentication

### Google Sign-In
1. In Firebase Console, go to **Authentication > Sign-in method**
2. Click **Google** provider
3. Click **Enable**
4. Authorized domains: Add `localhost` for development
5. Click **Save**

### Email/Password
1. In Firebase Console, go to **Authentication > Sign-in method**
2. Click **Email/Password** provider
3. Click **Enable**
4. Click **Save**

## Step 3: Configure Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a location (default is fine)
5. Click **Enable**

### Firestore Security Rules

Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 4: Configure Firebase Storage (for PDF uploads)

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Use similar rules to Firestore:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 5: Get Firebase SDK Configuration

1. In Firebase Console, go to **Project Settings > General > Your apps**
2. Click **Add app** and select **Web**
3. Register the app with any nickname (e.g., "Marginalia Web")
4. Copy the Firebase configuration object

Your config will look like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...your-api-key...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 6: Configure Environment Variables

### For Local Development

Create a `.env` file in your project root:

```bash
# Gemini API Key (for AI features)
GEMINI_API_KEY=your_gemini_api_key_here

# App URL
APP_URL=http://localhost:3000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### For Vercel Deployment

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your repository
4. Go to **Settings > Environment Variables**
5. Add the following environment variables (same names as above)

**Note:** Vercel uses the `VITE_` prefix for client-side environment variables.

## Step 7: Verify Firebase Configuration

Run the development server and test authentication:

```bash
npm run dev
# Visit http://localhost:3000
```

1. You should see an authentication modal
2. Try signing in with Google
3. Try creating an account with email/password
4. Check Firebase Console > Authentication > Users to see your test users

## Step 8: Test Cross-Device Sync

1. Log in on your desktop
2. Add some research items
3. Log in on another device or browser
4. Verify your library appears

## Troubleshooting

### Authentication Errors

**Problem:** "Firebase: No provided domain for this purpose"

**Solution:** 
- Go to Firebase Console > Authentication > Sign-in method
- Add your current domain to authorized domains

**Problem:** "Firebase API key is invalid"

**Solution:** 
- Verify you copied the full API key from Firebase Console
- Ensure the key starts with `AIzaSy...`

### Firestore Permission Denied

**Problem:** "Missing or insufficient permissions"

**Solution:**
- Verify security rules are correctly set
- Ensure `request.auth.uid == userId` matches your document structure

### Environment Variables Not Loading

**Problem:** Variables appear empty in the app

**Solution:**
- Restart the dev server after adding variables to `.env`
- Check that variable names start with `VITE_` for client-side use
- In Vercel, ensure "Targets: both" is selected for environment variables

### CORS Issues

**Problem:** Cross-origin request blocked

**Solution:**
- Firebase automatically handles CORS for registered domains
- Add `localhost:3000` to authorized domains in Firebase Console

## Deployment Checklist

### Before Deploying to Vercel

- [ ] Firebase project created and configured
- [ ] Authentication providers enabled (Google, Email/Password)
- [ ] Firestore database created with security rules
- [ ] Firebase Storage rules configured (if using)
- [ ] `.env` file has all required variables (not committed to git)
- [ ] `.gitignore` includes `.env`
- [ ] Vercel environment variables configured
- [ ] Firebase authorized domains include your Vercel domain

### Firebase Project Settings

1. **General > Project settings**
   - Add your Vercel domain to authorized domains

2. **Authentication > Authorized domains**
   - Add: `localhost` (development)
   - Add: `your-project.vercel.app` (production)

3. **Firestore Database > Rules**
   - Verify rules allow authenticated users to read/write their own documents

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vue.js + Firebase Guide](https://firebase.google.com/docs/web/setup)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## One-Click Firebase Setup Script (Optional)

You can use this script to create the Firebase project programmatically:

```bash
# Requires Firebase CLI: npm install -g firebase-tools
firebase login
firebase projects:create marginalia-academic-companion
firebase init firestore
firebase init auth
firebase init hosting
```
