// Firebase Configuration for Marginalia Academic Knowledge Companion
// This file initializes Firebase services for authentication and data synchronization

import { initializeApp, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectStorageEmulator } from 'firebase/storage';

// Firebase configuration - Loaded from environment variables
// Firebase's redirect helper must be same-site on Chrome (M115+) when the app
// is hosted outside Firebase Hosting. Vercel proxies /__/auth/* to the Firebase
// project helper, so use the production app hostname as authDomain there.
const productionAppHost = 'marginalia-academic-knowledge-compa.vercel.app';
const configuredAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
const authDomain = typeof window !== 'undefined' && window.location.hostname === productionAppHost
  ? productionAppHost
  : configuredAuthDomain;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return Object.values(firebaseConfig).every(value => value !== '' && value !== 'your-api-key');
};

// Check if emulator mode should be enabled
const shouldUseEmulators = () => {
  // Priority: explicit env var > default to false for safety
  const envValue = import.meta.env.VITE_USE_FIREBASE_EMULATORS;
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === '1';
  }
  return false;
};

// Project ID for emulators
const EMULATOR_PROJECT_ID = 'marginalia-test-emulator';

// Emulator configuration
const EMULATOR_CONFIG = {
  host: '127.0.0.1',
  authPort: Number(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || 9099),
  firestorePort: Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080),
  storagePort: Number(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || 9199),
};

// Keep test credentials from ever reaching a live Firebase endpoint, and keep
// emulator sessions bound to the dedicated non-production test project.
if (firebaseConfig.projectId === EMULATOR_PROJECT_ID && !shouldUseEmulators()) {
  throw new Error('[Firebase] Refusing to connect the test project without emulators.');
}
if (shouldUseEmulators() && firebaseConfig.projectId !== EMULATOR_PROJECT_ID) {
  throw new Error('[Firebase] Emulator mode requires project marginalia-test-emulator.');
}

// Initialize Firebase app
const app = isFirebaseConfigured() 
  ? initializeApp(firebaseConfig)
  : initializeApp({
      apiKey: 'dev-key',
      authDomain: 'localhost',
      projectId: 'marginalia-dev',
      storageBucket: 'marginalia-dev.appspot.com',
      messagingSenderId: '0',
      appId: '1:0:web:dev',
    });

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Safety check: E2E tests should only run with emulators
const validateEmulatorSafety = () => {
  if (typeof window !== 'undefined' && !shouldUseEmulators()) {
    // Running in browser without emulator mode
    // Check if we're possibly pointing to production
    const projectId = app.options.projectId;
    if (projectId && projectId !== 'marginalia-dev' && !projectId.includes('test')) {
      const isProdOrLive = !import.meta.env.VITE_USE_FIREBASE_EMULATORS;
      if (isProdOrLive) {
        console.warn('WARNING: Running Firebase client without emulator mode.');
        console.warn('This may connect to production Firebase. Set VITE_USE_FIREBASE_EMULATORS=true');
      }
    }
  }
};

// Type to cast emulator connection options
interface EmulatorOptions {
  disableWarnings?: boolean;
  mockUserToken?: string;
}

// Connect to emulators if enabled
const connectEmulators = () => {
  if (!shouldUseEmulators()) {
    return;
  }

  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  const { host, authPort, firestorePort, storagePort } = EMULATOR_CONFIG;

  const embOpts: EmulatorOptions = { disableWarnings: true };

  // Connect synchronously before app code can issue Firebase requests.
  (connectAuthEmulator as any)(auth, `http://${host}:${authPort}`, embOpts);
  (connectFirestoreEmulator as any)(db, host, firestorePort, embOpts);
  (connectStorageEmulator as any)(storage, host, storagePort, embOpts);
  console.log('[Firebase] Connected to Auth, Firestore and Storage emulators');
};

// Run validation and emulator connection
if (typeof window !== 'undefined') {
  validateEmulatorSafety();
  connectEmulators();
}

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Export initialized services
export { app, auth, db, storage, firebaseConfig, isFirebaseConfigured, googleProvider, shouldUseEmulators };

export default app;
