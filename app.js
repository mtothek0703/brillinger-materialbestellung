'use strict';
const PRODUCTS = Object.freeze([
  {id:'BM-007',name:'Milch',category:'Küche',symbol:'🥛',image:'milch-packung.svg',description:'Milch für Kaffee und den täglichen Bedarf.',unit:'Packung à 12 Stück (je 1 Liter)'},
  {id:'BM-008',name:'Hafermilch',category:'Küche',symbol:'🌾',description:'Haferdrink als pflanzliche Alternative zu Milch.',unit:'Packung à 6 Stück (je 1 Liter)'},
  {id:'BM-009',name:'Glasreiniger',category:'Allgemein',symbol:'🧴',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Spray%20cleaner.jpg?width=400',unit:'1 Flasche à 1 Liter'},
  {id:'BM-010',name:"AdBlue (10 Liter)",category:"Fahrzeugzubehör",symbol:"🚗",image:'https://www.sonderpreis-baumarkt.de/on/demandware.static/-/Sites-spb_master/default/dw6416b507/01/19/28/47/1192847.jpg',unit:"1 Kanister à 10 Liter"},
  {id:'BM-011',name:"Scheibenreiniger (Sommer)",category:"Fahrzeugzubehör",symbol:"🚗",image:'https://panorama24.eu/cdn/shop/files/1200x1200-einzel.jpg?v=1696275275',unit:"1 Kanister à 5 Liter"},
  {id:'BM-012',name:"Scheibenreiniger (Winter)",category:"Fahrzeugzubehör",symbol:"🚗",image:'https://www.atp-autoteile.de/media/h/E37C5AD087A570EF958040AB8115DE6E4041D184/product/2000x2000/1421918-1-10813097-jpg.jpg',unit:"1 Kanister à 5 Liter"},
  {id:'BM-013',name:"Geschirrtücher",category:"Küche",symbol:"🧽",unit:"1 Stück"},
  {id:'BM-014',name:"Klarspüler",category:"Küche",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-015',name:"Mikrofasertücher",category:"Allgemein",symbol:"🧽",unit:"1 Stück"},
  {id:'BM-016',name:"Putzlappen",category:"Allgemein",symbol:"🧽",unit:"1 Stück"},
  {id:'BM-017',name:"Scheuermilch",category:"Küche",symbol:"🧴",image:'https://commons.wikimedia.org/wiki/Special:FilePath/Ahoi%20Blauwe%20Band%20Poets%20Creme.jpg?width=400',unit:"1 Stück"},
  {id:'BM-018',name:"Scheuerschwamm",category:"Küche",symbol:"🧽",unit:"Packung à 10 Stück"},
  {id:'BM-019',name:"Spülmaschinensalz",category:"Küche",symbol:"🧂",unit:"1 Stück"},
  {id:'BM-020',name:"Spülmittel",category:"Küche",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-021',name:"Spültabs",category:"Küche",symbol:"🫧",unit:"1 Packung"},
  {id:'BM-022',name:"Batterien",category:"Allgemein",symbol:"🔋",unit:"1 Packung"},
  {id:'BM-023',name:"Desinfektionsreiniger",category:"Allgemein",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-024',name:"Flüssigseife",category:"Allgemein",symbol:"🧼",image:'https://commons.wikimedia.org/wiki/Special:FilePath/Savons%20liquide.jpg?width=400',unit:"1 Stück"},
  {id:'BM-025',name:"Kleber (UHU)",category:"Allgemein",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-026',name:"Kosmetikbeutel",category:"Allgemein",symbol:"🧴",unit:"1 Stück"},
  {id:'BM-027',name:"Rohrreiniger",category:"Allgemein",symbol:"🧴",unit:"1 Stück"},
  {id:"BM-028",name:"Kabelbinder klein",category:"Allgemein",symbol:"🔗",unit:"1 Packung = 50 Stück"},
  {id:"BM-029",name:"Kabelbinder groß (7,6 × 450 mm)",category:"Allgemein",symbol:"🔗",unit:"1 Packung = 100 Stück"},
  {id:"BM-030",name:"Tageskontrollblätter (15-Minuten-Takt)",category:"Allgemein",symbol:"📋",unit:"50 Stück"},
  {id:"BM-031",name:"Empfangsbestätigung",category:"Allgemein",symbol:"📄",unit:"17 Stück"},
  {id:"BM-032",name:"Allplastik-Blitzbinder, 240 mm, rot",category:"Allgemein",symbol:"🔗",image:"data:image/png;base64,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",unit:"1 Karton = 1.000 Stück"},
  {id:"BM-033",name:"Cuttermesser Wedo Safety Standard",category:"Allgemein",symbol:"✂️",unit:"1 Karton = 6 Stück"},
  {id:"BM-034",name:"Cuttermesser Westcott Cutter Premium",category:"Allgemein",symbol:"✂️",unit:"1 Karton = 24 Stück"},
  {id:"BM-035",name:"Dymo-Schriftbandkassette für LabelWriter",category:"Allgemein",symbol:"🏷️",unit:"1 Stück"},
  {id:"BM-036",name:"Etiketten Dymo 54 × 101 mm, weiß, für Dymodrucker",category:"Allgemein",symbol:"🏷️",unit:"1 Stück"},
  {id:"BM-037",name:"Großraumtüte (Europack), 1.300 × 2.300 mm, 1.000 l",category:"Allgemein",symbol:"🛍️",unit:"1 Karton = 120 Stück"},
  {id:"BM-038",name:"Matratzentüte auf Rolle, 105 × 20 × 230 cm",category:"Allgemein",symbol:"🛍️",unit:"1 Rolle"},
  {id:"BU-001",name:"Edding 3000, 1,5–3 mm (schwarz/blau/rot/grün)",category:"Bürobedarf",symbol:"🖊️",unit:"1 Stück"},
  {id:"BU-002",name:"Edding 400, 1 mm (schwarz/blau/rot/grün)",category:"Bürobedarf",symbol:"🖊️",unit:"1 Stück"},
  {id:"BU-003",name:"Schere",category:"Bürobedarf",symbol:"✂️",unit:"1 Stück"},
  {id:"BU-004",name:"Locher",category:"Bürobedarf",symbol:"🗂️",unit:"1 Stück"},
  {id:"BU-005",name:"Tesafilm-Rolle, 10 m × 19 mm",category:"Bürobedarf",symbol:"🧻",unit:"1 Packung = 8 Rollen"},
  {id:"BU-006",name:"Tacker-Heftzange",category:"Bürobedarf",symbol:"📎",unit:"1 Stück"},
  {id:"BU-007",name:"Laminierfolie, klein, DIN A5",category:"Bürobedarf",symbol:"📄",unit:"1 Packung = 100 Stück"},
  {id:"BU-008",name:"Laminierfolie, groß, DIN A4",category:"Bürobedarf",symbol:"📄",unit:"1 Packung = 100 Stück"},
  {id:"BU-009",name:"Batterien Varta AA",category:"Bürobedarf",symbol:"🔋",unit:"1 Packung = 8 Stück"},
  {id:"BU-010",name:"Batterien Varta AAA",category:"Bürobedarf",symbol:"🔋",unit:"1 Packung = 8 Stück"},
  {id:"BU-011",name:"Gummiringe, 85 mm (Alco)",category:"Bürobedarf",symbol:"⭕",unit:"1 Packung = 1.000 g"},
  {id:'BM-039',name:'Würfelzucker 500 g',category:'Küche',symbol:'🧊',unit:'1 Packung à 500 g'},
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
const CATEGORIES=['Alle','Allgemein','Bürobedarf','Fahrzeugzubehör','Küche','Versand'];
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
