let selectedOrderYear=new Date().getFullYear();
let selectedOrderProduct=null;
let selectedOrderMonth="all";
let selectedOrderDept="all";
let selectedOrderArticle="all";
const allCatalogArticleNames=["Milch","Hafermilch","Glasreiniger","AdBlue (10 Liter)","Scheibenreiniger (Sommer)","Scheibenreiniger (Winter)","Geschirrtücher","Klarspüler","Vileda MicroTuff Universal Mikrofasertuch, 38 × 38 cm","Putztücher","Scheuermilch","Scheuerschwamm","Spülmaschinensalz","Spülmittel","Spülmaschinen Tabs","Batterien","Desinfektionsreiniger","Flüssigseife","Kleber (UHU)","Sekundenkleber","Hygienebeutel","Rohrreiniger","Kabelbinder klein","Kabelbinder groß (7,6 × 450 mm)","Empfangsbestätigung","Allplastik-Blitzbinder, 240 mm, rot","Cuttermesser Wedo Safety Standard","Cuttermesser Westcott Cutter Premium","Dymo-Schriftbandkassette für LabelWriter","Dymo Etiketten 54x101 mm , weiß","Großraumtüte (Europack), 1.300 × 2.300 mm, 1.000 l","Matratzentüte auf Rolle, 105 × 20 × 230 cm","Edding 3000, 1,5–3 mm","Edding 400, 1 mm","Schere","Locher","Tesafilm-Rolle, 10 m × 19 mm","Tacker","Laminierfolie, klein, DIN A5","Laminierfolie, groß, DIN A4","Gummiringe, 85 mm","Würfelzucker 500 g","Kartonagen 600×400×300 mm (1)","Kartonagen 400×300×200 mm (2)","Kartonagen 310×230×100–160 mm (3)","Kartonagen 400×400×300 mm (4)","Kartonagen 240×200×100 mm (5)","Kartonagen 600×300×200 mm (6)","Natronkraftpapier auf Rolle (90 g)","PVC-Klebeband, 50 mm","Luftpolstertasche 18/H, 265 × 360 mm, braun","Begleitpapiertasche","DPD-Express-Klebeband","Thermo-Haftetiketten auf Rolle 105×148 mm, Kern 40 mm","Stretchfolie klein","Stretchfolie groß","Umreifungsband, Großrolle, 12,7 × 0,5 mm","Verschlusshülsen für Umreifungsband, 13 × 28 × 0,5 mm","Handabroller"];
function isCartOrder(order){
 if(!order||!order.date||isNaN(Date.parse(order.date)))return false;
 // Frühere eigenständige Artikelwünsche zählen auch rückwirkend nicht als Bestellung.
 if(String(order.note||'').startsWith('Artikelwunsch zur Aufnahme in den internen Bestellshop'))return false;
 const items=Array.isArray(order.items)?order.items:[];
 return !(items.length===1&&String(items[0]?.name||'').startsWith('ARTIKELWUNSCH:'));
}
function readOrderStats(){
 if(sharedFacilityStatsReady)return sharedFacilityStats.orders.filter(isCartOrder);
 try{const data=JSON.parse(localStorage.getItem('brillinger-bestellstatistik-v1')||'[]');return Array.isArray(data)?data.filter(isCartOrder):[];}catch{return [];}
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
function orderArticleKey(name){return String(name||'').trim().toLocaleLowerCase('de-DE');}
function orderMatchesArticle(order,articleKey){
 return Array.isArray(order.items)&&order.items.some(item=>orderArticleKey(item.name)===articleKey);
}
function renderOrderStats(){
 const allOrders=readOrderStats().filter(o=>o&&o.date&&!isNaN(Date.parse(o.date)));
 const allYearOrders=allOrders.filter(o=>new Date(o.date).getFullYear()===selectedOrderYear);
 const monthSelect=document.getElementById('order-month-filter');
 const deptSelect=document.getElementById('order-dept-filter');
 const monthNames=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
 monthSelect.replaceChildren(new Option('Alle Monate','all'),...monthNames.map((name,i)=>new Option(name,String(i))));
 monthSelect.value=selectedOrderMonth;
 const departments=[...new Set(['Logistik','Werkstatt','Haustechnik',...allOrders.map(o=>String(o.department||o.dept||'').trim()).filter(Boolean),...(selectedOrderDept!=='all'?[selectedOrderDept]:[])])].sort((a,b)=>a.localeCompare(b,'de'));
 deptSelect.replaceChildren(new Option('Alle Bereiche','all'),...departments.map(name=>new Option(name,name)));
 if(selectedOrderDept!=='all'&&!departments.includes(selectedOrderDept))selectedOrderDept='all';
 deptSelect.value=selectedOrderDept;
 const articleSelect=document.getElementById('order-article-filter');
 const articleNames=[...new Set([...(window.facilityCatalogArticleNames||allCatalogArticleNames),...allOrders.flatMap(o=>(Array.isArray(o.items)?o.items:[]).map(item=>String(item.name||'').trim()).filter(Boolean)),...(selectedOrderArticle!=='all'?[selectedOrderArticle]:[])])].sort((a,b)=>a.localeCompare(b,'de'));
 articleSelect.replaceChildren(new Option('Alle Artikel','all'),...articleNames.map(name=>new Option(name,name)));
 if(selectedOrderArticle!=='all'&&!articleNames.includes(selectedOrderArticle))selectedOrderArticle='all';
 articleSelect.value=selectedOrderArticle;
 // Die Filter greifen gleichzeitig: Jahr, Monat, Bereich und Artikel.
 // Die Artikelauswahl schränkt sowohl Bestellungen als auch die gezeigten Positionen ein.
 const selectedArticleKey=selectedOrderArticle==='all'?null:orderArticleKey(selectedOrderArticle);
 const orders=allYearOrders.filter(o=>
  (selectedOrderMonth==='all'||String(new Date(o.date).getMonth())===selectedOrderMonth)&&
  (selectedOrderDept==='all'||(String(o.department||o.dept||'Nicht zugeordnet').trim()||'Nicht zugeordnet')===selectedOrderDept)&&
  (!selectedArticleKey||orderMatchesArticle(o,selectedArticleKey))
 ).sort((a,b)=>Date.parse(b.date)-Date.parse(a.date));
 document.getElementById('order-selected-year').textContent=String(selectedOrderYear);
 document.getElementById('order-count').textContent=String(orders.length);
 const products=new Map();
 orders.forEach(order=>{
  const seen=new Set();
  (Array.isArray(order.items)?order.items:[]).forEach(item=>{
   const name=String(item.name||'Artikel').trim(),key=name.toLocaleLowerCase('de-DE');
   const quantity=Number(item.quantity)||0;
   if(!name||quantity<=0||(selectedArticleKey&&key!==selectedArticleKey))return;
   if(!products.has(key))products.set(key,{name,orders:0,quantity:0});
   const entry=products.get(key);entry.quantity+=quantity;
   if(!seen.has(key)){entry.orders++;seen.add(key);}
  });
 });
 const types=document.getElementById('order-type-buttons');types.replaceChildren();
 const ranked=[...products.values()].sort((a,b)=>b.orders-a.orders||a.name.localeCompare(b.name,'de'));
 if(!ranked.length){const empty=document.createElement('p');empty.textContent=selectedOrderMonth!=='all'||selectedOrderDept!=='all'||selectedOrderArticle!=='all'?'Keine Bestellungen für die ausgewählten Filter.':'Für '+selectedOrderYear+' wurden noch keine Bestellungen erfasst.';types.appendChild(empty);}
 ranked.forEach(item=>{
  const row=document.createElement('button');row.type='button';row.className='pickup-row pickup-type-button';
  const main=document.createElement('span');main.className='order-article-main';
  const thumb=document.createElement('span');thumb.className='order-article-thumb';thumb.setAttribute('aria-hidden','true');
  const media=window.facilityCatalogArticleMedia?.[orderArticleKey(item.name)];
  if(media?.image){
   const image=document.createElement('img');
   image.src=media.image;image.alt='';image.loading='lazy';image.decoding='async';
   image.addEventListener('error',()=>{image.remove();thumb.textContent=media.symbol||'📦';},{once:true});
   thumb.appendChild(image);
  }else{
   thumb.textContent=media?.symbol||'📦';
  }
  const label=document.createElement('span');label.className='pickup-type-label';label.textContent=item.name;
  main.append(thumb,label);
  const count=document.createElement('strong');count.textContent=item.orders+' ›';
  row.append(main,count);
  row.addEventListener('click',()=>openOrderHistory(item.name));
  types.appendChild(row);
 });
 const history=document.getElementById('order-history-list');history.replaceChildren();
 document.getElementById('order-history-title').textContent=selectedOrderProduct?'Bestellverlauf: '+selectedOrderProduct:'Bestellverlauf: Alle Bestellungen';
 const historyArticleKey=selectedOrderProduct?orderArticleKey(selectedOrderProduct):selectedArticleKey;
 const filtered=historyArticleKey?orders.filter(o=>orderMatchesArticle(o,historyArticleKey)):orders;
 if(!filtered.length){const empty=document.createElement('p');empty.textContent='Keine Bestellungen für die ausgewählten Filter.';history.appendChild(empty);}
 filtered.forEach(order=>{
  const row=document.createElement('div');row.className='pickup-row';
  const date=document.createElement('strong');date.textContent=new Date(order.date).toLocaleString('de-DE',{dateStyle:'medium',timeStyle:'short'});
  const details=document.createElement('span');
  details.textContent=(Array.isArray(order.items)?order.items:[]).filter(item=>!historyArticleKey||orderArticleKey(item.name)===historyArticleKey).map(item=>String(item.name||'Artikel')+' × '+(Number(item.quantity)||0)).join(', ');
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
