import { test, expect } from '@playwright/test';

const FIRESTORE_REST_URL = `http://127.0.0.1:${process.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || '18081'}/v1/projects/marginalia-test-emulator/databases/(default)/documents`;

test('guest can explicitly continue, import a Scopus-style CSV, and read its abstract', async ({ page }) => {
  await page.goto('/');
  const guestChoice = page.getByRole('button', { name: 'Continue as Guest' });
  await expect(guestChoice).toBeVisible();
  await guestChoice.click();

  await page.getByRole('button', { name: 'Add Papers' }).click();
  await page.getByRole('button', { name: 'Bibliography' }).click();
  const abstract = 'This study examines how local food systems affect household resilience.';
  await page.locator('input[type="file"]').setInputFiles({
    name: 'scopus-export.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from([
      'Authors,Title,Year,Source title,Volume,Issue,Page start,Page end,DOI,Link,Abstract',
      `"Rossi, M.; Smith, E.","Food systems and resilience",2024,"Journal of Food Studies",12,2,101,116,10.5555/example.2024,https://example.org/paper,"${abstract}"`,
    ].join('\n')),
  });
  await expect(page.getByText('STAGED FOR IMPORT (1)')).toBeVisible();
  await page.locator('select[aria-label="Research area"]').selectOption('__root__');
  await page.locator('select[aria-label="Book"]').selectOption('col-thesis');
  await page.getByRole('button', { name: /Import \(1\) into book/ }).click();
  await page.getByRole('heading', { name: 'Import Academic Papers' }).waitFor({ state: 'hidden' });

  await expect(page.getByRole('heading', { name: 'PhD Thesis Core Literature' })).toBeVisible();
  const importedPaper = page.getByRole('heading', { name: 'Food systems and resilience' }).locator('xpath=../..');
  await expect(importedPaper).toBeVisible();
  await importedPaper.getByRole('button', { name: 'Read', exact: true }).click();
  await expect(page.getByText('PDF unavailable', { exact: true })).toBeVisible();
  await expect(page.getByText(abstract)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open article / download source' })).toHaveAttribute('href', 'https://example.org/paper');
});

test('bibliography imports can be assigned to an existing book', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await page.getByRole('button', { name: 'Add Papers' }).click();
  await page.getByRole('button', { name: 'Bibliography' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'folder-target.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Title,Author,Year\n"Folder-target import","Test Author",2025'),
  });

  await page.locator('select[aria-label="Research area"]').selectOption('__root__');
  await page.locator('select[aria-label="Book"]').selectOption('col-thesis');
  await page.getByRole('button', { name: /Import \(1\) into book/ }).click();

  const memberships = await page.evaluate(() => {
    const papers = JSON.parse(localStorage.getItem('academic_archive_items_v3') || '[]') as Array<{ title: string; collectionIds: string[] }>;
    return papers.find((paper) => paper.title === 'Folder-target import')?.collectionIds || [];
  });
  expect(memberships).toContain('col-thesis');
});

test('imports can create a named research area and a book containing multiple papers', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await page.getByRole('button', { name: 'Add Papers' }).click();
  await page.getByRole('button', { name: 'Bibliography' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'area-book.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Title,Author,Year\n"Area paper one","Author One",2025\n"Area paper two","Author Two",2024'),
  });
  await page.locator('select[aria-label="Research area"]').selectOption('__new_area__');
  await page.locator('select[aria-label="Book"]').selectOption('__new_book__');
  await page.getByLabel('New research area name').fill('Food Systems Research');
  await page.getByLabel('New book name').fill('Resilience Review');
  await page.getByRole('button', { name: /Import \(2\) into book/ }).click();

  const hierarchy = await page.evaluate(() => {
    const papers = JSON.parse(localStorage.getItem('academic_archive_items_v3') || '[]') as Array<{ title: string; collectionIds: string[] }>;
    const collections = JSON.parse(localStorage.getItem('academic_archive_collections_v2') || '[]') as Array<{ id: string; name: string; kind?: string; parentId?: string }>;
    const area = collections.find((collection) => collection.name === 'Food Systems Research');
    const book = collections.find((collection) => collection.name === 'Resilience Review');
    return { area, book, paperBookIds: papers.filter((paper) => paper.title.startsWith('Area paper')).map((paper) => paper.collectionIds) };
  });
  expect(hierarchy.area?.kind).toBe('area');
  expect(hierarchy.book?.kind).toBe('book');
  expect(hierarchy.book?.parentId).toBe(hierarchy.area?.id);
  expect(hierarchy.paperBookIds).toHaveLength(2);
  expect(hierarchy.paperBookIds).toEqual([[hierarchy.book?.id], [hierarchy.book?.id]]);
  await expect(page.getByRole('heading', { name: 'Resilience Review' })).toBeVisible();
  const firstPaperRow = page.getByRole('heading', { name: 'Area paper one' }).locator('xpath=../..');
  await firstPaperRow.getByRole('button', { name: 'Mark read' }).click();
  await expect(firstPaperRow.getByLabel('Reading progress 100%')).toBeVisible();
});

test('signed-in bibliography import syncs its research area, book and membership', async ({ page }) => {
  const permissionErrors: string[] = [];
  page.on('console', (message) => {
    if (/PERMISSION_DENIED|Missing or insufficient permissions/i.test(message.text())) {
      permissionErrors.push(message.text());
    }
  });
  await page.goto('/');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Sign Up/i }).click();
  await page.fill('input[placeholder="you@example.com"]', `folder-sync-${Date.now()}@example.com`);
  await page.fill('input[placeholder="Your full name"]', 'Folder Sync User');
  await page.fill('input[placeholder="••••••••"]', 'TestPassword123!');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(dialog).toBeHidden({ timeout: 20000 });

  const { uid, token } = await page.evaluate(async () => {
    const loadModule = new Function('path', 'return import(path)') as <T>(path: string) => Promise<T>;
    const { auth } = await loadModule<typeof import('../../src/config/firebase')>('/src/config/firebase.ts');
    await auth.authStateReady();
    if (!auth.currentUser) throw new Error('Expected a signed-in account.');
    return { uid: auth.currentUser.uid, token: await auth.currentUser.getIdToken() };
  });
  const uniqueSuffix = String(Date.now());
  const areaName = `Signed Research ${uniqueSuffix}`;
  const bookName = `Signed Book ${uniqueSuffix}`;

  await page.getByRole('button', { name: 'Add Papers' }).click();
  await page.getByRole('button', { name: 'Bibliography' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'signed-folder-target.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('Title,Author,Year\n"Signed folder import","Test Author",2025'),
  });
  await page.locator('select[aria-label="Research area"]').selectOption('__new_area__');
  await page.locator('select[aria-label="Book"]').selectOption('__new_book__');
  await page.getByLabel('New research area name').fill(areaName);
  await page.getByLabel('New book name').fill(bookName);
  await page.getByRole('button', { name: /Import \(1\) into book/ }).click();

  const destination = await page.evaluate(({ areaName, bookName }) => {
    const collections = JSON.parse(localStorage.getItem('academic_archive_collections_v2') || '[]') as Array<{ id: string; name: string }>;
    return {
      areaId: collections.find((collection) => collection.name === areaName)?.id,
      bookId: collections.find((collection) => collection.name === bookName)?.id,
    };
  }, { areaName, bookName });
  expect(destination.areaId).toBeTruthy();
  expect(destination.bookId).toBeTruthy();

  let paperSynced = false;
  await expect.poll(async () => {
    const response = await page.request.get(`${FIRESTORE_REST_URL}/users/${uid}/papers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok()) return false;
    const result = await response.json();
    paperSynced = (result.documents || []).some((document: {
      fields?: {
        title?: { stringValue?: string };
        collectionIds?: { arrayValue?: { values?: Array<{ stringValue?: string }> } };
      };
    }) => document.fields?.title?.stringValue === 'Signed folder import' &&
      document.fields.collectionIds?.arrayValue?.values?.some((value) => value.stringValue === destination.bookId));
    return paperSynced;
  }, { timeout: 15000 }).toBe(true);

  await expect.poll(async () => {
    const response = await page.request.get(`${FIRESTORE_REST_URL}/users/${uid}/collections/${destination.bookId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok();
  }, { timeout: 15000 }).toBe(true);
  const bookResponse = await page.request.get(`${FIRESTORE_REST_URL}/users/${uid}/collections/${destination.bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(bookResponse.ok()).toBe(true);
  const bookDocument = await bookResponse.json();
  expect(bookDocument.fields.type.stringValue).toBe('folder');
  expect(bookDocument.fields.parentId.stringValue).toBe(destination.areaId);
  const areaResponse = await page.request.get(`${FIRESTORE_REST_URL}/users/${uid}/collections/${destination.areaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(areaResponse.ok()).toBe(true);
  expect((await areaResponse.json()).fields.type.stringValue).toBe('project');
  expect(paperSynced).toBe(true);
  expect(permissionErrors).toEqual([]);

  await page.getByRole('button', { name: 'Open Archive Tools' }).click();
  await page.getByRole('button', { name: 'CLEAR CONTENT' }).first().click();
  await page.getByRole('button', { name: 'CONFIRM CLEAR' }).click();
  await expect(page.getByText('Library content was cleared successfully.')).toBeVisible();

  const activitiesAfterReset = await page.request.get(`${FIRESTORE_REST_URL}/users/${uid}/activities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(activitiesAfterReset.ok()).toBe(true);
  expect((await activitiesAfterReset.json()).documents || []).toHaveLength(0);
  const papersAfterReset = await page.request.get(`${FIRESTORE_REST_URL}/users/${uid}/papers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(papersAfterReset.ok()).toBe(true);
  expect((await papersAfterReset.json()).documents || []).toHaveLength(0);
  expect(permissionErrors).toEqual([]);
});

test('clear content empties the library instead of restoring demo records', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Continue as Guest' }).click();
  await page.getByRole('button', { name: 'Open Archive Tools' }).click();
  await page.getByRole('button', { name: 'CLEAR CONTENT' }).first().click();
  await expect(page.getByText('Clear all saved content?')).toBeVisible();
  await page.getByRole('button', { name: 'CONFIRM CLEAR' }).click();
  await expect(page.getByText('Library content was cleared successfully.')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Empty library' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Underutilized Crops/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Continue as Guest' })).toHaveCount(0);
});
