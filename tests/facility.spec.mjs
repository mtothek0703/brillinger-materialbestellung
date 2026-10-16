import { test, expect } from '@playwright/test';

// Keine Testbestellungen: sämtliche Supabase-Aufrufe werden abgefangen.
test.beforeEach(async ({ page }) => {
  await page.route('**/supabase.co/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ orders: [], waste: [], success: true })
    });
  });
  await page.goto('/#start');
});

test('Startseite zeigt alle drei Bereiche', async ({ page }) => {
  await expect(page.locator('#home-view .home-tiles a')).toHaveCount(3);
  await expect(page.locator('#facility-home-nav')).toBeVisible();
});

test('Müllentsorgung: Restmüll kann aufgerufen werden', async ({ page }) => {
  await page.locator('#home-view a[href="#muellentsorgung"]').click();
  await expect(page.locator('#waste-view')).toBeVisible();
  await expect(page.locator('#waste-rest')).toBeVisible();
});

test('Artikelsuche findet Hafermilch und verdeckt keine Kategorien', async ({ page, isMobile }) => {
  await page.locator('#home-view a[href="#shop"]').click();
  await expect(page.locator('#shop-view')).toBeVisible();
  if (isMobile) await page.locator('#facility-search-toggle').click();
  const search = page.locator('#article-search');
  await search.fill('Hafermilch');
  await expect(page.locator('#products .product h3').first()).toContainText(/Hafermilch/i);
  if (isMobile) {
    await expect(page.locator('#shop-view .mobile-sticky-controls')).toBeVisible();
    const categories = await page.locator('#shop-view .mobile-sticky-controls').boundingBox();
    const results = await page.locator('#facility-mobile-search-results').boundingBox();
    if (categories && results) expect(results.y).toBeGreaterThanOrEqual(categories.y + categories.height - 2);
  }
});

test('Artikel kann zum Warenkorb hinzugefügt werden', async ({ page, isMobile }) => {
  await page.locator('#home-view a[href="#shop"]').click();
  if (isMobile) await page.locator('#facility-search-toggle').click();
  await page.locator('#article-search').fill('AdBlue');
  await page.locator('#products .product button[data-add]').first().click();
  await expect(page.locator('#cart-count')).toHaveText('1');
});

test('Bestellübersicht: Jahr und Monatsfilter vorhanden', async ({ page }) => {
  await page.goto('/#bestelluebersicht');
  await expect(page.locator('#order-selected-year')).toHaveText(/20\d\d/);
  await expect(page.locator('#order-month-filter option')).toHaveCount(13);
});
