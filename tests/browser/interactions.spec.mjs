import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const pages = JSON.parse(fs.readFileSync(new URL('../../docs/browser-pages.json', import.meta.url), 'utf8'));
const pageErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = []; pageErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(async ({ page }) => { expect(pageErrors.get(page)).toEqual([]); });
for (const file of pages) {
  test(`${file}: local images, responsive width and JavaScript`, async ({ page }) => {
    await page.goto('/' + file);
    await expect(page.locator('body')).toBeVisible();
    await expect.poll(() => page.evaluate(() => [...document.images]
      .filter(img => img.src.startsWith(location.origin))
      .every(img => img.complete && img.naturalWidth > 0))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test('ScrollSpy follows Explore navigation', async ({ page, viewport }) => {
  await page.goto('/');
  if (viewport.width < 768) await page.locator('button[data-bs-target="#navbarCollapse"]').click();
  const link = page.locator('nav a[href="#explore-head-section"]');
  await link.click();
  await expect(link).toHaveClass(/active/);
});
test('contact modal opens and closes without submission', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-bs-target="#contactModal"]').click();
  const modal = page.locator('#contactModal');
  await expect(modal).toBeVisible();
  await modal.locator('[data-bs-dismiss="modal"]').click();
  await expect(modal).toBeHidden();
});
