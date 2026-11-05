import { FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 * - Checks Firebase emulators are running
 * - Creates test users
 * - Starts the development server if needed
 */

async function waitForServer(url: string, timeout = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return false;
}

async function checkEmulatorsRunning(): Promise<boolean> {
  const authPort = process.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || '19098';
  const firestorePort = process.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || '18081';
  const storagePort = process.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || '19198';
  const checks = [
    // Auth emulator: 200 OK expected
    fetch(`http://127.0.0.1:${authPort}`)
      .then(r => r.ok)
      .catch(() => false),
    // Firestore emulator: 200 OK expected
    fetch(`http://127.0.0.1:${firestorePort}`)
      .then(r => r.ok)
      .catch(() => false),
    // Storage emulator: 501 Not Implemented is expected for root path
    // (Storage is not a REST API endpoint like Auth/Firestore)
    fetch(`http://127.0.0.1:${storagePort}`)
      .then(r => r.ok || r.status === 501)
      .catch(() => false),
  ];
  
  const results = await Promise.all(checks);
  return results.every(r => r === true);
}

export default async function globalSetup(config: FullConfig) {
  console.log('[E2E] Setting up test environment...');

  if (process.env.VITE_FIREBASE_PROJECT_ID !== 'marginalia-test-emulator') {
    throw new Error('[E2E] Refusing to run against a non-test Firebase project');
  }
  if (!['true', '1'].includes(process.env.VITE_USE_FIREBASE_EMULATORS || '')) {
    throw new Error('[E2E] Firebase emulator mode is not enabled');
  }
  if (process.env.E2E_TEST !== 'true') {
    throw new Error('[E2E] E2E_TEST must be true');
  }
  
  // Check if Firebase emulators are running
  console.log('[E2E] Checking Firebase emulators...');
  const emulatorsRunning = await checkEmulatorsRunning();
  
  if (!emulatorsRunning) {
    throw new Error('[E2E] Isolated Firebase emulators are not reachable on the configured E2E ports.');
  }
  console.log('[E2E] All Firebase emulators are accessible');

  // Check if server is running (or will be started by playwright)
  const serverReady = await waitForServer('http://localhost:3000', 5000);
  if (!serverReady) {
    console.log('[E2E] Development server will be started by playwright');
  }

  console.log('[E2E] Global setup complete');
}
