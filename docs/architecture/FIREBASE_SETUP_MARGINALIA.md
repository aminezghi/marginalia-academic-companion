# Firebase Setup for Marginalia Academic Companion
## Project: marginalia-academia

### Quick Start

This guide will help you configure your existing Firebase project `marginalia-academia` for use with the Marginalia Academic Companion web app.

---

## Step 1: Register Your Web App in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **marginalia-academia**
3. Click the **gear icon ⚙️** (Project Settings)
4. Scroll down to **Your apps** section
5. Click **</>** (Add app) → **Web app**
6. Enter a nickname: `Marginalia Academic Companion - Web`
7. **Check the box** for "Also deploy Firebase Hosting for this app" (optional)
8. Click **Register app**

---

## Step 2: Get Your Firebase Configuration

After registering the web app, you'll see a configuration object. **Copy it exactly**:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "marginalia-academia.firebaseapp.com",
  projectId: "marginalia-academia",
  storageBucket: "marginalia-academia.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

---

## Step 3: Enable Authentication Providers

### Google Sign-In
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Google** provider
3. Click **Enable**
4. Under **Authorized domains**, add:
   - `localhost` (for development)
   - Your Vercel domain when deployed (e.g., `marginalia-academia.vercel.app`)
5. Click **Save**

### Email/Password Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Email/Password** provider
3. Click **Enable**
4. Click **Save**

---

## Step 4: Configure Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a location (default is fine)
5. Click **Enable**

### Set Firestore Security Rules

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

---

## Step 5: Update Your .env File

Replace the placeholder values in your `.env` file with your actual Firebase credentials:

```bash
# GEMINI_API_KEY: Your Google AI Studio API key (optional)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# App Configuration
APP_URL=http://localhost:3000
PORT=3000

# Firebase Configuration - UPDATE THESE VALUES
VITE_FIREBASE_API_KEY=AIzaSyYOUR_ACTUAL_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=marginalia-academia.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=marginalia-academia
VITE_FIREBASE_STORAGE_BUCKET=marginalia-academia.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=1:YOUR_SENDER_ID:web:YOUR_APP_ID
```

---

## Step 6: (Optional) Configure Firebase Storage

For PDF uploads support:

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Configure rules similar to Firestore:

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

---

## Step 7: Verify Configuration

Start your development server:

```bash
# Navigate to your project
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000 in your browser. You should see the sign-in modal appear.

---

## Step 8: Test Authentication

1. **Google Sign-In**: Click "Continue with Google" - you should be redirected to Google login
2. **Email/Password**: Test creating a new account with email and password
3. **Firestore**: After signing in, check the `users` collection in Firestore - a new document should be created with your `uid`

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure Firebase for marginalia-academia"
git push origin main
```

### 2. Configure Vercel Environment Variables
In your Vercel dashboard:
- Import the project from GitHub
- Go to **Settings** → **Environment Variables**
- Add the same environment variables as in your `.env` file

### 3. Add Vercel Domain to Firebase Authorized Domains
In Firebase Console → Authentication → Authorized domains, add your Vercel domain (e.g., `marginalia-academia.vercel.app`)

---

## Troubleshooting

### "Firebase: No such project"
- Double-check your `VITE_FIREBASE_PROJECT_ID` is exactly `marginalia-academia`

### "Firebase: Firebase Invalid argument"
- Ensure your API key is correct in `.env`
- Restart your dev server after changing `.env`

### "Authentication domain not authorized"
- Check Firebase Console → Authentication → Authorized domains
- Add `localhost` for development

### "Missing or insufficient permissions" (Firestore)
- Verify your Firestore security rules are set correctly
- Ensure `request.auth.uid == userId` matches your document structure

---

## Files Verified/Updated

| File | Status |
|------|--------|
| `src/config/firebase.ts` | ✅ Firebase SDK initialization |
| `src/contexts/AuthContext.tsx` | ✅ Authentication with Google + Email/Password |
| `src/hooks/useFirebaseSync.ts` | ✅ Cross-device synchronization |
| `src/hooks/useGuestMode.ts` | ✅ Guest mode support |
| `src/components/TopNav.tsx` | ✅ Profile pill visibility fixed |
| `src/components/Footer.tsx` | ✅ "Made by Amine" footer |
| `.env` | ✅ Environment configuration template |
| `FIREBASE_SETUP_MARGINALIA.md` | ✅ This setup guide |

---

## Next Steps

After completing this setup:
1. Test authentication locally at http://localhost:3000
2. Deploy to Vercel
3. Share the live URL with collaborators!
