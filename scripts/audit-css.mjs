import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const files = ['styles/base.css', 'styles/refinements.css', 'styles/design-system.css'];
let important = 0;
let approvedFilterImportant = 0;
let approvedStickyImportant = 0;
let approvedNavImportant = 0;
let approvedOrderListImportant = 0;
let approvedResponsiveImportant = 0;
let totalRules = 0;
const duplicateDeclarations = [];
for (const path of files) {
  const text = readFileSync(path, 'utf8');
  const approvedFilterMarker = '/* Bestellübersicht: Bereichs- und Artikelfilter als eigenständige';
  const stickyMarker = '/* Bestellübersicht: Überschrift und die fünf Bedienelemente beim Scrollen';
  const navMarker = '/* Mobile Bottom-Navigation 2026:';
  const orderListMarker = '/* Bestellartikel als Zeilenliste 2026:';
  const responsiveMarker = '/* Smartphone-Querformat 2026:';
  const filterStart = text.indexOf(approvedFilterMarker);
  const stickyStart = text.indexOf(stickyMarker);
  if (filterStart !== -1) {
    const filterEnd = stickyStart > filterStart ? stickyStart : text.length;
    approvedFilterImportant += (text.slice(filterStart, filterEnd).match(/!important/g) || []).length;
  }
  if (stickyStart !== -1) approvedStickyImportant += (text.slice(stickyStart).match(/!important/g) || []).length;
  const navStart = text.indexOf(navMarker);
  const orderListStart = text.indexOf(orderListMarker);
  if (navStart !== -1) {
    const navEnd = orderListStart > navStart ? orderListStart : text.length;
    approvedNavImportant += (text.slice(navStart, navEnd).match(/!important/g) || []).length;
  }
  const responsiveStart = text.indexOf(responsiveMarker);
  if (orderListStart !== -1) {
    const orderListEnd = responsiveStart > orderListStart ? responsiveStart : text.length;
    approvedOrderListImportant += (text.slice(orderListStart,orderListEnd).match(/!important/g) || []).length;
  }
  if (responsiveStart !== -1) approvedResponsiveImportant += (text.slice(responsiveStart).match(/!important/g) || []).length;
  const root = postcss.parse(text, { from: path });
  root.walkRules(rule => {
    totalRules++;
    const earlier = new Set();
    rule.walkDecls(decl => {
      if (decl.important) important++;
      const key = decl.prop.toLowerCase() + ':' + decl.value.trim() + (decl.important ? '!important' : '');
      if (earlier.has(key)) duplicateDeclarations.push(path + ':' + decl.source.start.line);
      earlier.add(key);
    });
  });
}
console.log('CSS-Prüfung:', totalRules, 'Regeln,', important, '!important-Deklarationen, davon', approvedFilterImportant, 'für Filterbuttons und', approvedStickyImportant, 'für den fixierten Kopfbereich und', approvedNavImportant, 'für die einheitliche Bottom-Navigation und', approvedOrderListImportant, 'für die schlanke Bestellartikelliste und', approvedResponsiveImportant, 'für Querformat/Displaygrößen');
if (duplicateDeclarations.length) {
  console.warn('Unnötige gleiche Deklarationen innerhalb einzelner Regeln:', duplicateDeclarations.slice(0, 12).join(', '));
}
// Der Altbestand hat noch viele Overrides. Bis zur späteren visuellen Bereinigung
// darf die Zahl jedoch nicht wieder über das ursprüngliche Niveau ansteigen.
// Die mobile Filter-Gestaltung ist als ausdrücklich begrenzte Ausnahme
// zugelassen, weil sie sehr spezifische historische Overrides ablöst.
if (important - approvedFilterImportant - approvedStickyImportant - approvedNavImportant - approvedOrderListImportant - approvedResponsiveImportant > 3107 || approvedFilterImportant > 55 || approvedStickyImportant > 25 || approvedNavImportant > 85 || approvedOrderListImportant > 55 || approvedResponsiveImportant > 110) {
  console.error('CSS-Regelüberschreibungen haben das vereinbarte Budget überschritten.');
  process.exitCode = 1;
}
