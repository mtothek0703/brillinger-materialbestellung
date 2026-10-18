
(function(){
const k='facility-employee-profile-v1',pop=document.getElementById('profile-popup'),edit=document.getElementById('profile-edit');
const n=document.getElementById('profile-name'),s=document.getElementById('profile-site'),d=document.getElementById('profile-dept');
function updateWasteEmails(){
 const profile=saved();
 const site=String(profile?.site||'').trim();
 const pickup=(site==='Kirchentellinsfurt')
  ? 'Orthopädie Brillinger GmbH\nEinhornstraße 10\n72138 Kirchentellinsfurt'
  : 'Orthopädie Brillinger GmbH\nHandwerkerpark 25\n72070 Tübingen';
 for(const id of ['waste-rest','waste-paper','waste-electronics','waste-wood','waste-metal']){
  const link=document.getElementById(id);
  if(!link)return;
  const original=link.dataset.baseMailto||(link.dataset.baseMailto=link.getAttribute('href'));
  const [prefix,encodedBody]=original.split('&body=');
  if(!encodedBody)continue;
  const body=decodeURIComponent(encodedBody);
  const updated=body.replace(/Abholort:\r?\n(?:Handwerkerpark 25\r?\n72070 Tübingen|Orthopädie Brillinger GmbH\r?\nEinhornstraße 10\r?\n72138 Kirchentellinsfurt)/,'Abholort:\n'+pickup);
  link.setAttribute('href',prefix+'&body='+encodeURIComponent(updated).replace(/%20/g,'%20'));
 }
}

function saved(){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function apply(p){if(!p)return;document.getElementById('customer').value=p.name;for(const [id,v] of [['site',p.site],['department',p.dept]]){const el=document.getElementById(id);if(![...el.options].some(o=>o.value===v))el.add(new Option(v,v));el.value=v;el.parentElement.classList.add('has-selection')}}
function open(){const p=saved();if(p){n.value=p.name;s.value=p.site;d.value=p.dept}pop.hidden=false;pop.style.display='flex'}
document.getElementById('profile-form').addEventListener('submit',e=>{e.preventDefault();const p={name:n.value.trim(),site:s.value,dept:d.value.trim()};if(!p.name||!p.site||!p.dept)return;localStorage.setItem(k,JSON.stringify(p));apply(p);updateWasteEmails();pop.hidden=true;pop.style.display='none';edit.hidden=false});
document.getElementById('profile-back').addEventListener('click',()=>{if(!saved())return;pop.hidden=true;pop.style.display='none';});
edit.addEventListener('click',open);
const p=saved();if(p){apply(p);edit.hidden=false}else open();updateWasteEmails();
window.addEventListener('pageshow',()=>{apply(saved());updateWasteEmails()});
})();


;

/* Mobil: App-Unterseiten im selben Browser-Verlaufseintrag oeffnen.
   Echte neue iOS-History-Eintraege verursachten die zweite Startseite
   bei systemeigenen Randwisch-Gesten. Externe Links bleiben unveraendert. */
(function(){
 const internalRoutes=new Set([
  '#start','#shop','#artikel','#warenkorb','#sonderartikel',
  '#muellentsorgung','#entsorgungsuebersicht',
  '#bestelluebersicht','#leerungsuebersicht'
 ]);
 document.addEventListener('click',event=>{
  if(!window.matchMedia('(max-width:720px), (min-width:721px) and (max-width:1100px) and (max-height:550px)').matches||event.defaultPrevented)return;
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest?.('a[href^="#"]');
  if(!link)return;
  const target=link.getAttribute('href');
  if(!internalRoutes.has(target))return;
  event.preventDefault();
  if(location.hash===target)return;
  history.replaceState(history.state,'',target);
  window.dispatchEvent(new Event('hashchange'));
 },{capture:true});
})();


;

/* Einheitliche mobile Zurueck-Geste.
   Normale Links behalten das native Hash-Routing. Nur ein bewusstes
   horizontales Wischen navigiert genau eine Hierarchieebene zurueck.
   Kein popstate-Umschreiben: das hatte Klicks und Browser-History zerstoert. */
(function(){
 const mobile=window.matchMedia('(max-width:720px), (min-width:721px) and (max-width:1100px) and (max-height:550px)');
 const parent={
  '#muellentsorgung':'#start',
  '#entsorgungsuebersicht':'#start',
  '#bestelluebersicht':'#entsorgungsuebersicht',
  '#leerungsuebersicht':'#entsorgungsuebersicht',
  '#shop':'#start',
  '#artikel':'#start',
  '#warenkorb':'#artikel',
  '#sonderartikel':'#artikel'
 };
 const route=()=>location.hash||'#start';
 const blocked=target=>target?.closest?.(
  'input,textarea,select,[contenteditable],[role="dialog"],dialog,.modal,.popup,#profile-popup,#pickup-history-section,#order-history-section'
 );
 const popupOpen=()=>document.body.classList.contains('pickup-history-open')
  ||document.body.classList.contains('order-history-open')
  ||document.body.classList.contains('desktop-cart-open')
  ||document.getElementById('profile-popup')?.style.display==='flex';
 let gesture=null;

 function clear(){gesture=null;}
 window.addEventListener('touchstart',event=>{
  clear();
  if(!mobile.matches||event.touches.length!==1||popupOpen()||blocked(event.target))return;
  // Startseite bewusst mitverfolgen: horizontale Gesten dort blockieren,
  // aber niemals eine neue Route oeffnen oder einen Verlaufseintrag erzeugen.
  if(!parent[route()]&&route()!=='#start')return;
  const touch=event.touches[0];
  gesture={x:touch.clientX,y:touch.clientY,from:route(),direction:null};
 },{capture:true,passive:true});
 window.addEventListener('touchmove',event=>{
  if(!gesture)return;
  if(event.touches.length!==1){clear();return;}
  const touch=event.touches[0];
  const dx=touch.clientX-gesture.x,dy=touch.clientY-gesture.y;
  if(!gesture.direction&&Math.max(Math.abs(dx),Math.abs(dy))>=12){
   gesture.direction=Math.abs(dx)>Math.abs(dy)*1.25?'horizontal':'vertical';
  }
  if(gesture.direction==='vertical'){clear();return;}
  // Auf der Startseite in BEIDE Richtungen blockieren. Auf Unterseiten
  // bleibt nur das gewollte Rechtswischen fuer die App-Zurueck-Geste aktiv.
  if(gesture.direction==='horizontal'&&(gesture.from==='#start'||dx>0)&&event.cancelable){
   event.preventDefault();
  }
 },{capture:true,passive:false});
 window.addEventListener('touchend',event=>{
  const swipe=gesture;
  clear();
  if(!swipe||event.changedTouches.length!==1||swipe.direction==='vertical')return;
  const touch=event.changedTouches[0];
  const dx=touch.clientX-swipe.x,dy=touch.clientY-swipe.y;
  if(dx<55||dx<Math.abs(dy)*1.35||route()!==swipe.from)return;
  const destination=parent[swipe.from];
  if(!destination||destination===route())return;
  // Die Seite ersetzen statt erneut in den Verlauf zu springen.
  // Dadurch gelangt ein zweiter Swipe nur eine Ebene weiter zur Startseite.
  // Verhindert den synthetischen Klick nach dem Swipe, ohne spaetere Taps zu blockieren.
  if(event.cancelable)event.preventDefault();
  history.replaceState(history.state,'',destination);
  window.dispatchEvent(new Event('hashchange'));
 },{capture:true,passive:false});
 window.addEventListener('touchcancel',clear,{capture:true,passive:true});
})();

;

/* iOS: Bei Neuaufruf nach Pull-to-refresh niemals alte Shop-Scrollposition übernehmen. */
if('scrollRestoration' in history)history.scrollRestoration='manual';
window.addEventListener('pageshow',()=>{
 const shop=document.getElementById('shop-view');
 if(shop&&!shop.hidden&&location.hash==='#shop'){
  shop.scrollTop=0;
  const main=shop.querySelector(':scope > main');
  if(main)main.scrollTop=0;
  window.scrollTo(0,0);
 }
});
/* Native-artiges Pull-to-refresh: sichtbarer Ziehweg plus animierter Ladekreis. */
(function(){
 const indicator=document.createElement('div');
 indicator.id='facility-pull-refresh';
 indicator.innerHTML='<span class="facility-pull-spinner" aria-hidden="true"></span>';
 indicator.setAttribute('aria-label','Zum Aktualisieren nach unten ziehen');
 indicator.setAttribute('role','status');
 document.body.appendChild(indicator);
 let initialX=0,initialY=0,distance=0,tracking=false,refreshing=false;
 const moving=()=>[document.getElementById('facility-blue-header'),...['home-view','waste-view','overview-menu-view','order-overview-view','waste-overview-view','shop-view'].map(id=>document.getElementById(id))].filter(el=>el&&!el.hidden);
 const top=()=>{
  const shop=document.getElementById('shop-view');
  if(shop&&!shop.hidden){const main=shop.querySelector(':scope > main');return shop.scrollTop<=3&&(!main||main.scrollTop<=3);}
  const visible=moving();
  return window.scrollY<=3&&visible.every(el=>el.scrollTop<=3);
 };
 function visual(pull){
  document.documentElement.style.setProperty('--facility-pull-distance',pull+'px');
  document.body.classList.toggle('facility-whole-page-pulling',pull>0);
  const shop=document.getElementById('shop-view');
  if(shop)shop.classList.toggle('facility-shop-pulling',pull>0&&!shop.hidden);
  indicator.classList.toggle('visible',pull>0);
  indicator.classList.toggle('ready',pull>=42);
 }
 function reset(){tracking=false;distance=0;visual(0);}
 document.addEventListener('touchstart',event=>{
  if(refreshing||event.touches.length!==1||!matchMedia('(max-width:720px), (min-width:721px) and (max-width:1100px) and (max-height:550px)').matches)return;
  if(event.target.closest('input,textarea,select,[contenteditable],dialog,[role="dialog"],.modal,.popup,#profile-popup'))return;
  if(!top())return;
  initialX=event.touches[0].clientX;initialY=event.touches[0].clientY;distance=0;tracking=true;
 },{passive:true});
 document.addEventListener('touchmove',event=>{
  if(!tracking||event.touches.length!==1)return;
  const dx=event.touches[0].clientX-initialX,dy=event.touches[0].clientY-initialY;
  if(dy<=0||Math.abs(dx)>Math.abs(dy)){reset();return;}
  if(!top()&&distance===0){reset();return;}
  if(event.cancelable)event.preventDefault();
  distance=dy;
  visual(Math.min(66,dy*.65));
 },{passive:false});
 document.addEventListener('touchend',()=>{
  if(!tracking)return;
  const shouldRefresh=distance>=65;
  reset();
  if(!shouldRefresh||refreshing)return;
  refreshing=true;
  visual(52);
  indicator.classList.add('loading');
  indicator.setAttribute('aria-label','Aktualisiere');
  Promise.resolve(window.facilityApplyUpdates?.()).finally(()=>{
    refreshing=false;indicator.classList.remove('loading');reset();
   });
 },{passive:true});
 document.addEventListener('touchcancel',reset,{passive:true});
})();


;

/* Mobile Shop: Such-, Wunsch- und Kategorienbereich beim Scrollen ausblenden,
   bei Aufwaertsbewegung wieder einblenden. Die Kopfzeile bleibt stehen. */
(function(){
 const shop=document.getElementById('shop-view');
 const main=shop?.querySelector(':scope > main');
 const controls=shop?.querySelector('.mobile-sticky-controls');
 if(!shop||!main||!controls)return;
 const mobile=window.matchMedia('(max-width:720px), (min-width:721px) and (max-width:1100px) and (max-height:550px)');
 const hiddenClass='facility-shop-controls-hidden';
 let lastScroll=0,scrollTravel=0,scrollDirection=0;

 function shopActive(){
  return mobile.matches&&!shop.hidden
   &&!document.body.classList.contains('mobile-cart-view')
   &&!document.body.classList.contains('custom-entry-view');
 }
 function updateControlHeight(){
  const height=controls.offsetHeight;
  if(height>0)shop.style.setProperty('--facility-shop-controls-height',height+'px');
 }
 function setHidden(hidden){
  if(!shopActive())hidden=false;
  if(hidden&&controls.contains(document.activeElement)&&document.activeElement.matches('input,textarea,select'))return;
  if(hidden&&!shop.classList.contains(hiddenClass))updateControlHeight();
  shop.classList.toggle(hiddenClass,hidden);
 }
 function resetControls(){
  setHidden(false);
  lastScroll=main.scrollTop;
  scrollTravel=0;
  scrollDirection=0;
 }
 function positionControls(){
  // Die komplette Filterleiste ist auf PC UND Smartphone ein direktes
  // Kindelement des Shops. So kann sie nicht in einem scrollenden main
  // gefangen bleiben. Smartphone-Scrolllogik bleibt unveraendert.
  if(controls.parentElement!==shop||controls.nextElementSibling!==main){
   shop.insertBefore(controls,main);
  }
  resetControls();
  updateControlHeight();
 }
 function followArticleScroll(){
  const position=Math.max(0,main.scrollTop);
  const delta=position-lastScroll;
  lastScroll=position;
  if(!shopActive()){
   setHidden(false);
   scrollTravel=0;
   return;
  }
  if(position<=5){
   setHidden(false);
   scrollTravel=0;
   scrollDirection=0;
   return;
  }
  if(shop.classList.contains('facility-shop-pulling')||Math.abs(delta)<1)return;
  const direction=Math.sign(delta);
  if(direction!==scrollDirection){
   scrollDirection=direction;
   scrollTravel=0;
  }
  scrollTravel+=Math.abs(delta);
  if(direction>0&&position>38&&scrollTravel>=28){
   setHidden(true);
   scrollTravel=0;
  }else if(direction<0&&scrollTravel>=12){
   setHidden(false);
   scrollTravel=0;
  }
 }
 main.addEventListener('scroll',followArticleScroll,{passive:true});

 // iPhone: Am letzten Artikel stoppt die Liste. Kein elastisches Ziehen
 // der ganzen Shop-Seite, wenn nach Erreichen des Endes weiter gewischt wird.
 let listTouchStart=null;
 main.addEventListener('touchstart',event=>{
  if(!shopActive()||event.touches.length!==1){listTouchStart=null;return;}
  const t=event.touches[0];
  listTouchStart={x:t.clientX,y:t.clientY};
 },{passive:true});
 main.addEventListener('touchmove',event=>{
  if(!listTouchStart||!shopActive()||event.touches.length!==1)return;
  const t=event.touches[0];
  const dx=t.clientX-listTouchStart.x,dy=t.clientY-listTouchStart.y;
  if(dy>=-3||Math.abs(dy)<=Math.abs(dx)*1.2)return;
  const maxScroll=Math.max(0,main.scrollHeight-main.clientHeight);
  if(maxScroll>1&&main.scrollTop>=maxScroll-2&&event.cancelable){
   event.preventDefault();
  }
 },{passive:false});
 main.addEventListener('touchend',()=>{listTouchStart=null;},{passive:true});
 main.addEventListener('touchcancel',()=>{listTouchStart=null;},{passive:true});
 positionControls();
 if(mobile.addEventListener)mobile.addEventListener('change',positionControls);
 else mobile.addListener(positionControls);
 window.addEventListener('resize',()=>{
  updateControlHeight();
  resetControls();
 },{passive:true});
 window.addEventListener('hashchange',()=>{
  resetControls();
  requestAnimationFrame(resetControls);
 });
 window.addEventListener('pageshow',resetControls);
 if(typeof ResizeObserver!=='undefined'){
  const observer=new ResizeObserver(updateControlHeight);
  observer.observe(controls);
 }
 controls.addEventListener('focusin',()=>setHidden(false));

 /* Wenn die Wischbewegung auf einer Kategorie-Kachel beginnt, ebenfalls die
    Artikelliste scrollen. Eingabefelder behalten ihr normales Touch-Verhalten. */
 let touchTracking=false,lastTouchX=0,lastTouchY=0,startTouchX=0,startTouchY=0;
 controls.addEventListener('touchstart',event=>{
  touchTracking=shopActive()&&event.touches.length===1
   &&!event.target.closest('input,textarea,select,[contenteditable]');
  if(!touchTracking)return;
  const touch=event.touches[0];
  startTouchX=lastTouchX=touch.clientX;
  startTouchY=lastTouchY=touch.clientY;
 },{passive:true});
 controls.addEventListener('touchmove',event=>{
  if(!touchTracking||event.touches.length!==1)return;
  const touch=event.touches[0];
  const horizontal=touch.clientX-startTouchX;
  const vertical=touch.clientY-startTouchY;
  const shift=touch.clientY-lastTouchY;
  lastTouchX=touch.clientX;
  lastTouchY=touch.clientY;
  if(Math.abs(vertical)<9||Math.abs(horizontal)>Math.abs(vertical)*0.8)return;
  if(shift>0&&main.scrollTop<=0)return; // Pull-to-refresh unangetastet.
  if(event.cancelable)event.preventDefault();
  main.scrollTop=Math.max(0,main.scrollTop-shift);
 },{passive:false});
 controls.addEventListener('touchend',()=>{touchTracking=false},{passive:true});
 controls.addEventListener('touchcancel',()=>{touchTracking=false},{passive:true});
})();

;

/* Untere Navigation: beim Herunterscrollen ausblenden, beim Hochscrollen
   einblenden. Im Shop bestimmt die bestehende Suchleisten-Steuerung
   die Richtung; dort wird die Leiste nur per CSS mitgenommen. */
(function(){
 const nav=document.getElementById('facility-home-nav');
 const shop=document.getElementById('shop-view');
 if(!nav||!shop)return;
 const media=window.matchMedia('(max-width:720px), (min-width:721px) and (max-width:1100px) and (max-height:550px)');
 const views=['home-view','waste-view','overview-menu-view','order-overview-view','waste-overview-view']
  .map(id=>document.getElementById(id)).filter(Boolean);
 const hiddenClass='facility-bottom-nav-hidden';
 let active=null,lastPosition=0,travel=0,direction=0;
 function reveal(){
  document.body.classList.remove(hiddenClass);
 }
 function activeView(){
  if(!media.matches||!shop.hidden)return null;
  return views.find(view=>!view.hidden)||null;
 }
 function reset(){
  active=activeView();
  lastPosition=active?Math.max(0,active.scrollTop):0;
  travel=0;
  direction=0;
  reveal();
 }
 function followScroll(event){
  if(!media.matches||event.currentTarget!==active||!active)return;
  const position=Math.max(0,active.scrollTop);
  const delta=position-lastPosition;
  lastPosition=position;
  if(position<=5||active.scrollHeight<=active.clientHeight+3){
   travel=0;
   direction=0;
   reveal();
   return;
  }
  if(Math.abs(delta)<1)return;
  const nextDirection=Math.sign(delta);
  if(nextDirection!==direction){
   direction=nextDirection;
   travel=0;
  }
  travel+=Math.abs(delta);
  if(direction>0&&position>38&&travel>=28){
   document.body.classList.add(hiddenClass);
   travel=0;
  }else if(direction<0&&travel>=12){
   reveal();
   travel=0;
  }
 }
 for(const view of views)view.addEventListener('scroll',followScroll,{passive:true});
 document.addEventListener('facility:viewchange',reset);
 window.addEventListener('hashchange',()=>{reset();requestAnimationFrame(reset);});
 window.addEventListener('popstate',reset);
 window.addEventListener('pageshow',reset);
 window.addEventListener('resize',reset,{passive:true});
 if(media.addEventListener)media.addEventListener('change',reset);
 else media.addListener(reset);
 nav.addEventListener('focusin',reveal);
 reset();
})();


;

/* Warenkorb: Zurueck-Button bei Aufwaertswisch ausblenden,
   bei Abwaertswisch wieder anzeigen – auch wenn iOS kein Scroll-Event ausloest. */
(function(){
 const shop=document.getElementById('shop-view');
 const main=shop?.querySelector(':scope > main');
 const link=document.querySelector('.mobile-back-to-shop');
 if(!main||!link)return;
 const active=()=>document.body.classList.contains('mobile-cart-view')&&
   !shop.hidden&&window.matchMedia('(max-width:720px), (min-width:721px) and (max-width:1100px) and (max-height:550px)').matches;
 let last=0,travel=0,dir=0,touchY=null,touchX=null;
 function show(){link.classList.remove('cart-back-hidden');}
 function hide(){link.classList.add('cart-back-hidden');}
 function reset(){last=main.scrollTop||0;travel=0;dir=0;touchY=null;touchX=null;show();}
 function direction(delta){
  if(Math.abs(delta)<2)return;
  const next=Math.sign(delta);
  if(next!==dir){dir=next;travel=0;}
  travel+=Math.abs(delta);
  if(next>0&&travel>=13){hide();travel=0;}
  else if(next<0&&travel>=9){show();travel=0;}
 }
 function onScroll(){
  if(!active())return;
  const now=Math.max(0,main.scrollTop);
  const delta=now-last;last=now;
  if(now<=3){show();travel=0;return;}
  direction(delta);
 }
 function touchStart(event){
  if(!active()||event.touches.length!==1)return;
  touchY=event.touches[0].clientY;touchX=event.touches[0].clientX;
 }
 function touchMove(event){
  if(!active()||touchY===null||event.touches.length!==1)return;
  const y=event.touches[0].clientY,x=event.touches[0].clientX;
  const dy=y-touchY,dx=x-touchX;
  touchY=y;touchX=x;
  if(Math.abs(dx)>Math.abs(dy)*1.3)return;
  if(Math.abs(dy)<2)return;
  // Finger nach oben: Button verbergen. Finger nach unten: anzeigen.
  direction(-dy);
 }
 main.addEventListener('scroll',onScroll,{passive:true});
 shop.addEventListener('scroll',onScroll,{passive:true});
 main.addEventListener('touchstart',touchStart,{passive:true});
 main.addEventListener('touchmove',touchMove,{passive:true});
 main.addEventListener('touchend',()=>{touchY=null;touchX=null;},{passive:true});
 main.addEventListener('touchcancel',()=>{touchY=null;touchX=null;},{passive:true});
 document.addEventListener('facility:viewchange',reset);
 window.addEventListener('hashchange',()=>requestAnimationFrame(reset));
 window.addEventListener('pageshow',reset);
 reset();
})();


;

/* Navigation unten: eine Ebene zurueck, ohne zwischen zwei Seiten zu pendeln. */
(function(){
 const back=document.getElementById('facility-back-nav');
 if(!back)return;
 const parents={'#warenkorb':'#artikel','#sonderartikel':'#artikel','#artikel':'#start','#shop':'#start','#muellentsorgung':'#start','#entsorgungsuebersicht':'#start','#bestelluebersicht':'#entsorgungsuebersicht','#leerungsuebersicht':'#entsorgungsuebersicht'};
 back.addEventListener('click',()=>{
  // Bei aktiver Artikelsuche erst nur die Tastatur schliessen.
  const search=document.getElementById('article-search');
  if(search&&document.activeElement===search){
   search.blur();
   return;
  }
  const destination=parents[location.hash]||'#start';
  if(location.hash===destination)return;
  history.replaceState(history.state,'',destination);
  window.dispatchEvent(new Event('hashchange'));
 });
})();


;

(function(){
 const field=document.getElementById('profile-name');
 const clear=document.getElementById('profile-name-clear');
 if(!field||!clear)return;
 const update=()=>{clear.hidden=!field.value;};
 field.addEventListener('input',update);
 const observer=new MutationObserver(update);
 observer.observe(field,{attributes:true,attributeFilter:['value']});
 document.getElementById('profile-edit')?.addEventListener('click',()=>requestAnimationFrame(update));
 clear.addEventListener('click',()=>{field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));field.focus();});
 update();
})();


;

/* Nur Smartphone: vorhandenen Monatsfilter oben statt der Gesamt-Kachel zeigen.
   Dasselbe Select bleibt erhalten, einschliesslich Filterlogik und Auswahl. */
(function(){
 const select=document.getElementById('order-month-filter');
 const panel=document.getElementById('order-filter-panel');
 const slot=document.getElementById('order-mobile-month-slot');
 const label=panel?.querySelector('label[for="order-month-filter"]');
 const before=panel?.querySelector('label[for="order-dept-filter"]');
 if(!select||!panel||!slot||!label)return;
 function syncMonthPosition(){
  const mobile=window.matchMedia('(max-width:720px), (min-width:721px) and (max-width:1100px) and (max-height:550px)').matches;
  if(mobile){
   if(label.parentElement!==slot)slot.append(label,select);
  }else if(label.parentElement!==panel){
   panel.insertBefore(label,before||null);
   panel.insertBefore(select,before||null);
  }
 }
 syncMonthPosition();
 window.addEventListener('resize',syncMonthPosition,{passive:true});
})();

/* Leerungen: derselbe Monatsfilter-Wechsel zwischen Desktop und Smartphone
   wie in der Bestellübersicht. Das Select selbst bleibt mitsamt Auswahl erhalten. */
(function(){
 const select=document.getElementById('waste-month-filter');
 const panel=document.getElementById('waste-filter-panel');
 const slot=document.getElementById('waste-mobile-month-slot');
 const label=panel?.querySelector('label[for="waste-month-filter"]');
 const before=panel?.querySelector('label[for="waste-site-filter"]');
 if(!select||!panel||!slot||!label)return;
 function syncWasteMonthPosition(){
  const mobile=window.matchMedia('(max-width:720px), (min-width:721px) and (max-width:1100px) and (max-height:550px)').matches;
  if(mobile){
   if(label.parentElement!==slot)slot.append(label,select);
  }else if(label.parentElement!==panel){
   panel.insertBefore(label,before||null);
   panel.insertBefore(select,before||null);
  }
 }
 syncWasteMonthPosition();
 window.addEventListener('resize',syncWasteMonthPosition,{passive:true});
})();
