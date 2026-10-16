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
