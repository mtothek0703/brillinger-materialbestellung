/* Netzwerk hat Vorrang: App-Code und Statistiken werden niemals veraltet ausgeliefert.
   Nur unkritische lokale Bilddateien erhalten einen Offline-Fallback. */
const STATIC_CACHE='brillinger-facility-media-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('brillinger-facility-media-')&&key!==STATIC_CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 const localImage=/\.(?:svg|png|webp|jpe?g|ico)$/i.test(url.pathname);
 if(!localImage){
  event.respondWith(fetch(new Request(request,{cache:'no-store'})));
  return;
 }
 event.respondWith((async()=>{
  try{
   const response=await fetch(new Request(request,{cache:'no-cache'}));
   if(response.ok){const cache=await caches.open(STATIC_CACHE);await cache.put(request,response.clone());}
   return response;
  }catch(error){
   const cache=await caches.open(STATIC_CACHE);
   return await cache.match(request)||Response.error();
  }
 })());
});
