import { test, expect, Page } from '@playwright/test';
import { createPdfBytes } from './pdf-fixtures';

const FIRESTORE_REST_URL = `http://127.0.0.1:${process.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || '18081'}/v1/projects/marginalia-test-emulator/databases/(default)/documents`;

const TEST_PASSWORD = 'TestPassword123!';

async function createAccount(page: Page, label: string): Promise<void> {
  await page.goto('/');
  await page.waitForSelector('[role="dialog"]', { state: 'visible' });
  await page.locator('[role="dialog"]').getByRole('button', { name: /Sign Up/i }).click();
  await page.fill('input[placeholder="you@example.com"]', `pdf-${label}-${Date.now()}@example.com`);
  await page.fill('input[placeholder="Your full name"]', `PDF ${label}`);
  await page.fill('input[placeholder="••••••••"]', TEST_PASSWORD);
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 20000 });
  await expect(page.getByRole('button', { name: 'Open account menu' })).toBeVisible({ timeout: 15000 });
  await expect.poll(() => page.evaluate(async () => {
    const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
    const [{ auth, db }, service] = await Promise.all([
      loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts'),
      loadModule<typeof import('../../src/services/userProfile')>('/src/services/userProfile.ts'),
    ]);
    await auth.authStateReady();
    if (!auth.currentUser) return false;
    try {
      const docs = await service.readUserProfileDocuments(db, auth.currentUser.uid);
      return docs.profile.uid === auth.currentUser.uid && docs.settings.userId === auth.currentUser.uid;
    } catch {
      return false;
    }
  }), { timeout: 15000 }).toBe(true);
}

async function openPdfImport(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Add Papers' }).click();
  await page.getByRole('button', { name: 'PDF Document' }).click();
}

async function openReaderView(page: Page): Promise<void> {
  const desktopReader = page.getByRole('button', { name: 'READER', exact: true });
  if (await desktopReader.isVisible().catch(() => false)) {
    await desktopReader.click();
    return;
  }
  await page.getByRole('button', { name: 'Toggle Navigation Menu' }).click();
  await page.getByRole('button', { name: /Academic Reader/i }).click();
}

async function importPdf(page: Page, name: string, pageCount: number, includeRasterImage = false): Promise<void> {
  await openPdfImport(page);
  await page.locator('input[type="file"]').setInputFiles({
    name,
    mimeType: 'application/pdf',
    buffer: Buffer.from(createPdfBytes(pageCount, includeRasterImage)),
  });
  await expect(page.getByRole('status').filter({ hasText: `PDF ready to import: ${name}` })).toBeVisible();
  await page.locator('select[aria-label="Research area"]').selectOption('__root__');
  await page.locator('select[aria-label="Book"]').selectOption('col-thesis');
  await page.getByRole('button', { name: /Import \(1\) into book/ }).click();
  await expect(page.getByRole('heading', { name: 'Import Academic Papers' })).toBeHidden();
  await openReaderView(page);
  await expect(page.getByLabel('PDF pages')).toBeVisible();
}

test.describe('PDF reader journeys', () => {
  test('PDF-001: guest can import, render, navigate, scroll, zoom, and reopen an 18-page scanned/text PDF', async ({ page }) => {
    const appErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && /PERMISSION_DENIED|Missing or insufficient permissions/i.test(message.text())) {
        appErrors.push(message.text());
      }
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Close' }).click();
    await importPdf(page, 'marginalia-test-18-pages.pdf', 18, true);

    await expect(page.getByText('Marginalia test page 1', { exact: true })).toBeVisible();
    await expect(page.locator('[data-page-number="1"] canvas')).toBeVisible();
    await expect(page.getByText('Page 1 of 18', { exact: true }).first()).toBeVisible();

    const selectableText = page.locator('[data-page-number="1"] .textLayer span').first();
    await selectableText.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    });
    await page.locator('.react-pdf__Page[data-page-number="1"]').dispatchEvent('mouseup');
    await expect(page.getByText('CREATE ACADEMIC HIGHLIGHT & NOTE')).toBeVisible();
    await page.locator('textarea').fill('Check this source claim.');
    await page.getByRole('button', { name: 'Save Highlight' }).click();
    await expect(page.getByText('Check this source claim.')).toBeVisible();

    await page.getByRole('button', { name: 'Next Page' }).click();
    await expect(page.getByText('Page 2 of 18', { exact: true }).first()).toBeVisible();
    const scannedPageColors = await page.locator('[data-page-number="2"] canvas').evaluate((canvas) => {
      const context = (canvas as HTMLCanvasElement).getContext('2d');
      if (!context) throw new Error('Expected a rendered PDF canvas.');
      const { data } = context.getImageData(0, 0, (canvas as HTMLCanvasElement).width, (canvas as HTMLCanvasElement).height);
      const colors = new Set<string>();
      for (let index = 0; index < data.length; index += 4) {
        if (data[index] !== 255 || data[index + 1] !== 255 || data[index + 2] !== 255) {
          colors.add(`${data[index]},${data[index + 1]},${data[index + 2]}`);
        }
      }
      return colors.size;
    });
    expect(scannedPageColors).toBeGreaterThan(3);
    await page.getByRole('button', { name: 'Page 18', exact: true }).click();
    await expect(page.getByText('Marginalia test page 18', { exact: true })).toBeVisible();
    await expect(page.getByText('Page 18 of 18', { exact: true }).first()).toBeVisible();

    const pageScroll = page.getByLabel('PDF pages');
    await pageScroll.evaluate((element) => element.scrollTo({ top: 0, behavior: 'auto' }));
    await page.mouse.move(600, 400);
    await page.mouse.wheel(0, 20000);
    await expect(page.getByText('Page 18 of 18', { exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Zoom in' }).click();
    await expect(page.getByText('110%', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Fit PDF to width' }).click();
    await expect(page.getByText('100%', { exact: true })).toBeVisible();
    expect(appErrors).toEqual([]);

    await page.reload();
    await page.getByRole('button', { name: 'Close' }).click();
    await openReaderView(page);
    await expect(page.getByLabel('PDF pages')).toBeVisible();
    await page.getByRole('button', { name: 'Page 1', exact: true }).click();
    await expect(page.getByText('Marginalia test page 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Page 1 of 18', { exact: true }).first()).toBeVisible();
  });

  test('PDF-002: a one-page PDF renders and a 120-page document renders only nearby pages', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Close' }).click();
    await importPdf(page, 'marginalia-short.pdf', 1);
    await expect(page.getByText('Page 1 of 1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Marginalia test page 1', { exact: true })).toBeVisible();

    await page.locator('button[title="Exit Reader"]').click();
    await importPdf(page, 'marginalia-120-pages.pdf', 120);
    await expect(page.getByText('Page 1 of 120', { exact: true }).first()).toBeVisible();
    await expect.poll(() => page.locator('.react-pdf__Page canvas').count()).toBeLessThan(10);
    await page.locator('[data-page-number="120"]').scrollIntoViewIfNeeded();
    await expect(page.getByText('Marginalia test page 120', { exact: true })).toBeVisible();
    await expect(page.getByText('Page 120 of 120', { exact: true }).first()).toBeVisible();
  });

  test('PDF-003: authenticated PDF upload stores bytes and owner-only metadata', async ({ page }) => {
    const permissionErrors: string[] = [];
    page.on('console', (message) => {
      if (/PERMISSION_DENIED|Missing or insufficient permissions/i.test(message.text())) permissionErrors.push(message.text());
    });

    await createAccount(page, 'owner');
    await importPdf(page, 'marginalia-private-paper.pdf', 3);
    await expect(page.getByText('Marginalia test page 1', { exact: true })).toBeVisible();

    // Read metadata through the emulator REST endpoint. The rendered reader above
    // has already exercised the app's authenticated Storage SDK read path.
    const { uid, token } = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const { auth } = await loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts');
      await auth.authStateReady();
      if (!auth.currentUser) throw new Error('Expected authenticated PDF owner.');
      return { uid: auth.currentUser.uid, token: await auth.currentUser.getIdToken() };
    });
    const response = await page.request.get(`${FIRESTORE_REST_URL}/users/${uid}/papers`, { headers: { Authorization: `Bearer ${token}` } });
    expect(response.ok()).toBe(true);
    const result = await response.json();
    const paper = result.documents?.find((item: { fields?: { title?: { stringValue?: string }; storagePath?: { stringValue?: string } } }) => item.fields?.title?.stringValue === 'marginalia private paper');
    expect(paper).toBeTruthy();
    expect(paper.fields.storagePath.stringValue).toMatch(/^pdfs\//);
    expect(permissionErrors).toEqual([]);
  });

  test('RESET-001: signed-in reset removes the owner library and PDFs but preserves account settings', async ({ page }) => {
    const permissionErrors: string[] = [];
    page.on('console', (message) => {
      if (/PERMISSION_DENIED|Missing or insufficient permissions/i.test(message.text())) permissionErrors.push(message.text());
    });
    await createAccount(page, 'reset-owner');
    await importPdf(page, 'marginalia-reset-paper.pdf', 2);
    await page.locator('button[title="Exit Reader"]').click();

    await page.getByRole('button', { name: 'Open Archive Tools' }).click();
    await page.getByRole('button', { name: 'CLEAR CONTENT' }).first().click();
    await page.getByRole('button', { name: 'CONFIRM CLEAR' }).click();
    await expect(page.getByText('Library content was cleared successfully.')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Empty library' })).toBeVisible();

    const resetIdentity = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const { auth, storage } = await loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts');
      await auth.authStateReady();
      if (!auth.currentUser) throw new Error('Reset unexpectedly signed the account out.');
      const uid = auth.currentUser.uid;
      return {
        uid,
        accountStillSignedIn: auth.currentUser?.uid === uid,
        token: await auth.currentUser.getIdToken(),
      };
    });
    const authHeader = { Authorization: `Bearer ${resetIdentity.token}` };
    const [profileResponse, settingsResponse, papersResponse, remainingPdfPaths] = await Promise.all([
      page.request.get(`${FIRESTORE_REST_URL}/users/${resetIdentity.uid}`, { headers: authHeader }),
      page.request.get(`${FIRESTORE_REST_URL}/users/${resetIdentity.uid}/settings/current`, { headers: authHeader }),
      page.request.get(`${FIRESTORE_REST_URL}/users/${resetIdentity.uid}/papers`, { headers: authHeader }),
      page.evaluate(async (uid) => {
        const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
        const pdfDocuments = await loadModule<typeof import('../../src/services/pdfDocuments')>('/src/services/pdfDocuments.ts');
        return pdfDocuments.listCurrentUsersPdfPaths(uid);
      }, resetIdentity.uid),
    ]);
    const remainingPapers = await papersResponse.json();
    expect(resetIdentity.accountStillSignedIn).toBe(true);
    expect(profileResponse.ok()).toBe(true);
    expect(settingsResponse.ok()).toBe(true);
    expect(papersResponse.ok()).toBe(true);
    expect(remainingPapers.documents || []).toHaveLength(0);
    expect(remainingPdfPaths).toHaveLength(0);
    expect(permissionErrors).toEqual([]);
  });

  test('PDF-004: guest can attach a PDF to an existing metadata-only paper', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Close' }).click();
    await openReaderView(page);
    await expect(page.getByText('PDF not attached')).toBeVisible();
    const title = await page.locator('span.font-serif.font-medium.text-sm').first().innerText();
    const papersBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('academic_archive_items_v3') || '[]'));
    const targetId = papersBefore[0].id as string;

    await page.getByRole('button', { name: 'Attach PDF' }).click();
    await page.getByLabel('Choose a PDF to attach to this paper').setInputFiles({
      name: 'original-study.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(createPdfBytes(4)),
    });
    await expect(page.getByText('Marginalia test page 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Page 1 of 4', { exact: true }).first()).toBeVisible();
    await expect(page.locator('span.font-serif.font-medium.text-sm').first()).toHaveText(title);

    const paperAfterAttach = await page.evaluate((id) => {
      const papers = JSON.parse(localStorage.getItem('academic_archive_items_v3') || '[]');
      return { count: papers.length, paper: papers.find((item: { id: string }) => item.id === id) };
    }, targetId);
    expect(paperAfterAttach.count).toBe(papersBefore.length);
    expect(paperAfterAttach.paper.guestPdfId).toBeTruthy();
    expect(paperAfterAttach.paper.doi).toBe(papersBefore[0].doi);

    await page.reload();
    await page.getByRole('button', { name: 'Close' }).click();
    await openReaderView(page);
    await expect(page.getByText('Marginalia test page 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Page 1 of 4', { exact: true }).first()).toBeVisible();
  });

  test('PDF-005: authenticated attachment persists on the existing Firestore paper record', async ({ page }) => {
    const permissionErrors: string[] = [];
    page.on('console', (message) => {
      if (/PERMISSION_DENIED|Missing or insufficient permissions/i.test(message.text())) permissionErrors.push(message.text());
    });
    await createAccount(page, 'attach-owner');
    await openReaderView(page);
    await expect(page.getByText('PDF not attached')).toBeVisible();
    const { uid, paperId } = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const { auth } = await loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts');
      await auth.authStateReady();
      if (!auth.currentUser) throw new Error('Expected authenticated PDF owner.');
      const papers = JSON.parse(localStorage.getItem('academic_archive_items_v3') || '[]');
      return { uid: auth.currentUser.uid, paperId: papers[0].id as string };
    });
    await page.getByRole('button', { name: 'Attach PDF' }).click();
    await page.getByLabel('Choose a PDF to attach to this paper').setInputFiles({
      name: '1-s2.0-S2215016126004486-main.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(createPdfBytes(2)),
    });
    await expect(page.getByText('Marginalia test page 1', { exact: true })).toBeVisible();
    const token = await page.evaluate(async () => {
      const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
      const { auth } = await loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts');
      return auth.currentUser?.getIdToken();
    });
    if (!token) throw new Error('Expected an authenticated emulator token.');
    const metadataResponse = await page.request.get(
      `${FIRESTORE_REST_URL}/users/${uid}/papers/${paperId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(metadataResponse.ok()).toBe(true);
    const saved = await metadataResponse.json();
    expect(saved.fields.storagePath.stringValue).toMatch(/^pdfs\//);
    expect(saved.fields.storagePath.stringValue).toMatch(/\d{13}_[a-f0-9]{8}_1-s2_0-S2215016126004486-main\.pdf$/);
    expect(permissionErrors).toEqual([]);
  });
});
