import { Page, Locator } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// Generate unique test email
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

// Generate unique test user ID for Firebase
export function generateTestUid(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

// Test user credentials
export interface TestUser {
  email: string;
  password: string;
  uid: string;
}

// Create a test user
export async function createTestUser(page: Page): Promise<TestUser> {
  const email = generateTestEmail();
  const uid = generateTestUid();
  const password = 'TestPass123!';
  
  return { email, password, uid };
}

// Login helper
export async function login(page: Page, email: string, password: string): Promise<void> {
  // Navigate to login page
  await page.goto('/login');
  
  // Fill in credentials and submit
  // Note: The actual selectors depend on the UI implementation
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Wait for navigation or state change
  await page.waitForURL('**/', { timeout: 10000 });
}

// Logout helper
export async function logout(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open account menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.waitForTimeout(1000);
}

// Check if user is authenticated
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for presence of user-specific elements
  const userMenu = page.locator('[aria-label="User menu"], .user-profile, .user avatar');
  return await userMenu.count() > 0;
}

// Wait for auth state to be initialized
export async function waitForAuthInit(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    // Check for Firebase auth state
    const firebaseReady = (window as any)._firebaseReady;
    return firebaseReady === true;
  }, { timeout: 10000 });
}
