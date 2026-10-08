'use strict';
const PRODUCTS = Object.freeze([
  {id:'BM-001',name:'Kopierpapier A4',category:'Allgemein',symbol:'📄',description:'Weißes Universalpapier, 80 g/m². Für Drucker und Kopierer.',unit:'Packung à 500 Blatt'},
  {id:'BM-002',name:'Kugelschreiber blau',category:'Allgemein',symbol:'🖊️',description:'Blau schreibende Kugelschreiber für den täglichen Einsatz.',unit:'Packung à 10 Stück'},
  {id:'BM-003',name:'Haftnotizen',category:'Allgemein',symbol:'🗒️',description:'Gelbe Haftnotizen, 76 × 76 mm. Für kurze Notizen und Erinnerungen.',unit:'Packung à 12 Blöcke'},
  {id:'BM-004',name:'Einmalhandschuhe M',category:'Allgemein',symbol:'🧤',description:'Puderfreie Nitrilhandschuhe in Größe M.',unit:'Box à 100 Stück'},
  {id:'BM-005',name:'Papierhandtücher',category:'Allgemein',symbol:'🧻',description:'Zweilagige Papierhandtücher mit Z-Faltung für passende Spender.',unit:'Karton à 3.000 Blatt'},
  {id:'BM-006',name:'Müllbeutel 60 Liter',category:'Allgemein',symbol:'♻️',description:'Reißfeste Müllbeutel für die Entsorgung im Arbeitsalltag.',unit:'Rolle à 20 Stück'},
  {id:'BM-007',name:'Milch',category:'Küche',symbol:'🥛',description:'Milch für Kaffee und den täglichen Bedarf.',unit:'Packung à 12 Stück (je 1 Liter)'}
]);
const RECIPIENT='michael.kohler@brillinger.de';
const cart=new Map();
const $=id=>document.getElementById(id);
let feedbackTimer;
function notify(message){$('feedback').textContent=message;clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>{$('feedback').textContent='';},3500);}
function quantity(value){const number=Number(value);return Number.isInteger(number)&&number>=1&&number<=999?number:null;}
function invalidateOrder(){$('email-fallback').hidden=true;$('order-text').value='';}
function quantityControl(product,value,kind){const label=kind==='cart'?'Bestellmenge':'Menge';return `<div class="quantity"><button type="button" data-step="-1" aria-label="${label} für ${product.name} verringern">−</button><input type="number" min="1" max="999" step="1" value="${value}" aria-label="${label} für ${product.name}" data-kind="${kind}" data-id="${product.id}"><button type="button" data-step="1" aria-label="${label} für ${product.name} erhöhen">+</button></div>`;}
const CATEGORIES=['Alle','Küche','Fahrzeuge','Versand','Werkzeug','Allgemein'];
let activeCategory=null;
function renderProducts(){
  const filtered=activeCategory===null?[]:activeCategory==='Alle'?PRODUCTS:PRODUCTS.filter(p=>p.category===activeCategory);
  $('category-filters').innerHTML=CATEGORIES.map(category=>`<button type="button" class="category-button ${category===activeCategory?'active':''}" data-category="${category}" aria-pressed="${category===activeCategory}">${category}</button>`).join('');

  $('products').innerHTML=filtered.map(p=>`<article class="product"><div class="product-top"><span class="product-symbol" aria-hidden="true">${p.symbol}</span><span class="product-category">${p.category}</span></div><div class="product-body"><p class="sku">${p.id}</p><h3>${p.name}</h3><p class="description">${p.description}</p><div class="unit">${p.unit}</div><div class="product-action">${quantityControl(p,1,'product')}<button type="button" class="primary" data-add="${p.id}">In den Warenkorb</button></div></div></article>`).join('');
  if(activeCategory===null)$('products').innerHTML='';
  else if(!filtered.length)$('products').innerHTML='<p class="category-empty">In dieser Kategorie sind noch keine Artikel hinterlegt.</p>';
}
renderProducts();

function renderCart(){const total=[...cart.values()].reduce((a,b)=>a+b,0);$('cart-count').textContent=total;$('position-count').textContent=`${cart.size} ${cart.size===1?'Position':'Positionen'}`;$('order-button').disabled=!cart.size;$('cart-items').innerHTML=cart.size?[...cart].map(([id,amount])=>{const p=PRODUCTS.find(p=>p.id===id);return `<div class="cart-item"><h3>${p.name}</h3><p>${p.unit}</p><div class="cart-controls">${quantityControl(p,amount,'cart')}<button type="button" class="remove" data-remove="${id}" aria-label="${p.name} aus dem Warenkorb entfernen">Entfernen</button></div></div>`;}).join(''):'<p class="empty">Dein Warenkorb ist noch leer.<br>Wähle Artikel aus dem Sortiment.</p>';$('cart-summary').innerHTML=cart.size?`<div class="summary">${total} Verpackungseinheiten insgesamt</div>`:'';}
document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-category')){activeCategory=button.dataset.category;renderProducts();return;}if(button.hasAttribute('data-step')){const input=button.parentElement.querySelector('input');const current=quantity(input.value)||1;input.value=Math.max(1,Math.min(999,current+Number(button.dataset.step)));if(input.dataset.kind==='cart'){cart.set(input.dataset.id,Number(input.value));invalidateOrder();renderCart();}return;}if(button.dataset.add){const id=button.dataset.add;const input=button.parentElement.querySelector('input');const amount=quantity(input.value);if(!amount){input.reportValidity();return;}const next=(cart.get(id)||0)+amount;if(next>999){notify('Pro Artikel sind maximal 999 Verpackungseinheiten möglich.');return;}cart.set(id,next);invalidateOrder();renderCart();notify(`${PRODUCTS.find(p=>p.id===id).name} zum Warenkorb hinzugefügt.`);}if(button.dataset.remove){cart.delete(button.dataset.remove);invalidateOrder();renderCart();notify('Artikel entfernt.');}});
document.addEventListener('change',event=>{const input=event.target;if(input.dataset.kind==='cart'){const amount=quantity(input.value);if(!amount){notify('Bitte eine ganze Menge zwischen 1 und 999 eingeben.');input.value=cart.get(input.dataset.id);return;}cart.set(input.dataset.id,amount);invalidateOrder();renderCart();}});
$('order-form').addEventListener('input',invalidateOrder);
function buildOrder(name,department,note){return ['Hallo Michael,','','bitte folgende Materialien bestellen:','',...[...cart].map(([id,amount])=>{const p=PRODUCTS.find(p=>p.id===id);return `${amount} × ${p.name} (${id}) – ${p.unit}`;}),'',`Bestellt von: ${name}`,`Abteilung / Lieferort: ${department}`,note?`Anmerkung: ${note}`:'','', 'Vielen Dank!'].filter(line=>line!==null).join('\n');}
$('order-form').addEventListener('submit',event=>{event.preventDefault();if(!cart.size)return;for(const input of $('cart-items').querySelectorAll('input')){const amount=quantity(input.value);if(!amount){input.reportValidity();input.focus();return;}cart.set(input.dataset.id,amount);}const name=$('customer').value.trim();const department=$('department').value.trim();if(!name||!department){notify('Bitte Name und Abteilung / Lieferort ausfüllen.');return;}const body=buildOrder(name,department,$('note').value.trim());$('order-text').value=body;$('email-fallback').hidden=false;const subject=`Materialbestellung Brillinger – ${name.replace(/[\r\n]/g,' ')}`;window.location.href=`mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;notify('E-Mail vorbereitet. Bitte im E-Mail-Programm absenden.');});
$('copy-order').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('order-text').value);notify('Bestelltext kopiert.');}catch{$('order-text').focus();$('order-text').select();notify('Bitte den markierten Bestelltext manuell kopieren.');}});
renderCart();
