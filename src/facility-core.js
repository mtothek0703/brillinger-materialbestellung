
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



