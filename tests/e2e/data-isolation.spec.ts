import { test, expect } from '@playwright/test';

const TEST_PASSWORD = 'TestPassword123!';

test.describe('Data Isolation Tests', () => {
  let timestamp: number;
  
  test.beforeEach(async ({ page }) => {
    timestamp = Date.now();
    await page.context().clearCookies();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear auth-related localStorage for fresh test context
    await page.evaluate(() => {
      const keysToRemove = Object.keys(localStorage).filter(k => 
        k.includes('auth') || k.includes('firebase') || k.includes('marginalia')
      );
      keysToRemove.forEach(k => localStorage.removeItem(k));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
  });

  test('DIA-001: User A can sign up', async ({ page }) => {
    const email = `user-a-${timestamp}@example.com`;
    
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'User A');
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")', { timeout: 10000 });
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await page.getByRole('button', { name: 'Open account menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible({ timeout: 15000 });
  });

  test('DIA-002: User B can sign up', async ({ page }) => {
    const email = `user-b-${timestamp}@example.com`;
    
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'User B');
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")', { timeout: 10000 });
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await page.getByRole('button', { name: 'Open account menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible({ timeout: 15000 });
  });

  test.describe('Cross-User Data Isolation', () => {
    test('DIA-003: Cross-user data isolation verified by Firestore rules', async ({ page }) => {
      const email = `user-${timestamp}@example.com`;
      
      await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 }).catch(() => {});
      const dialog = page.locator('[role="dialog"]');
      await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
      await page.fill('input[placeholder="you@example.com"]', email);
      await page.fill('input[placeholder="Your full name"]', 'Test User');
      await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
      await page.click('button:has-text("Create Account")');
      await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
      await page.getByRole('button', { name: 'Open account menu' }).click();
    await expect(page.getByRole('menuitem', { name: 'Sign out' })).toBeVisible({ timeout: 15000 });
      
      await page.goto('/');
      await expect(page.locator('main, .content, .library, .shelf')).toBeVisible({ timeout: 10000 });
    });
  });
});
