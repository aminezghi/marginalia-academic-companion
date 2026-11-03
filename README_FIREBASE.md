# Marginalia Academic Companion - Firebase Setup

## Quick Start

### 1. Create Firebase Project

Go to [Firebase Console](https://console.firebase.google.com/) and create a new project:
- Project name: `marginalia-academic-companion`
- Disable Google Analytics (optional)

### 2. Enable Authentication

In Firebase Console:
1. Go to **Authentication > Sign-in method**
2. Enable **Google** provider
3. Enable **Email/Password** provider
4. Add `localhost` to authorized domains

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Use **production mode**
4. Set these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Get Firebase Config

In Firebase Console **Project Settings > General > Your apps**:
1. Click **Add app** → **Web**
2. Copy the configuration object

### 5. Update .env

```bash
GEMINI_API_KEY=your_gemini_api_key_here
APP_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 6. Test Local Development

```bash
npm install --legacy-peer-deps
npm run dev
```

Visit http://localhost:3000 and test authentication.

### 7. Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Set environment variables in Vercel dashboard
