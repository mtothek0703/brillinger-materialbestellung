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


test('Untere Navigation: vier ausgerichtete Symbole und Beschriftungen auf kleinen Smartphones', async ({ page, isMobile }) => {
  if (!isMobile) return;
  for (const hash of ['#start', '#shop']) {
    await page.goto('/' + hash, { waitUntil: 'domcontentloaded' });
    const nav = page.locator('#facility-home-nav');
    await expect(nav).toBeVisible();
    const ids = [
      'a[href="#start"]',
      '#facility-back-nav',
      '#facility-search-toggle',
      '#facility-profile-slot'
    ];
    const cells = nav.locator(':scope > a[href="#start"], :scope > #facility-back-nav, :scope > #facility-search-toggle, :scope > #facility-profile-slot');
    const metrics = await cells.evaluateAll(nodes => nodes.map(node => {
      const cell = node.getBoundingClientRect();
      const icon = (node.querySelector('svg') || node.querySelector('#profile-edit')).getBoundingClientRect();
      const label = node.querySelector('strong, span.facility-search-label, span.facility-profile-label, span:not([class])');
      const labelBox = label.getBoundingClientRect();
      const styles = getComputedStyle(label);
      return {
        width: cell.width,
        cx: cell.x + cell.width / 2,
        iconCx: icon.x + icon.width / 2,
        iconY: icon.y,
        iconSize: icon.width,
        labelY: labelBox.y,
        fontSize: parseFloat(styles.fontSize),
        labelOverflow: label.scrollWidth - label.clientWidth,
        labelCx: labelBox.x + labelBox.width / 2
      };
    }));
    expect(metrics).toHaveLength(4);
    for (const m of metrics) {
      expect(Math.abs(m.width - metrics[0].width)).toBeLessThan(1.5);
      expect(Math.abs(m.iconCx - m.cx)).toBeLessThan(2);
      expect(Math.abs(m.labelCx - m.cx)).toBeLessThan(2);
      expect(Math.abs(m.iconY - metrics[0].iconY)).toBeLessThan(2);
      expect(Math.abs(m.labelY - metrics[0].labelY)).toBeLessThan(2);
      expect(m.iconSize).toBeGreaterThanOrEqual(27);
      expect(m.iconSize).toBeLessThanOrEqual(29);
      expect(m.fontSize).toBeGreaterThanOrEqual(11);
      expect(m.fontSize).toBeLessThanOrEqual(12.5);
      expect(m.labelOverflow).toBeLessThanOrEqual(1);
    }
    expect(await nav.evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
    await expect(nav.locator('#facility-custom-entry-nav')).toBeHidden();
  }
});


test('Bestellübersicht zeigt Artikel als Textzeilen mit Trennlinien ohne Kacheln', async ({ page }) => {
  await page.goto('/#bestelluebersicht', { waitUntil: 'domcontentloaded' });
  const list = page.locator('#order-type-buttons');
  await expect(list).toBeVisible();
  await list.evaluate(el => {
    el.replaceChildren();
    for (const [name, count] of [['Glasreiniger', 3], ['Langes Artikellabel, zusätzlich getestet', 2]]) {
      const row = document.createElement('button');
      row.className = 'pickup-row pickup-type-button';
      row.type = 'button';
      const label = document.createElement('span');
      label.className = 'pickup-type-label';
      label.textContent = name;
      const quantity = document.createElement('strong');
      quantity.textContent = count + ' ›';
      row.append(label, quantity);
      el.appendChild(row);
    }
  });
  const geometry = await list.evaluate(el => {
    const rows = [...el.querySelectorAll('.pickup-type-button')];
    const styles = rows.map(row => {
      const cs = getComputedStyle(row);
      const label = row.querySelector('.pickup-type-label').getBoundingClientRect();
      const count = row.querySelector('strong').getBoundingClientRect();
      const rect = row.getBoundingClientRect();
      const countStyles = getComputedStyle(row.querySelector('strong'));
      return {
        x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        background: cs.backgroundColor, shadow: cs.boxShadow,
        radius: cs.borderTopLeftRadius, borderBottom: cs.borderBottomWidth,
        labelX: label.x, countX: count.x, countBg: countStyles.backgroundColor,
        countRadius: countStyles.borderTopLeftRadius
      };
    });
    return { container: getComputedStyle(el).display, gap: getComputedStyle(el).rowGap, styles };
  });
  const [first, second] = geometry.styles;
  expect(geometry.container).toBe('flex');
  expect(geometry.gap).toBe('0px');
  expect(first.background).toBe('rgba(0, 0, 0, 0)');
  expect(first.shadow).toBe('none');
  expect(first.radius).toBe('0px');
  expect(first.borderBottom).toBe('1px');
  expect(first.countBg).toBe('rgba(0, 0, 0, 0)');
  expect(first.countRadius).toBe('0px');
  expect(first.labelX).toBeLessThan(first.countX);
  expect(Math.abs(first.y + first.height - second.y)).toBeLessThan(2);
  expect(Math.abs(first.width - second.width)).toBeLessThan(2);
});


test('Bestellübersicht: kombinierte Filter zeigen ausschließlich passende Bestellungen und Artikel', async ({ page }) => {
  const year = new Date().getFullYear();
  const orders = [
    { date: `${year}-03-15T11:00:00Z`, department:'Logistik', items:[{name:'Milch',quantity:2},{name:'Hafermilch',quantity:1}] },
    { date: `${year}-03-16T11:00:00Z`, department:'Werkstatt', items:[{name:'Milch',quantity:3},{name:'Glasreiniger',quantity:1}] },
    { date: `${year}-04-12T11:00:00Z`, department:'Logistik', items:[{name:'Milch',quantity:1},{name:'Spülmittel',quantity:2}] },
    { date: `${year}-04-17T11:00:00Z`, department:'Logistik', items:[{name:'Glasreiniger',quantity:2}] },
    { date: `${year-1}-03-15T11:00:00Z`, department:'Logistik', items:[{name:'Milch',quantity:9},{name:'Rohrreiniger',quantity:1}] }
  ];
  // Die Filterlogik wird mit festen Daten getestet, nicht der RPC-Transport.
  await page.goto('/#bestelluebersicht', { waitUntil:'domcontentloaded' });
  const yearLabel = page.locator('#order-selected-year');
  const total = page.locator('#order-count');
  const month = page.locator('#order-month-filter');
  const dept = page.locator('#order-dept-filter');
  const article = page.locator('#order-article-filter');
  const itemLabels = page.locator('#order-type-buttons .pickup-type-label');
  await expect(yearLabel).toHaveText(String(year));
  // In diesem Test die Statistikquelle gezielt durch einen unveränderlichen
  // Datensatz ersetzen. Asynchrone RPC-Antworten können ihn nicht überschreiben.
  await page.evaluate(testOrders => {
    const fixture = structuredClone(testOrders);
    readOrderStats = () => fixture;
    renderOrderStats();
  }, orders);
  await expect(total).toHaveText('4');
  await expect(itemLabels).toHaveCount(4);

  // Erst März auswählen: nur die zwei Bestellungen im März bleiben sichtbar.
  await month.selectOption('2');
  await expect(total).toHaveText('2');
  await expect(page.locator('#order-type-buttons')).toContainText('Milch');
  await expect(page.locator('#order-type-buttons')).not.toContainText('Spülmittel');

  // Mit dem Bereich kombinieren: Werkstatt-Produkte dürfen nicht angezeigt werden.
  await dept.selectOption('Logistik');
  await expect(total).toHaveText('1');
  await expect(itemLabels).toHaveText(['Hafermilch','Milch']);

  // Ein Artikel muss die dargestellten Positionen UND den Verlauf filtern.
  await article.selectOption('Milch');
  await expect(total).toHaveText('1');
  await expect(itemLabels).toHaveText(['Milch']);
  await page.locator('#order-type-buttons .pickup-type-button').click();
  await expect(page.locator('#order-history-list .pickup-row')).toHaveCount(1);
  await expect(page.locator('#order-history-list')).toContainText('Milch × 2');
  await expect(page.locator('#order-history-list')).not.toContainText('Hafermilch');
  await page.locator('#order-history-close').click();

  // Beim Jahreswechsel müssen Monat, Bereich und Artikel erhalten bleiben.
  await page.locator('#order-year-prev').click();
  await expect(yearLabel).toHaveText(String(year-1));
  await expect(month).toHaveValue('2');
  await expect(dept).toHaveValue('Logistik');
  await expect(article).toHaveValue('Milch');
  await expect(total).toHaveText('1');
  await expect(itemLabels).toHaveText(['Milch']);

  // Leere Schnittmenge: keine anderen Artikel als Ersatz anzeigen.
  await month.selectOption('3');
  await expect(total).toHaveText('0');
  await expect(itemLabels).toHaveCount(0);
  await expect(page.locator('#order-type-buttons')).toContainText('Keine Bestellungen für die ausgewählten Filter');
  await expect(dept).toHaveValue('Logistik');
  await expect(article).toHaveValue('Milch');

  await page.locator('#order-year-next').click();
  await expect(total).toHaveText('1');
  await expect(itemLabels).toHaveText(['Milch']);
  await page.locator('#order-filter-reset').click();
  await expect(yearLabel).toHaveText(String(year));
  await expect(month).toHaveValue('all');
  await expect(dept).toHaveValue('all');
  await expect(article).toHaveValue('all');
  await expect(total).toHaveText('4');
  await expect(itemLabels).toHaveCount(4);
});


test('Bestellübersicht: kleine Shopbilder vor jedem Artikel, weiterhin Textliste', async ({ page, isMobile }) => {
  await page.goto('/#bestelluebersicht', { waitUntil:'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => Boolean(window.facilityCatalogArticleMedia?.milch?.image))).toBe(true);
  await page.evaluate(() => {
    const year=new Date().getFullYear();
    readOrderStats=()=>[{
      date:`${year}-03-15T11:00:00Z`,
      department:'Logistik',
      items:[{name:'Milch',quantity:2},{name:'Individueller Testartikel',quantity:1}]
    }];
    renderOrderStats();
  });
  const rows=page.locator('#order-type-buttons .pickup-type-button');
  await expect(rows).toHaveCount(2);
  const milk=rows.filter({has:page.locator('.pickup-type-label', {hasText:'Milch'})});
  const fallback=rows.filter({has:page.locator('.pickup-type-label', {hasText:'Individueller Testartikel'})});
  await expect(milk.locator('.order-article-main > .order-article-thumb img')).toHaveAttribute('src','bilder/milch-edeka-aktuell.svg');
  await expect(milk.locator('.pickup-type-label')).toHaveText('Milch');
  await expect(milk.locator('strong')).toHaveText('1 ›');
  await expect(fallback.locator('.order-article-thumb')).toHaveText('📦');
  await expect(fallback.locator('.order-article-thumb img')).toHaveCount(0);
  const style=await milk.evaluate(row=>{
    const icon=row.querySelector('.order-article-thumb').getBoundingClientRect();
    const label=row.querySelector('.pickup-type-label').getBoundingClientRect();
    const number=row.querySelector('strong').getBoundingClientRect();
    const cs=getComputedStyle(row);
    return {iconWidth:icon.width, iconX:icon.x, labelX:label.x, numberX:number.x, shadow:cs.boxShadow, border:cs.borderBottomWidth, radius:cs.borderRadius};
  });
  expect(style.iconWidth).toBe(isMobile?28:32);
  expect(style.iconX).toBeLessThan(style.labelX);
  expect(style.labelX).toBeLessThan(style.numberX);
  expect(style.shadow).toBe('none');
  expect(style.radius).toBe('0px');
  // Zwischen den Einträgen bleibt eine Trennlinie; die letzte Zeile endet ohne Linie.
  await expect.poll(() => rows.first().evaluate(el => getComputedStyle(el).borderBottomWidth)).toBe('1px');
  await milk.click();
  await expect(page.locator('#order-history-section')).toBeVisible();
  await expect(page.locator('#order-history-list')).toContainText('Milch × 2');
  await expect(page.locator('#order-history-list')).not.toContainText('Individueller Testartikel');
});
