import { execSync } from 'child_process';
import { existsSync, unlinkSync, rmSync } from 'fs';
import { globSync } from 'glob';

/**
 * Global teardown for E2E tests
 * - Cleans up test data in emulator
 * - Cleans up screenshots, traces, videos
 */

async function globalTeardown() {
  console.log('[E2E] Running global teardown...');
  
  // Clean up test data files created during tests
  // Note: We don't delete actual emulator data - it persists between test runs
  // Only clean up local artifacts
  
  const artifacts = [
    'test-results/**/*.zip',
    'test-results/**/*.png',
    'test-results/**/*.json',
  ];
  
  // Keep HTML reports, remove zip files
  for (const pattern of artifacts) {
    const files = globSync(pattern);
    for (const file of files) {
      try {
        if (existsSync(file)) {
          rmSync(file, { recursive: true, force: true });
          console.log(`[E2E] Cleaned up: ${file}`);
        }
      } catch (e) {
        console.warn(`[E2E] Warning: Could not clean ${file}:`, e);
      }
    }
  }
  
  console.log('[E2E] Global teardown complete');
}

export default globalTeardown;
