import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// E2E must always use the dedicated local emulator project. Load this file
// before Playwright creates its web server so the browser bundle inherits it.
const e2eEnvPath = path.join(__dirname, '.env.e2e.local');
const envResult = dotenv.config({ path: e2eEnvPath, override: true });
if (envResult.error) {
  throw new Error(`[E2E] Could not load ${e2eEnvPath}: ${envResult.error.message}`);
}
if (process.env.VITE_FIREBASE_PROJECT_ID !== 'marginalia-test-emulator') {
  throw new Error('[E2E] Refusing to run unless VITE_FIREBASE_PROJECT_ID=marginalia-test-emulator');
}
if (!['true', '1'].includes(process.env.VITE_USE_FIREBASE_EMULATORS || '')) {
  throw new Error('[E2E] Refusing to run unless VITE_USE_FIREBASE_EMULATORS=true');
}
if (process.env.E2E_TEST !== 'true') {
  throw new Error('[E2E] Refusing to run unless E2E_TEST=true');
}
if (process.env.VITE_FIREBASE_AUTH_EMULATOR_PORT !== '19098' ||
    process.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT !== '18081' ||
    process.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT !== '19198') {
  throw new Error('[E2E] Refusing to run unless the isolated E2E emulator ports are configured.');
}

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: ['**/._*'],
  fullyParallel: false, // Disabled for emulator safety
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid emulator conflicts
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    // Environment variables are set via global setup
  },
  webServer: {
    command: 'npx tsx dev-server.ts',
    url: 'http://localhost:3000',
    // Never reuse a server whose Firebase environment may be unknown.
    reuseExistingServer: false,
    timeout: 120000,
    env: Object.fromEntries(
      Object.entries(process.env).filter((entry): entry is [string, string] => entry[1] !== undefined),
    ),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  // Global setup to load environment variables
  globalSetup: path.join(__dirname, 'tests/e2e/global-setup.ts'),
});
