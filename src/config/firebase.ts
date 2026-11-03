// Firebase Configuration for Marginalia Academic Knowledge Companion
// This file initializes Firebase services for authentication and data synchronization

import { initializeApp, getApp, isAvailableApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - Loaded from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return Object.values(firebaseConfig).every(value => value !== '' && value !== 'your-api-key');
};

// Initialize Firebase app
let app;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let storage: ReturnType<typeof getStorage> | null = null;

try {
  if (isFirebaseConfigured()) {
    // Initialize Firebase with production config
    app = initializeApp(firebaseConfig);
  } else {
    // Use a minimal config for development/testing when no real credentials are set
    console.warn('Firebase credentials not configured. Using development mode.');
    app = initializeApp({
      apiKey: 'dev-key',
      authDomain: 'localhost',
      projectId: 'marginalia-dev',
      storageBucket: 'marginalia-dev.appspot.com',
      messagingSenderId: '0',
      appId: '1:0:web:dev',
    });
  }
  
  // Initialize Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Enable offline persistence for Firestore (if supported)
  if (typeof window !== 'undefined' && db) {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab.');
      } else if (err.code === 'resource-exhausted') {
        console.warn('Cached data exceeds browser limits.');
      } else {
        console.warn('Persistence error:', err);
      }
    });
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Export initialized services
export { app, auth, db, storage, firebaseConfig, isFirebaseConfigured };

export default app;
