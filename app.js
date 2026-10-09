'use strict';
const PRODUCTS = Object.freeze([
  {id:'BM-007',name:'Milch',category:'Küche',symbol:'🥛',image:'milch-packung.svg',description:'Milch für Kaffee und den täglichen Bedarf.',unit:'Packung à 12 Stück (je 1 Liter)'},
  {id:'BM-008',name:'Hafermilch',category:'Küche',symbol:'🌾',description:'Haferdrink als pflanzliche Alternative zu Milch.',unit:'Packung à 6 Stück (je 1 Liter)'},
  {id:'BM-009',name:'Glasreiniger',category:'Allgemein',symbol:'🧴',unit:'1 Flasche à 1 Liter'},
  {id:'BM-010',name:"AdBlue (10 Liter)",category:"Fahrzeugzubehör",symbol:"🚗",unit:"1 Kanister à 10 Liter"},
  {id:'BM-011',name:"Scheibenreiniger (Sommer)",category:"Fahrzeugzubehör",symbol:"🚗",unit:"1 Kanister à 5 Liter"},
  {id:'BM-012',name:"Scheibenreiniger (Winter)",category:"Fahrzeugzubehör",symbol:"🚗",unit:"1 Kanister à 5 Liter"},
  {id:'BM-013',name:"Geschirrtücher",category:"Küche",symbol:"🧽",unit:"1 Stück"},
  {id:'BM-014',name:"Klarspüler",category:"Küche",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-015',name:"Mikrofasertücher",category:"Allgemein",symbol:"🧽",unit:"1 Stück"},
  {id:'BM-016',name:"Putzlappen",category:"Allgemein",symbol:"🧽",unit:"1 Stück"},
  {id:'BM-017',name:"Scheuermilch",category:"Küche",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-018',name:"Scheuerschwamm",category:"Küche",symbol:"🧽",unit:"Packung à 10 Stück"},
  {id:'BM-019',name:"Spülmaschinensalz",category:"Küche",symbol:"🧂",unit:"1 Stück"},
  {id:'BM-020',name:"Spülmittel",category:"Küche",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-021',name:"Spültabs",category:"Küche",symbol:"🫧",unit:"1 Packung"},
  {id:'BM-022',name:"Batterien",category:"Allgemein",symbol:"🔋",unit:"1 Packung"},
  {id:'BM-023',name:"Desinfektionsreiniger",category:"Allgemein",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-024',name:"Flüssigseife",category:"Allgemein",symbol:"🧼",unit:"1 Stück"},
  {id:'BM-025',name:"Kleber (UHU)",category:"Allgemein",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-026',name:"Kosmetikbeutel",category:"Allgemein",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-027',name:"Rohrreiniger",category:"Allgemein",symbol:"🧴",unit:"1 Stück"},
  {id:'VS-001',name:"Kartonagen 600×400×300 mm (1)",category:'Versand',symbol:'📦',unit:"1 Palette = 220 Stück",min:1},
  {id:'VS-002',name:"Kartonagen 400×300×200 mm (2)",category:'Versand',symbol:'📦',unit:"1 Palette = 720 Stück",min:1},
  {id:'VS-003',name:"Kartonagen 310×230×100–160 mm (3)",category:'Versand',symbol:'📦',unit:"1 Palette = 520 Stück",min:1},
  {id:'VS-004',name:"Kartonagen 400×400×300 mm (4)",category:'Versand',symbol:'📦',unit:"1 Palette = 520 Stück",min:1},
  {id:'VS-005',name:"Kartonagen 240×200×100 mm (5)",category:'Versand',symbol:'📦',unit:"1 Palette = 600 Stück",min:1},
  {id:'VS-006',name:"Kartonagen 600×300×200 mm (6)",category:'Versand',symbol:'📦',unit:"1 Palette = 300 Stück",min:1},
  {id:'VS-008',name:"Natronkraftpapier auf Rolle (90 g)",category:'Versand',symbol:'📦',image:'bilder/kraftpapier.svg',unit:"Egal wie viele",min:10},
  {id:'VS-009',name:"PVC-Klebeband, transparent, 50 mm",category:'Versand',symbol:'📦',image:'bilder/klebeband.svg',unit:"1 Karton = 36 Stück",min:3},
  {id:'VS-010',name:"Luftpolstertasche 18/H, 265 × 360 mm, braun",category:'Versand',symbol:'📦',image:'bilder/luftpolstertasche.svg',unit:"1 Pak = 100 Stück",min:6},
  {id:'VS-011',name:"Begleitpapiertasche",category:'Versand',symbol:'📦',image:'bilder/begleitpapiertasche.svg',unit:"1 Pak = 1000 Stück",min:1},
  {id:'VS-012',name:"DPD-Express-Klebeband",category:'Versand',symbol:'📦',image:'bilder/dpd-klebeband.svg',unit:"1 Pak = 6 Stück",min:2},
  {id:'VS-013',name:"Thermo-Haftetiketten auf Rolle 105×148 mm, Kern 40 mm",category:'Versand',symbol:'📦',image:'bilder/haftetiketten.svg',unit:"1 Karton = 50 Stück",min:1},
  {id:'VS-014',name:"Stretchfolie klein",category:'Versand',symbol:'📦',image:'bilder/stretchfolie.svg',unit:"1 Karton = 10 Rollen",min:1},
  {id:'VS-015',name:"Stretchfolie groß",category:'Versand',symbol:'📦',image:'bilder/stretchfolie.svg',unit:"1 Karton = 6 Rollen",min:1},
  {id:'VS-016',name:"Umreifungsband, Großrolle, 12,7 × 0,5 mm",category:'Versand',symbol:'📦',image:'bilder/umreifungsband.svg',unit:"1 Rolle",min:1},
  {id:'VS-017',name:"Verschlusshülsen für Umreifungsband, 13 × 28 × 0,5 mm",category:'Versand',symbol:'📦',image:'bilder/verschlusshuelsen.svg',unit:"1 Pak = 2000 Stück",min:1},
  {id:'VS-018',name:"Handabroller (Versand)",category:'Versand',symbol:'📦',image:'bilder/handabroller.svg',unit:"1 Stück",min:1}
]);
const RECIPIENT='michael.kohler@brillinger.de';
const cart=new Map();
let batteryType='';
const $=id=>document.getElementById(id);
let feedbackTimer;
function notify(message){$('feedback').textContent=message;clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>{$('feedback').textContent='';},3500);}
function minimum(product){return product.min||1;}
function quantity(value){const number=Number(value);return Number.isInteger(number)&&number>=1&&number<=999?number:null;}
function escapeHtml(value){return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function invalidateOrder(){$('email-fallback').hidden=true;$('order-text').value='';}
function quantityControl(product,value,kind){const label=kind==='cart'?'Bestellmenge':'Menge';return `<div class="quantity"><button type="button" data-step="-1" aria-label="${label} für ${product.name} verringern">−</button><input type="number" min="${minimum(product)}" max="999" step="1" value="${value}" aria-label="${label} für ${product.name}" data-kind="${kind}" data-id="${product.id}"><button type="button" data-step="1" aria-label="${label} für ${product.name} erhöhen">+</button></div>`;}
const CATEGORIES=['Alle','Allgemein','Fahrzeugzubehör','Küche','Versand','Werkzeug'];
let activeCategory='Alle';
let searchTerm='';
$('article-search').addEventListener('input',event=>{searchTerm=event.target.value.trim().toLocaleLowerCase('de');renderProducts();});
function renderProducts(){
  const categoryProducts=searchTerm?PRODUCTS:activeCategory===null?[]:activeCategory==='Alle'?PRODUCTS:PRODUCTS.filter(p=>p.category===activeCategory);
  const filtered=categoryProducts.filter(p=>!searchTerm||[p.name,p.category,p.unit].some(value=>value.toLocaleLowerCase('de').includes(searchTerm))).sort((a,b)=>a.name.localeCompare(b.name,'de',{numeric:true,sensitivity:'base'}));
  $('category-filters').innerHTML=CATEGORIES.map(category=>`<button type="button" class="category-button ${category===activeCategory?'active':''}" data-category="${category}" aria-pressed="${category===activeCategory}">${category}</button>`).join('');

  $('products').innerHTML=filtered.map(p=>`<article class="product"><div class="product-top">${p.image?`<img class="product-image" src="${p.image}" alt="${p.name} – Produktabbildung">`:`<span class="product-symbol" aria-hidden="true">${p.symbol}</span>`}</div><div class="product-body"><h3>${p.name}</h3><div class="unit">${p.unit}</div>${p.min?`<div class="unit">Mindestbestellmenge: ${p.min}</div>`:''}${p.id==='BM-022'?`<label class="battery-label" for="battery-type">Batterietyp / Größe</label><input class="battery-type" id="battery-type" type="text" maxlength="80" placeholder="z. B. AA, AAA, 9 V" value="${escapeHtml(batteryType)}" required>`:''}<div class="product-action">${quantityControl(p,minimum(p),'product')}<button type="button" class="primary" data-add="${p.id}">In den Warenkorb</button></div></div></article>`).join('');
  if(activeCategory===null&&!searchTerm)$('products').innerHTML='';
  else if(!filtered.length)$('products').innerHTML=searchTerm?'<p class="category-empty">Keine passenden Artikel gefunden.</p>':'<p class="category-empty">In dieser Kategorie sind noch keine Artikel hinterlegt.</p>';
}
renderProducts();

function renderCart(){const total=[...cart.values()].reduce((a,b)=>a+b,0);$('cart-count').textContent=total;$('position-count').textContent=`${cart.size} ${cart.size===1?'Position':'Positionen'}`;$('order-button').disabled=!cart.size;$('cart-items').innerHTML=cart.size?[...cart].map(([id,amount])=>{const p=PRODUCTS.find(p=>p.id===id);return `<div class="cart-item"><h3>${p.name}</h3><p>${p.unit}${id==='BM-022'&&batteryType?' · Typ: '+escapeHtml(batteryType):''}${p.min?` · Mindestbestellmenge: ${p.min}`:''}</p><div class="cart-controls">${quantityControl(p,amount,'cart')}<button type="button" class="remove" data-remove="${id}" aria-label="${p.name} aus dem Warenkorb entfernen">Entfernen</button></div></div>`;}).join(''):'<p class="empty">Dein Warenkorb ist noch leer.<br>Wähle Artikel aus dem Sortiment.</p>';$('cart-summary').innerHTML=cart.size?`<div class="summary">${total} Verpackungseinheiten insgesamt</div>`:'';}
document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-category')){activeCategory=button.dataset.category;renderProducts();return;}if(button.hasAttribute('data-step')){const input=button.parentElement.querySelector('input');const product=PRODUCTS.find(p=>p.id===input.dataset.id);const min=minimum(product);const current=quantity(input.value)||min;input.value=Math.max(min,Math.min(999,current+Number(button.dataset.step)));if(input.dataset.kind==='cart'){cart.set(input.dataset.id,Number(input.value));invalidateOrder();renderCart();}return;}if(button.dataset.add){const id=button.dataset.add;if(id==='BM-022'&&!batteryType.trim()){notify('Bitte den Batterietyp angeben (z. B. AA oder AAA).');$('battery-type')?.focus();return;}const input=button.parentElement.querySelector('input');const amount=quantity(input.value);if(!amount||amount<minimum(PRODUCTS.find(p=>p.id===id))){notify('Bitte die Mindestbestellmenge beachten.');return;}const next=(cart.get(id)||0)+amount;if(next>999){notify('Pro Artikel sind maximal 999 Verpackungseinheiten möglich.');return;}cart.set(id,next);invalidateOrder();renderCart();notify(`${PRODUCTS.find(p=>p.id===id).name} zum Warenkorb hinzugefügt.`);}if(button.dataset.remove){cart.delete(button.dataset.remove);invalidateOrder();renderCart();notify('Artikel entfernt.');}});
document.addEventListener('input',event=>{if(event.target.id==='battery-type'){batteryType=event.target.value;invalidateOrder();}});
document.addEventListener('change',event=>{const input=event.target;if(input.dataset.kind==='cart'){const amount=quantity(input.value);if(!amount||amount<minimum(PRODUCTS.find(p=>p.id===input.dataset.id))){notify('Bitte die Mindestbestellmenge beachten.');input.value=cart.get(input.dataset.id);return;}cart.set(input.dataset.id,amount);invalidateOrder();renderCart();}});
$('order-form').addEventListener('input',invalidateOrder);
function buildOrder(name,department,note){return ['Hallo,','','bitte folgende Materialien bestellen:','',...[...cart].map(([id,amount])=>{const p=PRODUCTS.find(p=>p.id===id);return `${amount} × ${p.name}${id==='BM-022'?' ('+batteryType+')':''} – ${p.unit}`;}).flatMap(item=>[item,'']),'',`Bestellt von: ${name}`,'',`Standort / Bereich: ${department}`, ...(note?[ '', `Anmerkung: ${note}` ]:[]),''].filter(line=>line!==null).join('\n');}
$('order-form').addEventListener('submit',event=>{event.preventDefault();if(!cart.size)return;if(cart.has('BM-022')&&!batteryType.trim()){notify('Bitte bei Batterien den Batterietyp angeben.');$('battery-type')?.focus();return;}for(const input of $('cart-items').querySelectorAll('input')){const amount=quantity(input.value);if(!amount||amount<minimum(PRODUCTS.find(p=>p.id===input.dataset.id))){notify('Bitte die Mindestbestellmenge beachten.');input.focus();return;}cart.set(input.dataset.id,amount);}const name=$('customer').value.trim();const department=$('department').value.trim();if(!name||!department){notify('Bitte Name und Standort / Bereich ausfüllen.');return;}const body=buildOrder(name,department,$('note').value.trim());$('order-text').value=body;$('email-fallback').hidden=false;const subject=`Materialbestellung Brillinger – ${name.replace(/[\r\n]/g,' ')}`;window.location.href=`mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;notify('E-Mail vorbereitet. Bitte im E-Mail-Programm absenden.');});
$('copy-order').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('order-text').value);notify('Bestelltext kopiert.');}catch{$('order-text').focus();$('order-text').select();notify('Bitte den markierten Bestelltext manuell kopieren.');}});
renderCart();
