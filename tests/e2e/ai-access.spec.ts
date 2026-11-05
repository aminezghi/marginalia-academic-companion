import { test, expect } from '@playwright/test';

test.describe('AI API key access gate', () => {
  test('AI stays locked without a key and opens key setup when selected', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();

    const navigation = page.getByRole('navigation', { name: 'Primary Workspace Navigation' });
    await navigation.getByRole('button', { name: 'AI', exact: true }).click();

    const keyDialog = page.getByRole('dialog', { name: 'Do you have a Gemini API key?' });
    await expect(keyDialog).toBeVisible();
    await keyDialog.getByRole('button', { name: 'No key — keep AI locked' }).click();

    await expect(page.getByRole('heading', { name: 'AI Research Assistant is locked' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ask Your Library' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Configure AI access' }).click();
    await expect(page.getByRole('dialog', { name: 'Do you have a Gemini API key?' })).toBeVisible();
  });
});
