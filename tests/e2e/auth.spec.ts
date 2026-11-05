import { test, expect } from '@playwright/test';

const TEST_PASSWORD = 'TestPassword123!';

async function waitForAuthenticatedUser(page: import('@playwright/test').Page): Promise<void> {
  await expect.poll(async () => page.evaluate(async () => {
    const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
    const { auth } = await loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts');
    await auth.authStateReady();
    return auth.currentUser?.uid ?? null;
  }), { timeout: 15000 }).not.toBeNull();
}

async function waitForLoggedOut(page: import('@playwright/test').Page): Promise<void> {
  await expect.poll(async () => page.evaluate(async () => {
    const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
    const { auth } = await loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts');
    await auth.authStateReady();
    return auth.currentUser?.uid ?? null;
  }), { timeout: 15000 }).toBeNull();
}

async function openAccountMenu(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Open account menu' }).click();
}

async function waitForSignOutAction(page: import('@playwright/test').Page): Promise<void> {
  await openAccountMenu(page);
  await page.getByRole('menuitem', { name: 'Sign out' }).waitFor({ state: 'visible' });
}

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and wait for it to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Clear auth-related localStorage for fresh test context
    await page.evaluate(() => {
      const keysToRemove = Object.keys(localStorage).filter(k => 
        k.includes('auth') || k.includes('firebase') || k.includes('marginalia')
      );
      keysToRemove.forEach(k => localStorage.removeItem(k));
    });
    
    await page.context().clearCookies();
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait for auth modal to appear
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
  });

  test('AUTH-001: User can sign up with email/password', async ({ page }) => {
    const email = `user-a-${Date.now()}@example.com`;
    const permissionErrors: string[] = [];
    page.on('console', (message) => {
      if (/PERMISSION_DENIED|Missing or insufficient permissions/i.test(message.text())) {
        permissionErrors.push(message.text());
      }
    });
    
    // Wait for auth modal and click "Sign Up" toggle
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
    
    // Fill signup form
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'Test User A');
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    
    // Submit form
    await page.click('button:has-text("Create Account")', { timeout: 10000 });
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await waitForAuthenticatedUser(page);
    
    await waitForSignOutAction(page);

    const profile = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const [{ auth, db }, service] = await Promise.all([
        loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts'),
        loadModule<typeof import('../../src/services/userProfile')>('/src/services/userProfile.ts'),
      ]);
      await auth.authStateReady();
      if (!auth.currentUser) throw new Error('Expected registered user to be authenticated.');
      return service.readUserProfileDocuments(db, auth.currentUser.uid);
    });
    expect(profile.profile.email).toBe(email);
    expect(profile.profile.displayName).toBe('Test User A');
    expect(profile.settings.userId).toBe(profile.profile.uid);
    expect(permissionErrors).toEqual([]);
  });

  test('AUTH-002: User can sign in with email/password', async ({ page }) => {
    const email = `user-b-${Date.now()}@example.com`;
    
    // Sign up first - click the "Sign Up" toggle inside the modal
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'Test User B');
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await waitForAuthenticatedUser(page);
    await waitForSignOutAction(page);
    
    // Logout
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await page.waitForTimeout(5000);
    
    // Modal should auto-open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
    
    // Sign in - click "Already have an account? Sign In" toggle
    const dialog2 = page.locator('[role="dialog"]');
    await dialog2.getByRole('button', { name: /Sign In/i }).click({ timeout: 10000 });
    
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Sign In")');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await waitForAuthenticatedUser(page);
    
    await waitForSignOutAction(page);
  });

  test('AUTH-003: Wrong password is rejected', async ({ page }) => {
    const email = `user-c-${Date.now()}@example.com`;
    
    // Sign up first - click the "Sign Up" toggle inside the modal
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'Test User C');
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await waitForAuthenticatedUser(page);
    await waitForSignOutAction(page);
    
    // Logout
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await page.waitForTimeout(5000);
    
    // Try wrong password
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
    
    // Click "Sign In" toggle
    const dialog2 = page.locator('[role="dialog"]');
    await dialog2.getByRole('button', { name: /Sign In/i }).click({ timeout: 10000 });
    
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="••••••••"]', 'WrongPassword123!');
    await page.click('button:has-text("Sign In")');
    
    // Should show error
    await expect(page.locator('.text-red-700, .error-message, [role="alert"]')).toBeVisible({ timeout: 10000 });
  });

  test('AUTH-004: Page refresh preserves auth', async ({ page }) => {
    const email = `user-d-${Date.now()}@example.com`;
    
    // Sign up - click the "Sign Up" toggle inside the modal
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'Refresh Test User');
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await waitForAuthenticatedUser(page);
    await waitForSignOutAction(page);
    
    // Refresh
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await waitForAuthenticatedUser(page);
    await waitForSignOutAction(page);
  });

  test('AUTH-005: Logout clears auth state', async ({ page }) => {
    const email = `user-e-${Date.now()}@example.com`;
    
    // Sign up - click the "Sign Up" toggle inside the modal
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'Test User E');
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await waitForAuthenticatedUser(page);
    await waitForSignOutAction(page);
    
    // Logout
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect.poll(async () => page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const { auth } = await loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts');
      await auth.authStateReady();
      return auth.currentUser?.uid ?? null;
    }), { timeout: 15000 }).toBeNull();
    await page.waitForTimeout(5000);
    
    // Should show sign in/up buttons
    // After logout, the auth modal should appear with Sign Up/Sign In buttons
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
    const hasSignUpBtn = await page.getByRole('button', { name: /Sign Up/i }).isVisible();
    expect(hasSignUpBtn).toBeTruthy();
  });
});

test('AUTH-008: Firebase Auth Emulator exposes its explicit Google identity simulation', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState('domcontentloaded');
  await expect(popup.locator('body')).toContainText('Sign-in with Google.com');
  await expect(popup.getByRole('button', { name: /Add new account/i })).toBeVisible();
  await popup.close();
});

test.describe('Profile Creation Tests', () => {
  test('AUTH-006: Default profile created with allowed fields only', async ({ page }) => {
    const email = `profile-test-${Date.now()}@example.com`;
    const permissionErrors: string[] = [];
    page.on('console', (message) => {
      console.log(`[Browser ${message.type()}] ${message.text()}`);
      if (/PERMISSION_DENIED|Missing or insufficient permissions/i.test(message.text())) {
        permissionErrors.push(message.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.context().clearCookies();
    
    // Clear auth-related localStorage
    await page.evaluate(() => {
      const keysToRemove = Object.keys(localStorage).filter(k => 
        k.includes('auth') || k.includes('firebase') || k.includes('marginalia')
      );
      keysToRemove.forEach(k => localStorage.removeItem(k));
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    
    // Click "Sign Up" toggle inside the modal dialog
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByRole('button', { name: /Sign Up/i }).click({ timeout: 10000 });
    
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'Profile Test User');
    await page.fill('input[placeholder="••••••••"]', 'TestPassword123!');
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await waitForAuthenticatedUser(page);
    await waitForSignOutAction(page);

    await expect.poll(async () => page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const [{ auth, db }, service] = await Promise.all([
        loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts'),
        loadModule<typeof import('../../src/services/userProfile')>('/src/services/userProfile.ts'),
      ]);
      await auth.authStateReady();
      if (!auth.currentUser) return false;
      try {
        await service.readUserProfileDocuments(db, auth.currentUser.uid);
        return true;
      } catch {
        return false;
      }
    }), { timeout: 20000 }).toBe(true);
    
    const initialized = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const [{ auth, db }, service] = await Promise.all([
        loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts'),
        loadModule<typeof import('../../src/services/userProfile')>('/src/services/userProfile.ts'),
      ]);
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user) throw new Error('Expected newly registered user to be authenticated.');
      const documents = await service.readUserProfileDocuments(db, user.uid);
      return { uid: user.uid, ...documents };
    });
    expect(initialized.profile.uid).toBe(initialized.uid);
    expect(initialized.profile.email).toBe(email);
    expect(initialized.profile.displayName).toBe('Profile Test User');
    expect(Object.keys(initialized.profile).sort()).toEqual(
      ['createdAt', 'displayName', 'email', 'photoURL', 'provider', 'uid'].sort(),
    );
    expect(initialized.settings.userId).toBe(initialized.uid);
    expect(initialized.settings.shelfMaterial).toBeTruthy();
    expect(initialized.settings.shelfSortMode).toBeTruthy();
    expect(typeof initialized.settings.soundEnabled).toBe('boolean');

    const updated = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const [{ auth, db }, service] = await Promise.all([
        loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts'),
        loadModule<typeof import('../../src/services/userProfile')>('/src/services/userProfile.ts'),
      ]);
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user) throw new Error('Expected authenticated test user.');
      await service.updateUserSettingsDocument(db, user, { shelfMaterial: 'oak' });
      await service.ensureUserProfileAndSettings(db, user);
      await service.ensureUserProfileAndSettings(db, user);
      await service.updateUserProfileDocument(db, user, { displayName: 'Updated Profile User' });
      await service.updateUserSettingsDocument(db, user, { soundEnabled: false });
      const view = await service.readUserProfileAndSettings(db, user.uid);
      return { displayName: view.displayName, settings: view.settings };
    });
    expect(updated.displayName).toBe('Updated Profile User');
    expect(updated.settings.shelfMaterial).toBe('oak');
    expect(updated.settings.soundEnabled).toBe(false);
    expect(permissionErrors).toEqual([]);
  });

  test('AUTH-007: Existing login preserves initialized profile and settings', async ({ page }) => {
    const email = `repeat-login-${Date.now()}@example.com`;
    const permissionErrors: string[] = [];
    page.on('console', (message) => {
      if (/PERMISSION_DENIED|Missing or insufficient permissions/i.test(message.text())) {
        permissionErrors.push(message.text());
      }
    });
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    await page.locator('[role="dialog"]').getByRole('button', { name: /Sign Up/i }).click();
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="Your full name"]', 'Repeat Login User');
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Create Account")');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
    await waitForAuthenticatedUser(page);
    await expect.poll(async () => page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const [{ auth, db }, service] = await Promise.all([
        loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts'),
        loadModule<typeof import('../../src/services/userProfile')>('/src/services/userProfile.ts'),
      ]);
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user) return false;
      try {
        const docs = await service.readUserProfileDocuments(db, user.uid);
        return docs.profile.displayName === 'Repeat Login User';
      } catch {
        return false;
      }
    }), { timeout: 20000 }).toBe(true);
    await page.waitForTimeout(500);
    const initialUid = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const [{ auth, db }, service] = await Promise.all([
        loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts'),
        loadModule<typeof import('../../src/services/userProfile')>('/src/services/userProfile.ts'),
      ]);
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user) throw new Error('Expected registered test user.');
      await service.updateUserSettingsDocument(db, user, { shelfMaterial: 'mahogany', soundEnabled: false });
      return user.uid;
    });

    await openAccountMenu(page);
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await waitForLoggedOut(page);
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    await page.locator('[role="dialog"]').getByRole('button', { name: /Sign In/i }).click();
    await page.fill('input[placeholder="you@example.com"]', email);
    await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
    await page.click('button:has-text("Sign In")');
    await waitForAuthenticatedUser(page);
    await openAccountMenu(page);

    const persisted = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const [{ auth, db }, service] = await Promise.all([
        loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts'),
        loadModule<typeof import('../../src/services/userProfile')>('/src/services/userProfile.ts'),
      ]);
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user) throw new Error('Expected logged-in test user.');
      return { uid: user.uid, ...await service.readUserProfileDocuments(db, user.uid) };
    });
    expect(persisted.uid).toBe(initialUid);
    expect(persisted.profile.displayName).toBe('Repeat Login User');
    expect(persisted.settings.shelfMaterial).toBe('mahogany');
    expect(persisted.settings.soundEnabled).toBe(false);
    expect(permissionErrors).toEqual([]);
  });
});
