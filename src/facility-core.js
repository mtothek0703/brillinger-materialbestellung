
function showFacilityManagementPage(){
 const hash=location.hash;
 const waste=hash==='#muellentsorgung';
 const overview=hash==='#entsorgungsuebersicht';
 const orders=hash==='#bestelluebersicht';
 const pickups=hash==='#leerungsuebersicht';
 const shop=!waste&&!overview&&!orders&&!pickups&&['#shop','#artikel','#warenkorb','#sonderartikel'].includes(hash);
 document.getElementById('home-view').hidden=shop||waste||overview||orders||pickups;
 document.getElementById('waste-view').hidden=!waste;
 document.getElementById('overview-menu-view').hidden=!overview;
 document.getElementById('order-overview-view').hidden=!orders;
 document.getElementById('waste-overview-view').hidden=!pickups;
 document.getElementById('shop-view').hidden=!shop;
 /* Der gemeinsame Aktualisieren-Button bleibt auf allen Hauptseiten an derselben Position. */
 const refreshButton=document.getElementById('home-refresh');
 
 const toolbar=document.getElementById('profile-toolbar');
 const profileButton=document.getElementById('profile-edit');
 const slot=document.getElementById('facility-profile-slot');
 if(profileButton.parentElement!==slot)slot.insertBefore(profileButton,slot.firstChild);
 toolbar.hidden=true;
 if(hash==='#shop'||hash==='#artikel'||hash==='#start'||waste||overview||orders||pickups){if(shop){const main=document.querySelector('#shop-view > main');if(main)main.scrollTop=0;}scrollTo(0,0);}
 document.dispatchEvent(new Event('facility:viewchange'));
}
window.addEventListener('hashchange',showFacilityManagementPage);
/* Desktop: Warenkorb als eigenständiges Dialogfenster öffnen. */
(function(){
 const cart=document.getElementById('warenkorb');
 const link=document.querySelector('#shop-view > header .cart-link');
 if(!cart||!link)return;
 const backdrop=document.createElement('div');
 backdrop.id='desktop-cart-backdrop';
 backdrop.setAttribute('aria-hidden','true');
 document.body.appendChild(backdrop);
 const close=document.createElement('button');
 close.type='button';
 close.id='desktop-cart-close';
 close.setAttribute('aria-label','Warenkorb schließen');
 close.textContent='×';
 cart.insertBefore(close,cart.firstChild);
 let previousHash='#shop';
 function openCart(){
  if(window.matchMedia('(max-width: 720px)').matches)return;
  document.body.classList.add('desktop-cart-open');
  cart.setAttribute('role','dialog');
  cart.setAttribute('aria-modal','true');
  cart.setAttribute('tabindex','-1');
  close.focus();
 }
 function closeCart(){
  document.body.classList.remove('desktop-cart-open');
  cart.removeAttribute('aria-modal');
  cart.removeAttribute('role');
  if(location.hash==='#warenkorb'){
   history.replaceState(null,'',previousHash==='#warenkorb'?'#shop':previousHash);
   showFacilityManagementPage();
  }
  link.focus();
 }
 link.addEventListener('click',event=>{
  if(window.matchMedia('(max-width: 720px)').matches)return;
  event.preventDefault();
  if(!document.body.classList.contains('desktop-cart-open')){
   previousHash=location.hash&&location.hash!=='#warenkorb'?location.hash:'#shop';
   if(location.hash!=='#warenkorb')history.pushState(null,'','#warenkorb');
   showFacilityManagementPage();
   openCart();
  }else closeCart();
 });
 close.addEventListener('click',closeCart);
 backdrop.addEventListener('click',closeCart);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&document.body.classList.contains('desktop-cart-open'))closeCart();
 });
 window.addEventListener('hashchange',()=>{
  if(window.matchMedia('(max-width: 720px)').matches){document.body.classList.remove('desktop-cart-open');return}
  if(location.hash==='#warenkorb')openCart();
  else document.body.classList.remove('desktop-cart-open');
 });
 window.addEventListener('resize',()=>{
  if(window.matchMedia('(max-width: 720px)').matches)document.body.classList.remove('desktop-cart-open');
  else if(location.hash==='#warenkorb')openCart();
 });
 if(location.hash==='#warenkorb')openCart();
})();
document.querySelectorAll('.home-tiles a').forEach(link=>{
 link.addEventListener('click',event=>{
  event.preventDefault();
  const target=link.getAttribute('href');
  if(location.hash!==target){
   if(window.matchMedia('(max-width:720px)').matches)history.replaceState(history.state,'',target);
   else history.pushState(null,'',target);
  }
  showFacilityManagementPage();
  if(target==='#shop'){
   document.documentElement.scrollTop=0;
   document.body.scrollTop=0;
   requestAnimationFrame(()=>{window.scrollTo({top:0,left:0,behavior:'instant'});document.documentElement.scrollTop=0;document.body.scrollTop=0;});
  }
 });
});
/* Desktop-Kopfzeile vermessen, damit Shop-Inhalt bei jeder Bildschirmbreite
   exakt unter dem fixierten Header beginnt. */
(function(){
 function syncDesktopHeaderHeight(){
  if(!window.matchMedia('(min-width:721px)').matches)return;
  const header=document.querySelector('#shop-view > header');
  if(!header)return;
  const height=Math.ceil(header.getBoundingClientRect().height);
  if(height>0)document.documentElement.style.setProperty('--desktop-shop-header-height',height+'px');
 }
 window.addEventListener('resize',syncDesktopHeaderHeight,{passive:true});
 window.addEventListener('hashchange',()=>requestAnimationFrame(syncDesktopHeaderHeight));
 window.addEventListener('load',()=>{
  syncDesktopHeaderHeight();
  const header=document.querySelector('#shop-view > header');
  if(header&&typeof ResizeObserver!=='undefined')new ResizeObserver(syncDesktopHeaderHeight).observe(header);
 });
 document.addEventListener('DOMContentLoaded',syncDesktopHeaderHeight);
})();
/* Desktop: Abmessungen des Sonderartikelbuttons aus dem tatsaechlichen Suchfeld
   uebernehmen. So bleiben beide unabhaengig von Schrift-/Browser-Skalierung
   pixelgenau auf gleicher Hoehe und derselben horizontalen Linie. */
(function(){
 function alignDesktopSearchAction(){
  const button=document.querySelector('#shop-view .mobile-sticky-controls > a.custom-entry-link');
  const input=document.getElementById('article-search');
  if(!button||!input)return;
  if(!window.matchMedia('(min-width:721px)').matches){
   button.style.removeProperty('height');
   button.style.removeProperty('min-height');
   button.style.removeProperty('max-height');
   button.style.removeProperty('transform');
   return;
  }
  const search=input.getBoundingClientRect();
  if(search.height<=0)return;
  const size=search.height+'px';
  for(const property of ['height','min-height','max-height'])
   button.style.setProperty(property,size,'important');
  button.style.setProperty('transform','none','important');
  const rect=button.getBoundingClientRect();
  const offset=search.top-rect.top;
  if(Math.abs(offset)>.25)button.style.setProperty('transform','translateY('+offset+'px)','important');
 }
 function start(){
  alignDesktopSearchAction();
  requestAnimationFrame(alignDesktopSearchAction);
  const input=document.getElementById('article-search');
  if(input&&typeof ResizeObserver!=='undefined'){
   new ResizeObserver(alignDesktopSearchAction).observe(input);
  }
 }
 window.addEventListener('load',start);
 window.addEventListener('resize',alignDesktopSearchAction,{passive:true});
 window.addEventListener('hashchange',()=>requestAnimationFrame(alignDesktopSearchAction));
 document.addEventListener('DOMContentLoaded',start);
})();
/* PC: Abstand fuer die fixierte Such- und Kategorienleiste messen.
   Auch bei anderen Browser-Zoomstufen und geaenderten Kategorien korrekt. */
(function(){
 function measure(){
  if(!window.matchMedia('(min-width:721px)').matches)return;
  const shop=document.getElementById('shop-view');
  const controls=shop?.querySelector('.mobile-sticky-controls');
  const main=shop?.querySelector(':scope > main');
  const header=shop?.querySelector(':scope > header');
  if(!shop||shop.hidden||!controls||!main||!header||getComputedStyle(controls).display==='none')return;
  const root=document.documentElement;
  const height=Math.ceil(controls.getBoundingClientRect().height);
  const rect=main.getBoundingClientRect();
  const style=getComputedStyle(main);
  const left=Math.round(rect.left+parseFloat(style.paddingLeft||0));
  const width=Math.max(200,Math.round(rect.width-parseFloat(style.paddingLeft||0)-parseFloat(style.paddingRight||0)));
  const top=Math.ceil(header.getBoundingClientRect().bottom);
  const vars={
   '--desktop-fixed-filters-height':height+'px',
   '--desktop-filters-left':left+'px',
   '--desktop-filters-width':width+'px',
   '--desktop-filters-top':top+'px'
  };
  for(const [key,value] of Object.entries(vars))
   if(root.style.getPropertyValue(key)!==value)root.style.setProperty(key,value);
 }
 function init(){
  measure();
  requestAnimationFrame(measure);
  const controls=document.querySelector('#shop-view .mobile-sticky-controls');
  if(controls&&typeof ResizeObserver!=='undefined')new ResizeObserver(measure).observe(controls);
 }
 document.addEventListener('DOMContentLoaded',init);
 window.addEventListener('load',measure);
 window.addEventListener('resize',measure,{passive:true});
 window.addEventListener('hashchange',()=>requestAnimationFrame(measure));
})();
/* PC: Warenkorb immer direkt unter der sichtbaren Such-/Kategorienleiste.
   Koordinaten im Viewport statt addierter fixer CSS-Hoehen verwenden. */
(function(){
 let pending=false;
 function syncDesktopCartPosition(){
  pending=false;
  if(!window.matchMedia('(min-width:721px)').matches)return;
  const shop=document.getElementById('shop-view');
  if(!shop||shop.hidden||document.body.classList.contains('desktop-cart-open'))return;
  const controls=shop.querySelector('.mobile-sticky-controls');
  const header=shop.querySelector(':scope > header');
  const cart=shop.querySelector('#warenkorb');
  if(!controls||!header||!cart||document.body.classList.contains('custom-entry-view'))return;
  const controlsRect=controls.getBoundingClientRect();
  const headerRect=header.getBoundingClientRect();
  if(controlsRect.height<=0||headerRect.height<=0)return;
  const top=Math.max(headerRect.bottom,controlsRect.bottom)+14;
  const bounded=Math.min(Math.round(top),Math.max(0,innerHeight-120));
  const value=bounded+'px';
  const layout=shop.querySelector('.shop-layout');
  const layoutRect=layout?.getBoundingClientRect();
  const width=innerWidth<=1050?330:370;
  const right=layoutRect?Math.max(12,Math.round(innerWidth-layoutRect.right)):24;
  const values={
   '--desktop-cart-top':value,
   '--desktop-cart-right':right+'px',
   '--desktop-cart-width':width+'px'
  };
  for(const [key,next] of Object.entries(values))
   if(document.documentElement.style.getPropertyValue(key)!==next)
    document.documentElement.style.setProperty(key,next);
 }
 function schedule(){
  if(pending)return;
  pending=true;
  requestAnimationFrame(syncDesktopCartPosition);
 }
 function init(){
  schedule();
  const shop=document.getElementById('shop-view');
  const controls=shop?.querySelector('.mobile-sticky-controls');
  const header=shop?.querySelector(':scope > header');
  if(typeof ResizeObserver!=='undefined'&&controls&&header){
   const observer=new ResizeObserver(schedule);
   observer.observe(controls);
   observer.observe(header);
  }
 }
 document.addEventListener('DOMContentLoaded',init);
 window.addEventListener('load',schedule);
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('scroll',schedule,{passive:true});
 window.addEventListener('hashchange',schedule);
})();
/* Smartphone: reale Oberkante der unteren Navigation bestimmt das Ende
   des gesamten Shop-Viewports (nicht die Hoehe eines Artikels oder main).
   Keine zusaetzlichen margin-bottom-Abstaende an den Artikeln. */
(function(){
 const nav=document.getElementById('facility-home-nav');
 const shop=document.getElementById('shop-view');
 if(!nav||!shop)return;
 const mobile=window.matchMedia('(max-width:720px)');
 function sync(){
  if(!mobile.matches)return;
  const navTop=nav.getBoundingClientRect().top;
  const shopTop=shop.getBoundingClientRect().top;
  // Wichtig: Der Shop kann bei iOS gegenueber dem Bildschirm verschoben sein.
  // Deshalb NICHT navTop als Hoehe verwenden, sondern die Differenz.
  const height=Math.round(navTop-shopTop);
  const max=Math.round(window.innerHeight);
  if(shop.hidden||height<250||height>max+120)return;
  const value=height+'px';
  if(shop.style.getPropertyValue('--facility-shop-visible-height')!==value)
   shop.style.setProperty('--facility-shop-visible-height',value);
 }
 function schedule(){requestAnimationFrame(sync);}
 schedule();
 document.addEventListener('DOMContentLoaded',schedule);
 document.addEventListener('facility:viewchange',schedule);
 window.addEventListener('load',schedule);
 window.addEventListener('resize',schedule,{passive:true});
 window.addEventListener('hashchange',schedule);
 if(window.visualViewport)window.visualViewport.addEventListener('resize',schedule,{passive:true});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(schedule).observe(nav);
})();
/* Smartphone: Bestell-/Statusmeldungen sind vom scrollbaren
   Shopinhalt unabhaengig und erscheinen unterhalb des blauen Headers. */
(function(){
 const feedback=document.getElementById('feedback');
 const main=document.querySelector('#shop-view > main');
 if(!feedback||!main)return;
 const mobile=window.matchMedia('(max-width:720px)');
 function sync(){
  if(mobile.matches){
   if(feedback.parentElement!==document.body)document.body.appendChild(feedback);
  }else if(feedback.parentElement!==main){
   main.appendChild(feedback);
  }
 }
 sync();
 window.addEventListener('resize',sync,{passive:true});
})();
/* Smartphone-Warenkorb: Original-Bestellbutton ausserhalb des
   scrollenden main positionieren. Das form-Attribut stellt sicher,
   dass weiterhin dasselbe Bestellformular abgeschickt wird. */
(function(){
 const button=document.getElementById('order-button');
 const form=document.getElementById('order-form');
 const nav=document.getElementById('facility-home-nav');
 if(!button||!form||!nav)return;
 const mobile=window.matchMedia('(max-width:720px)');
 button.setAttribute('form','order-form');
 function sync(){
  const show=mobile.matches&&document.body.classList.contains('mobile-cart-view');
  if(show){
   if(button.parentElement!==document.body)document.body.appendChild(button);
   const rect=nav.getBoundingClientRect();
   const below=Math.max(0,window.innerHeight-rect.top);
   const bottom=Math.max(68,Math.min(180,Math.ceil(below+10)))+'px';
   if(document.documentElement.style.getPropertyValue('--mobile-order-bottom')!==bottom)
    document.documentElement.style.setProperty('--mobile-order-bottom',bottom);
  }else if(button.parentElement!==form){
   form.appendChild(button);
  }
 }
 function later(){requestAnimationFrame(sync)}
 sync();
 document.addEventListener('facility:viewchange',later);
 window.addEventListener('hashchange',later);
 window.addEventListener('pageshow',later);
 window.addEventListener('DOMContentLoaded',later);
 window.addEventListener('resize',later,{passive:true});
 if(window.visualViewport)window.visualViewport.addEventListener('resize',later,{passive:true});
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(later).observe(nav);
})();
/* Smartphone: Lupe in der unteren Navigation oeffnet die vorhandene
   Artikelsuche als aufklappbares Feld. Suche/Filter bleiben dieselben. */
(function(){
 const button=document.getElementById('facility-search-toggle');
 const input=document.getElementById('article-search');
 const shop=document.getElementById('shop-view');
 if(!button||!input||!shop)return;
 const isMobile=()=>window.matchMedia('(max-width:720px)').matches;
 const searchBox=shop.querySelector('.product-search');
 const originalParent=searchBox?.parentElement;
 const originalNext=searchBox?.nextSibling;
 const suggestions=document.getElementById('shop-search-suggestions');
 const products=document.getElementById('products');
 const productsParent=products?.parentElement;
 const productsNext=products?.nextSibling;
 const resultsPanel=document.createElement('div');
 resultsPanel.id='facility-mobile-search-results';
 resultsPanel.hidden=true;
 document.body.appendChild(resultsPanel);
 function positionResults(){
  if(resultsPanel.hidden||!isMobile())return;
  const header=shop.querySelector(':scope > header');
  const categories=shop.querySelector(':scope > .mobile-sticky-controls');
  // Kategorien beginnen unter dem Header und bleiben waehrend der Suche fest.
  const headerBottom=header?.getBoundingClientRect().bottom||86;
  const categoryHeight=categories?.offsetHeight||0;
  const categoryBottom=Math.max(headerBottom,categories?.getBoundingClientRect().bottom||0,86+categoryHeight);
  const top=Math.ceil(categoryBottom+14);
  // iOS-Klaviatur: Suchleiste nur an der tatsaechlich sichtbaren Unterkante halten.
  // Kein Setzen von 'top' auf dem Suchfeld: dadurch sprang es bei jeder Eingabe.
  if(searchBox){
   searchBox.style.removeProperty('top');
   searchBox.style.removeProperty('bottom');
  }
  const searchTop=searchBox?.getBoundingClientRect().top||window.innerHeight-160;
  // Auch mit geoeffneter iPhone-Tastatur immer Treffer anzeigen.
  // Vorher wurde bei <80px verfuegbarem Platz das komplette Ergebnis
  // unsichtbar geschaltet; deshalb war der grosse Bereich leer.
  const visibleViewport=window.visualViewport;
  const viewportBottom=(visibleViewport?.offsetTop||0)+(visibleViewport?.height||window.innerHeight);
  const usableTop=Math.max(86,top);
  const usableBottom=Math.min(searchTop,viewportBottom);
  const available=Math.max(0,Math.floor(usableBottom-usableTop-8));
  const contentHeight=products?products.scrollHeight+24:available;
  resultsPanel.style.top=usableTop+'px';
  resultsPanel.style.height=Math.max(0,Math.min(available,contentHeight))+'px';
  resultsPanel.style.removeProperty('display');
 }
 function syncResults(open){
  if(!products||!productsParent)return;
  if(open){
   if(suggestions&&suggestions.parentElement!==resultsPanel)resultsPanel.prepend(suggestions);
   if(products.parentElement!==resultsPanel)resultsPanel.appendChild(products);
   resultsPanel.hidden=false;
   resultsPanel.scrollTop=0;
   requestAnimationFrame(()=>requestAnimationFrame(positionResults));
  }else{
   resultsPanel.hidden=true;
   if(suggestions&&suggestions.parentElement!==productsParent)productsParent.insertBefore(suggestions,products);
   if(products.parentElement!==productsParent)
    productsParent.insertBefore(products,productsNext&&productsNext.parentNode===productsParent?productsNext:null);
  }
 }

 function setOpen(open){
  open=Boolean(open&&isMobile()&&!shop.hidden&&!document.body.classList.contains('mobile-cart-view')&&!document.body.classList.contains('custom-entry-view'));
  // Mobil liegt das Suchfeld dauerhaft ausserhalb der oberen Steuerleiste.
  // Nur die Lupe unten blendet es ein; dadurch bleibt oben kein Such-Platz.
  if(isMobile()&&searchBox&&searchBox.parentElement!==document.body)
   document.body.appendChild(searchBox);
  if(!isMobile()&&searchBox&&originalParent&&searchBox.parentElement!==originalParent)
   originalParent.insertBefore(searchBox,originalNext&&originalNext.parentNode===originalParent?originalNext:null);
  const wasOpen=document.body.classList.contains('facility-search-open');
  document.body.classList.toggle('facility-search-open',open);
  if(open!==wasOpen||!open&&products?.parentElement===resultsPanel)syncResults(open);
  else if(open)requestAnimationFrame(positionResults);
  button.setAttribute('aria-expanded',String(open));
  button.setAttribute('aria-label',open?'Artikelsuche schließen':'Artikelsuche öffnen');
 }
 button.addEventListener('click',()=>{
  if(document.body.classList.contains('facility-search-open')){
   setOpen(false);
   input.blur();
   return;
  }
  if(shop.hidden||document.body.classList.contains('mobile-cart-view')||document.body.classList.contains('custom-entry-view')){
   location.hash='#artikel';
   requestAnimationFrame(()=>{
    setOpen(true);
    revealSearchResults();
    input.focus({preventScroll:true});
   });
  }else{
   setOpen(true);
   revealSearchResults();
   requestAnimationFrame(()=>input.focus({preventScroll:true}));
  }
 });
 // Beim Scrollen der Artikelliste wird die aufgeklappte Suche geschlossen.
 // Ein normales Antippen oder Schreiben im Suchfeld schliesst sie nicht.
 const articleScroller=shop.querySelector(':scope > main');
 const scrollContainers=[articleScroller,shop].filter(Boolean);
 // Bei Suche immer die ersten Treffer statt der zuvor gescrollten letzten Artikel zeigen.
 // Tastatur-Oeffnen und Eingaben duerfen die Suche nicht unbeabsichtigt schliessen.
 // Keine automatische Scrollbewegung beim Tippen oder Oeffnen der Tastatur:
 // iOS verschiebt sonst den Treffer unter die feststehende Kategorienleiste.
 // Nur beim erstmaligen Oeffnen der Suche ggf. den Shop sanft an den Anfang bringen.
 function revealSearchResults(){
  if(!isMobile()||!document.body.classList.contains('facility-search-open'))return;
  const main=shop.querySelector(':scope > main');
  if(main&&main.scrollTop>0)main.scrollTop=0;
  if(shop.scrollTop>0)shop.scrollTop=0;
 }
 input.addEventListener('input',()=>requestAnimationFrame(()=>{if(!resultsPanel.hidden){resultsPanel.scrollTop=0;positionResults();}}));
 // iPhone-Tastatur: Suchfeld am sichtbaren Viewport ausrichten, ohne die App zu scrollen.
 function syncSearchKeyboard(){
  if(!isMobile())return;
  const viewport=window.visualViewport;
  const keyboardInset=viewport?Math.max(0,window.innerHeight-(viewport.offsetTop+viewport.height)):0;
  const keyboardOpen=document.activeElement===input&&keyboardInset>100;
  document.body.classList.toggle('facility-search-keyboard-open',keyboardOpen);
  document.documentElement.style.setProperty('--facility-search-keyboard-inset',keyboardOpen?keyboardInset+'px':'0px');
  positionResults();
 }
 if(window.visualViewport){
  window.visualViewport.addEventListener('resize',()=>requestAnimationFrame(syncSearchKeyboard),{passive:true});
  window.visualViewport.addEventListener('scroll',()=>requestAnimationFrame(syncSearchKeyboard),{passive:true});
 }
 input.addEventListener('focus',()=>requestAnimationFrame(syncSearchKeyboard));
 input.addEventListener('blur',()=>{requestAnimationFrame(syncSearchKeyboard);});

 window.addEventListener('resize',()=>requestAnimationFrame(positionResults),{passive:true});
  input.setAttribute('enterkeyhint','done');
 input.addEventListener('keydown',event=>{
  if(event.key==='Enter'){event.preventDefault();input.blur();}
 });
 const previousPositions=new Map(scrollContainers.map(el=>[el,el.scrollTop]));
 for(const container of scrollContainers){
  container.addEventListener('scroll',()=>{
   const current=container.scrollTop;
   const previous=previousPositions.get(container)??current;
   previousPositions.set(container,current);
   if(!isMobile()||!document.body.classList.contains('facility-search-open'))return;
   // Scrolling im Hintergrund soll die mobile Suche nicht unerwartet schliessen.
   if(Math.abs(current-previous)<2)return;
  },{passive:true});
 }
 window.addEventListener('hashchange',()=>{
  if(location.hash!=='#artikel'&&location.hash!=='#shop')setOpen(false);
 });
 window.addEventListener('resize',()=>{if(!isMobile())setOpen(false);else requestAnimationFrame(positionResults);},{passive:true});
 setOpen(false);
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&document.body.classList.contains('facility-search-open'))setOpen(false);
 });
})();
async function refreshFacilityApp(button){
 if(button)button.disabled=true;
 try{await window.facilityApplyUpdates?.();}
 finally{if(button)button.disabled=false;}
}



/* Leerungsanforderungen: Klick auf Restmüll dokumentieren, nicht bestätigte Abholungen. */
const statsResetKey='brillinger-statistik-reset-20261010';
if(localStorage.getItem(statsResetKey)!=='done'){
 localStorage.removeItem('brillinger-restmuell-anforderungen-v2');
 localStorage.removeItem('brillinger-bestellstatistik-v1');
 localStorage.setItem(statsResetKey,'done');
}
/* Einmaliger Reset der lokalen Bestell- und Leerungsstatistiken. */
const fullStatsResetKey='brillinger-statistik-reset-20261011-alle';
if(localStorage.getItem(fullStatsResetKey)!=='done'){
 for(const key of ['brillinger-bestellstatistik-v1','brillinger-entsorgungsanforderungen-v1','brillinger-restmuell-anforderungen-v2']){
  localStorage.removeItem(key);
 }
 localStorage.setItem(fullStatsResetKey,'done');
}
const requestStorageKey='brillinger-entsorgungsanforderungen-v1';
const legacyRequestStorageKey='brillinger-restmuell-anforderungen-v2';
const wasteTypes=[
 ['waste-rest','Restmüll'],
 ['waste-paper','Kartonagen'],
 ['waste-electronics','Elektroschrott'],
 ['waste-wood','Holz'],
 ['waste-metal','Metallschrott']
];
let sharedFacilityStats={orders:[],waste:[]};
let sharedFacilityStatsReady=false;
async function loadSharedFacilityStats(){
 try{
  const response=await fetch('https://xiiaklqnchmtbmgtijxo.supabase.co/rest/v1/rpc/facility_statistics_summary',{method:'POST',headers:{'apikey':'sb_publishable_bRcUeUgZI3OQrupuTPNWQA_GQW9YLbf','Content-Type':'application/json'},body:'{}',cache:'no-store'});
  if(!response.ok)throw Error('Statistik nicht erreichbar');
  const result=await response.json();
  sharedFacilityStats={orders:Array.isArray(result.orders)?result.orders:[],waste:Array.isArray(result.waste)?result.waste:[]};
  sharedFacilityStatsReady=true;
  renderRequests();renderOrderStats();
 }catch(e){console.warn('Zentrale Statistik nicht geladen',e);sharedFacilityStatsReady=false;}
}
const facilityStatsViews=['#entsorgungsuebersicht','#bestelluebersicht','#leerungsuebersicht'];
let facilityStatsLoading=false;
async function refreshFacilityStatsIfVisible(){
 if(document.hidden||!facilityStatsViews.includes(location.hash)||facilityStatsLoading)return;
 facilityStatsLoading=true;
 try{await loadSharedFacilityStats();}finally{facilityStatsLoading=false;}
}
window.addEventListener('hashchange',refreshFacilityStatsIfVisible);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshFacilityStatsIfVisible();});
window.addEventListener('focus',refreshFacilityStatsIfVisible);
setInterval(refreshFacilityStatsIfVisible,30000);
if(facilityStatsViews.includes(location.hash))setTimeout(refreshFacilityStatsIfVisible,0);
function getRequests(){
 if(sharedFacilityStatsReady)return sharedFacilityStats.waste;
 let entries=[];
 try{
  const values=JSON.parse(localStorage.getItem(requestStorageKey)||'[]');
  if(Array.isArray(values))entries=values.filter(v=>v&&typeof v.date==='string'&&!isNaN(Date.parse(v.date))&&wasteTypes.some(t=>t[1]===v.type));
 }catch(e){console.warn('Entsorgungsanforderungen konnten nicht gelesen werden',e);}
 try{
  const legacy=JSON.parse(localStorage.getItem(legacyRequestStorageKey)||'[]');
  if(Array.isArray(legacy))entries.push(...legacy.filter(v=>typeof v==='string'&&!isNaN(Date.parse(v))).map(date=>({date,type:'Restmüll'})));
 }catch(e){console.warn('Alte Restmüllanforderungen konnten nicht gelesen werden',e);}
 return entries;
}
let selectedPickupYear=new Date().getFullYear();
let selectedPickupType=null;
let selectedWasteMonth='all';
let selectedWasteSite='all';
function closePickupHistory(){
 document.getElementById('pickup-history-section').hidden=true;
 document.getElementById('pickup-history-backdrop').hidden=true;
 document.body.classList.remove('pickup-history-open');
}
function openPickupHistory(){
 renderRequests();
 document.getElementById('pickup-history-section').hidden=false;
 document.getElementById('pickup-history-backdrop').hidden=false;
 document.body.classList.add('pickup-history-open');
 document.getElementById('pickup-history-close').focus();
}
document.getElementById('pickup-history-close').addEventListener('click',closePickupHistory);
document.getElementById('pickup-history-backdrop').addEventListener('click',closePickupHistory);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('pickup-history-open'))closePickupHistory();});
window.addEventListener('hashchange',closePickupHistory);
function renderRequests(){
 const allEntries=getRequests();
 const months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
 const monthSelect=document.getElementById('waste-month-filter');
 monthSelect.replaceChildren(new Option('Alle Monate','all'),...months.map((name,i)=>new Option(name,String(i))));
 monthSelect.value=selectedWasteMonth;
 const siteSelect=document.getElementById('waste-site-filter');
 const sites=[...new Set(['Handwerkerpark 25','Kirchentellinsfurt',...allEntries.map(v=>String(v.site||'').trim()).filter(Boolean)])].sort((a,b)=>a.localeCompare(b,'de'));
 siteSelect.replaceChildren(new Option('Alle Standorte','all'),...sites.map(site=>new Option(site,site)));
 if(selectedWasteSite!=='all'&&!sites.includes(selectedWasteSite))selectedWasteSite='all';
 siteSelect.value=selectedWasteSite;
 const entries=allEntries.filter(v=>new Date(v.date).getFullYear()===selectedPickupYear&&(selectedWasteMonth==='all'||String(new Date(v.date).getMonth())===selectedWasteMonth)&&(selectedWasteSite==='all'||String(v.site||'').trim()===selectedWasteSite)).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
 document.getElementById('pickup-selected-year').textContent=String(selectedPickupYear);
 document.getElementById('pickup-total').textContent=entries.length;
 const types=document.getElementById('pickup-types');types.replaceChildren();
 wasteTypes.forEach(([,name])=>{
  const row=document.createElement('button');row.type='button';row.className='pickup-row pickup-type-button';
  row.setAttribute('aria-pressed',String(selectedPickupType===name));
  const label=document.createElement('span');label.className='pickup-type-label';label.textContent=name;
  const amount=entries.filter(v=>v.type===name).length;
  const count=document.createElement('strong');count.textContent=String(amount)+' ›';
  row.append(label,count);
  row.addEventListener('click',()=>{
   selectedPickupType=name;
   openPickupHistory();
  });
  types.appendChild(row);
 });
 const list=document.getElementById('pickup-list');list.replaceChildren();
 const history=document.getElementById('pickup-history-title');
 history.textContent=selectedPickupType?'Leerungsverlauf: '+selectedPickupType:'Leerungsverlauf';
 const filtered=selectedPickupType?entries.filter(v=>v.type===selectedPickupType):entries;
 if(!filtered.length){const empty=document.createElement('p');empty.textContent='Für '+(selectedPickupType||'die Entsorgung')+' wurden '+selectedPickupYear+' noch keine Anforderungen erfasst.';list.appendChild(empty);return;}
 filtered.forEach(value=>{
  const row=document.createElement('div');row.className='pickup-row';
  const label=document.createElement('span');label.textContent=value.type+(value.site?' · '+value.site:'')+' · '+new Date(value.date).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'});
  row.appendChild(label);list.appendChild(row);
 });
}
document.getElementById('waste-month-filter').addEventListener('change',event=>{selectedWasteMonth=event.target.value;renderRequests();});
document.getElementById('waste-site-filter').addEventListener('change',event=>{selectedWasteSite=event.target.value;renderRequests();});
document.getElementById('waste-filter-reset').addEventListener('click',()=>{selectedWasteMonth='all';selectedWasteSite='all';renderRequests();});
document.getElementById('pickup-all-history').addEventListener('click',()=>{
 selectedPickupType=null;
 openPickupHistory();
});
document.getElementById('pickup-year-prev').addEventListener('click',()=>{selectedPickupYear--;renderRequests();});
document.getElementById('pickup-year-next').addEventListener('click',()=>{selectedPickupYear++;renderRequests();});
/* Sichtbare Statusmeldung fuer Entsorgungsanforderungen */
const wasteStatusDialog=document.createElement('dialog');
wasteStatusDialog.id='waste-status-dialog';
wasteStatusDialog.style.cssText='border:0;border-radius:18px;padding:28px;max-width:min(440px,calc(100vw - 36px));width:100%;box-shadow:0 18px 70px #0004;color:#173247;background:white;text-align:center';
wasteStatusDialog.innerHTML='<div id="waste-status-icon" style="font-size:36px;margin-bottom:12px"></div><h2 id="waste-status-title" style="font-size:21px;margin:0 0 10px"></h2><p id="waste-status-description" style="line-height:1.5;margin:0 0 24px"></p><button type="button" id="waste-status-close" style="background:#123e7d;color:white;border:0;border-radius:10px;padding:12px 32px;font-weight:700;cursor:pointer">Schließen</button>';
document.body.appendChild(wasteStatusDialog);
wasteStatusDialog.addEventListener('click',e=>{if(e.target===wasteStatusDialog)wasteStatusDialog.close();});
wasteStatusDialog.querySelector('#waste-status-close').addEventListener('click',()=>wasteStatusDialog.close());
function showWasteStatus(ok,message){
 wasteStatusDialog.querySelector('#waste-status-icon').textContent=ok?'✓':'!';
 wasteStatusDialog.querySelector('#waste-status-icon').style.color=ok?'#15803d':'#b45309';
 wasteStatusDialog.querySelector('#waste-status-title').textContent=ok?'Anforderung erfolgreich versendet':'Anforderung nicht versendet';
 wasteStatusDialog.querySelector('#waste-status-description').textContent=message;
 if(!wasteStatusDialog.open)wasteStatusDialog.showModal();
}
/* Mailvorlage für Restmüll und Kartonagen richtet sich beim Klick nach dem Profilstandort. */
for (const wasteId of ['waste-rest','waste-paper']) {
 const link=document.getElementById(wasteId);
 if (!link) continue;
 const baseHref=link.getAttribute('href');
 link.addEventListener('click',()=>{
  let profile=null;
  try { profile=JSON.parse(localStorage.getItem('facility-employee-profile-v1')||'null'); } catch {}
  const isHwp=String(profile?.site||'').trim()==='Handwerkerpark 25';
  const targetAddress=isHwp
   ? 'Orthopädie Brillinger GmbH\r\nHandwerkerpark 25\r\n72070 Tübingen'
   : 'Orthopädie Brillinger GmbH\r\nEinhornstraße 10\r\n72138 Kirchentellinsfurt';
  const q=baseHref.indexOf('?');
  const params=new URLSearchParams(baseHref.slice(q+1).replaceAll('&amp;','&'));
  let body=params.get('body')||'';
  body=body.replace(/Orthopädie Brillinger GmbH\s*(?:Einhornstraße 10\s*72138 Kirchentellinsfurt|Handwerkerpark 25\s*72070 Tübingen)/,targetAddress);
  params.set('body',body);
  link.setAttribute('href',baseHref.slice(0,q+1)+'subject='+encodeURIComponent(params.get('subject')||'')+'&body='+encodeURIComponent(body));
 });
}
/* Am Handwerkerpark 25 sind diese drei Entsorgungsarten nicht verfügbar. */
for (const wasteId of ['waste-electronics','waste-wood','waste-metal']) {
 const link=document.getElementById(wasteId);
 if (!link) continue;
 link.addEventListener('click',(event)=>{
  let profile=null;
  try { profile=JSON.parse(localStorage.getItem('facility-employee-profile-v1')||'null'); } catch {}
  if (String(profile?.site||'').trim()!=='Handwerkerpark 25') return;
  event.preventDefault();
  showWasteStatus(false,'Diese Entsorgungsart ist am Standort Handwerkerpark 25 nicht möglich.');
 });
}
/* Testphase: Vorbereitete Mailto-Links bleiben klickbar; keine Supabase-Leerungsübermittlung. */
renderRequests();
let selectedOrderYear=new Date().getFullYear();
let selectedOrderProduct=null;
let selectedOrderMonth="all";
let selectedOrderDept="all";
let selectedOrderArticle="all";
const allCatalogArticleNames=["Milch","Hafermilch","Glasreiniger","AdBlue (10 Liter)","Scheibenreiniger (Sommer)","Scheibenreiniger (Winter)","Geschirrtücher","Klarspüler","Vileda MicroTuff Universal Mikrofasertuch, 38 × 38 cm","Putztücher","Scheuermilch","Scheuerschwamm","Spülmaschinensalz","Spülmittel","Spülmaschinen Tabs","Batterien","Desinfektionsreiniger","Flüssigseife","Kleber (UHU)","Sekundenkleber","Hygienebeutel","Rohrreiniger","Kabelbinder klein","Kabelbinder groß (7,6 × 450 mm)","Empfangsbestätigung","Allplastik-Blitzbinder, 240 mm, rot","Cuttermesser Wedo Safety Standard","Cuttermesser Westcott Cutter Premium","Dymo-Schriftbandkassette für LabelWriter","Dymo Etiketten 54x101 mm , weiß","Großraumtüte (Europack), 1.300 × 2.300 mm, 1.000 l","Matratzentüte auf Rolle, 105 × 20 × 230 cm","Edding 3000, 1,5–3 mm","Edding 400, 1 mm","Schere","Locher","Tesafilm-Rolle, 10 m × 19 mm","Tacker","Laminierfolie, klein, DIN A5","Laminierfolie, groß, DIN A4","Gummiringe, 85 mm","Würfelzucker 500 g","Kartonagen 600×400×300 mm (1)","Kartonagen 400×300×200 mm (2)","Kartonagen 310×230×100–160 mm (3)","Kartonagen 400×400×300 mm (4)","Kartonagen 240×200×100 mm (5)","Kartonagen 600×300×200 mm (6)","Natronkraftpapier auf Rolle (90 g)","PVC-Klebeband, 50 mm","Luftpolstertasche 18/H, 265 × 360 mm, braun","Begleitpapiertasche","DPD-Express-Klebeband","Thermo-Haftetiketten auf Rolle 105×148 mm, Kern 40 mm","Stretchfolie klein","Stretchfolie groß","Umreifungsband, Großrolle, 12,7 × 0,5 mm","Verschlusshülsen für Umreifungsband, 13 × 28 × 0,5 mm","Handabroller"];
function readOrderStats(){
 if(sharedFacilityStatsReady)return sharedFacilityStats.orders;
 try{const data=JSON.parse(localStorage.getItem('brillinger-bestellstatistik-v1')||'[]');return Array.isArray(data)?data.filter(o=>o&&o.date&&!isNaN(Date.parse(o.date))):[];}catch{return [];}
}
function closeOrderHistory(){
 document.getElementById('order-history-section').hidden=true;
 document.getElementById('order-history-backdrop').hidden=true;
 document.body.classList.remove('order-history-open');
}
function openOrderHistory(product){
 selectedOrderProduct=product;
 renderOrderStats();
 document.getElementById('order-history-section').hidden=false;
 document.getElementById('order-history-backdrop').hidden=false;
 document.body.classList.add('order-history-open');
 document.getElementById('order-history-close').focus();
}
function renderOrderStats(){
 const allYearOrders=readOrderStats().filter(o=>new Date(o.date).getFullYear()===selectedOrderYear);
 const monthSelect=document.getElementById('order-month-filter');
 const deptSelect=document.getElementById('order-dept-filter');
 const monthNames=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
 monthSelect.replaceChildren(new Option(window.matchMedia('(max-width:720px)').matches?'Alle':'Alle Monate','all'),...monthNames.map((name,i)=>new Option(name,String(i))));
 monthSelect.value=selectedOrderMonth;
 const departments=[...new Set(['Logistik','Werkstatt','Haustechnik',...allYearOrders.map(o=>String(o.department||o.dept||'').trim()).filter(Boolean)])].sort((a,b)=>a.localeCompare(b,'de'));
 deptSelect.replaceChildren(new Option('Alle Bereiche','all'),...departments.map(name=>new Option(name,name)));
 if(selectedOrderDept!=='all'&&!departments.includes(selectedOrderDept))selectedOrderDept='all';
 deptSelect.value=selectedOrderDept;
 const articleSelect=document.getElementById('order-article-filter');
 const articleNames=[...new Set([...allCatalogArticleNames,...allYearOrders.flatMap(o=>(Array.isArray(o.items)?o.items:[]).map(item=>String(item.name||'').trim()).filter(Boolean))])].sort((a,b)=>a.localeCompare(b,'de'));
 articleSelect.replaceChildren(new Option('Alle Artikel','all'),...articleNames.map(name=>new Option(name,name)));
 if(selectedOrderArticle!=='all'&&!articleNames.includes(selectedOrderArticle))selectedOrderArticle='all';
 articleSelect.value=selectedOrderArticle;
 const orders=allYearOrders.filter(o=>(selectedOrderMonth==='all'||String(new Date(o.date).getMonth())===selectedOrderMonth)&&(selectedOrderDept==='all'||(String(o.department||o.dept||'Nicht zugeordnet').trim()||'Nicht zugeordnet')===selectedOrderDept)&&(selectedOrderArticle==='all'||(Array.isArray(o.items)?o.items:[]).some(item=>String(item.name||'').trim()===selectedOrderArticle))).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
 document.getElementById('order-selected-year').textContent=String(selectedOrderYear);
 document.getElementById('order-count').textContent=String(orders.length);
 const products=new Map();
 orders.forEach(order=>{
  const seen=new Set();
  (Array.isArray(order.items)?order.items:[]).forEach(item=>{
   const name=String(item.name||'Artikel').trim(),key=name.toLocaleLowerCase('de-DE');
   const quantity=Number(item.quantity)||0;
   if(!name||quantity<=0)return;
   if(!products.has(key))products.set(key,{name,orders:0,quantity:0});
   const entry=products.get(key);entry.quantity+=quantity;
   if(!seen.has(key)){entry.orders++;seen.add(key);}
  });
 });
 const types=document.getElementById('order-type-buttons');types.replaceChildren();
 const ranked=[...products.values()].sort((a,b)=>b.orders-a.orders||a.name.localeCompare(b.name,'de'));
 if(!ranked.length){const empty=document.createElement('p');empty.textContent='Für '+selectedOrderYear+' wurden noch keine Bestellungen erfasst.';types.appendChild(empty);}
 ranked.forEach(item=>{
  const row=document.createElement('button');row.type='button';row.className='pickup-row pickup-type-button';
  const label=document.createElement('span');label.className='pickup-type-label';label.textContent=item.name;
  const count=document.createElement('strong');count.textContent=item.orders+' ›';
  row.append(label,count);
  row.addEventListener('click',()=>openOrderHistory(item.name));
  types.appendChild(row);
 });
 const history=document.getElementById('order-history-list');history.replaceChildren();
 document.getElementById('order-history-title').textContent=selectedOrderProduct?'Bestellverlauf: '+selectedOrderProduct:'Bestellverlauf: Alle Bestellungen';
 const filtered=selectedOrderProduct?orders.filter(o=>(o.items||[]).some(item=>String(item.name||'').toLocaleLowerCase('de-DE')===selectedOrderProduct.toLocaleLowerCase('de-DE'))):orders;
 if(!filtered.length){const empty=document.createElement('p');empty.textContent='Keine Bestellungen im Jahr '+selectedOrderYear+'.';history.appendChild(empty);}
 filtered.forEach(order=>{
  const row=document.createElement('div');row.className='pickup-row';
  const date=document.createElement('strong');date.textContent=new Date(order.date).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'});
  const details=document.createElement('span');
  details.textContent=(Array.isArray(order.items)?order.items:[]).filter(item=>!selectedOrderProduct||String(item.name||'').toLocaleLowerCase('de-DE')===selectedOrderProduct.toLocaleLowerCase('de-DE')).map(item=>String(item.name||'Artikel')+' × '+(Number(item.quantity)||0)).join(', ');
  row.append(date,details);history.appendChild(row);
 });
}
document.getElementById('order-month-filter').addEventListener('change',event=>{selectedOrderMonth=event.target.value;renderOrderStats();});
document.getElementById('order-dept-filter').addEventListener('change',event=>{selectedOrderDept=event.target.value;renderOrderStats();});
document.getElementById('order-article-filter').addEventListener('change',event=>{selectedOrderArticle=event.target.value;renderOrderStats();});
document.getElementById('order-filter-reset').addEventListener('click',()=>{selectedOrderMonth='all';selectedOrderDept='all';selectedOrderArticle='all';renderOrderStats();});

document.getElementById('order-year-prev').addEventListener('click',()=>{selectedOrderYear--;renderOrderStats();});
document.getElementById('order-year-next').addEventListener('click',()=>{selectedOrderYear++;renderOrderStats();});
document.getElementById('order-all-history').addEventListener('click',()=>openOrderHistory(null));
document.getElementById('order-history-close').addEventListener('click',closeOrderHistory);
document.getElementById('order-history-backdrop').addEventListener('click',closeOrderHistory);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('order-history-open'))closeOrderHistory();});
window.addEventListener('hashchange',closeOrderHistory);
window.addEventListener('storage',event=>{if(event.key==='brillinger-bestellstatistik-v1')renderOrderStats();});
window.addEventListener('pageshow',renderOrderStats);
renderOrderStats();
window.addEventListener('pageshow',showFacilityManagementPage);
window.addEventListener('popstate',showFacilityManagementPage);
showFacilityManagementPage();
