import { test, expect } from '@playwright/test';

// Keine Testbestellungen: sämtliche Supabase-Aufrufe werden abgefangen.
test.beforeEach(async ({ page }) => {
  // Testprofile verhindern, dass der verpflichtende Profil-Dialog Klicks blockiert.
  await page.addInitScript(() => {
    localStorage.setItem('facility-employee-profile-v1', JSON.stringify({
      name: 'Test Mitarbeiter', site: 'Handwerkerpark 25', dept: 'Logistik'
    }));
  });
  // Auch Safari/WebKit benötigt für die lokale Testseite eine gültige CORS-Antwort.
  const cors = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type,apikey,authorization'
  };
  // Externe Produktbilder sind fuer Funktionstests nicht noetig und duerfen CI nicht blockieren.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    if (url.hostname.endsWith('supabase.co')) {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      return route.fulfill({ status: 200, contentType: 'application/json', headers: cors, body: JSON.stringify({ orders: [], waste: [], success: true }) });
    }
    return route.abort();
  });
  await page.goto('/#start', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#category-filters .category-button')).toHaveCount(7);
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
    await expect.poll(async () => {
      const categories = await page.locator('#shop-view .mobile-sticky-controls').boundingBox();
      const results = await page.locator('#facility-mobile-search-results').boundingBox();
      return categories && results ? results.y - categories.y - categories.height : -999;
    }, { timeout: 8000 }).toBeGreaterThanOrEqual(-2);
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
  await page.goto('/#bestelluebersicht', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#order-selected-year')).toHaveText(/20\d\d/);
  await expect(page.locator('#order-month-filter option')).toHaveCount(13);
});

test('Navigation und Profil bleiben beim Zurückgehen bedienbar', async ({ page, isMobile }) => {
  await page.locator('#home-view a[href="#entsorgungsuebersicht"]').click();
  await expect(page.locator('#overview-menu-view')).toBeVisible();
  await page.locator('#overview-menu-view a[href="#bestelluebersicht"]').click();
  await expect(page.locator('#order-overview-view')).toBeVisible();
  if (isMobile) await page.locator('#facility-back-nav').click();
  else await page.locator('#order-overview-view .waste-back').click();
  await expect(page.locator('#overview-menu-view')).toBeVisible();
  await page.locator('#profile-edit').click();
  await expect(page.locator('#profile-popup')).toBeVisible();
  await page.locator('#profile-back').click();
  await expect(page.locator('#profile-popup')).toBeHidden();
});

test('Warenkorb bleibt nach Aktualisieren erhalten', async ({ page, isMobile }) => {
  await page.locator('#home-view a[href="#shop"]').click();
  if (isMobile) await page.locator('#facility-search-toggle').click();
  await page.locator('#article-search').fill('Hafermilch');
  await page.locator('#products .product button[data-add]').first().click();
  await expect(page.locator('#cart-count')).toHaveText('1');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#cart-count')).toHaveText('1');
});

test('Bestellvorschlag liefert korrekte Bestätigung ohne echten Versand', async ({ page, isMobile }) => {
  await page.locator('#home-view a[href="#shop"]').click();
  if (isMobile) await page.locator('#facility-search-toggle').click();
  await page.locator('#article-search').fill('Hafermilch');
  await page.locator('#products .product button[data-add]').first().click();
  if (isMobile) await page.goto('/#warenkorb', { waitUntil: 'domcontentloaded' });
  else await page.locator('#shop-view > header .cart-link').click();

  // Nur im Test die konkrete Versandfunktion abfangen. Ein echtes HTTP-Mocking
  // externer URLs fuehrt in WebKit teils zu "Load failed" vor der Antwort.
  // Der Aufruf, die Payload und der Bestellabschluss bleiben voll testbar.
  await page.evaluate(() => {
    const originalFetch = window.fetch.bind(window);
    window.__facilityTestOrderPayload = null;
    window.fetch = (resource, options) => {
      if (String(resource).includes('/functions/v1/facility-send-mail')) {
        window.__facilityTestOrderPayload = JSON.parse(options.body);
        return Promise.resolve(new Response('{"success":true,"queued":true}', {
          status: 202,
          headers: { 'content-type': 'application/json' }
        }));
      }
      return originalFetch(resource, options);
    };
  });
  await page.locator('#order-button').click();
  await expect(page.locator('#feedback')).toContainText('Bestellvorschlag erfasst');
  const received = await page.evaluate(() => window.__facilityTestOrderPayload);
  expect(received?.typ).toBe('bestellung');
  expect(received?.items?.some(item => /Hafermilch/i.test(item.name))).toBeTruthy();
});

test('Kleine Smartphoneansicht hat keine horizontale Seitenverschiebung', async ({ page, isMobile }) => {
  if (!isMobile) return;
  const before = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(before.scrollWidth).toBeLessThanOrEqual(before.viewport + 2);
  await page.locator('#home-view a[href="#shop"]').click();
  const after = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth
  }));
  expect(after.scrollWidth).toBeLessThanOrEqual(after.viewport + 2);
});


test('Bereich und Artikel: ohne Außenkachel, gleich groß wie Jahr und Monat', async ({ page, isMobile }) => {
  if (!isMobile) return;
  await page.goto('/#bestelluebersicht', { waitUntil: 'domcontentloaded' });
  const year = page.locator('#order-overview-view .pickup-top-row .pickup-year-selector');
  const month = page.locator('#order-month-filter');
  const department = page.locator('#order-dept-filter');
  const article = page.locator('#order-article-filter');
  await expect(year).toBeVisible();
  await expect(month).toBeVisible();
  await expect(department).toBeVisible();
  await expect(article).toBeVisible();
  const [yearBox, monthBox, deptBox, articleBox] = await Promise.all(
    [year, month, department, article].map(locator => locator.boundingBox())
  );
  expect(deptBox).not.toBeNull();
  expect(articleBox).not.toBeNull();
  for (const box of [deptBox, articleBox]) {
    expect(Math.abs(box.width - yearBox.width)).toBeLessThanOrEqual(3);
    expect(Math.abs(box.width - monthBox.width)).toBeLessThanOrEqual(3);
    expect(Math.abs(box.height - monthBox.height)).toBeLessThanOrEqual(3);
  }
  const outer = await page.locator('#order-filter-panel').evaluate(el => {
    const styles = getComputedStyle(el);
    return { background: styles.backgroundColor, border: styles.borderTopWidth, shadow: styles.boxShadow };
  });
  expect(outer.background).toBe('rgba(0, 0, 0, 0)');
  expect(outer.border).toBe('0px');
  expect(outer.shadow).toBe('none');
});


test('Bestellübersicht: Überschrift und fünf Filter bleiben beim Scrollen fixiert', async ({ page, isMobile }) => {
  await page.goto('/#bestelluebersicht', { waitUntil: 'domcontentloaded' });
  const tools = page.locator('#order-overview-view > .order-sticky-tools');
  await expect(tools).toBeVisible();
  await expect(tools.locator('h1')).toContainText('Übersicht Bestellungen');
  for (const selector of ['#order-selected-year', '#order-month-filter', '#order-dept-filter', '#order-article-filter', '#order-filter-reset']) {
    await expect(page.locator(selector)).toBeAttached();
  }
  // Der Test macht die Artikelliste künstlich lang, ohne Einträge oder Daten anzulegen.
  await page.locator('#order-type-buttons').evaluate(el => { el.style.minHeight = '1900px'; });
  const scroll = async (top) => {
    await page.evaluate(({top, isMobile}) => {
      if (isMobile) document.getElementById('order-overview-view').scrollTop = top;
      else window.scrollTo(0, top);
    }, {top, isMobile});
    await page.waitForTimeout(80);
  };
  await scroll(380);
  const first = await tools.boundingBox();
  await scroll(680);
  const second = await tools.boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(Math.abs(first.y - second.y)).toBeLessThanOrEqual(3);
  const title = await tools.locator('h1').boundingBox();
  const filters = await page.locator('#order-filter-panel').boundingBox();
  expect(title.y + title.height).toBeLessThan(filters.y);
});
