import { test, expect } from '@playwright/test';

test('LAYOUT-001: navigation and profile stay within the viewport across target widths', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Close' }).click();

  for (const width of [360, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      offenders: Array.from(document.querySelectorAll('body *'))
        .map((element) => ({ tag: element.tagName, className: typeof element.className === 'string' ? element.className : '', right: Math.ceil(element.getBoundingClientRect().right) }))
        .filter((element) => element.right > window.innerWidth)
        .slice(0, 8),
    }));
    expect(overflow.documentWidth, `overflow at ${width}px: ${JSON.stringify(overflow.offenders)}`).toBeLessThanOrEqual(width);
    const account = page.locator('header').getByRole('button', { name: 'Open guest account menu' });
    const bounds = await account.boundingBox();
    expect(bounds, `account control should render at ${width}px`).not.toBeNull();
    expect(bounds!.x + bounds!.width, `account control should fit at ${width}px`).toBeLessThanOrEqual(width);
  }
});
