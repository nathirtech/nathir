// Service worker for the attendance app (سجل الغياب والتأخر)
// Network-first so updates reach users immediately; cache is only a fallback when offline.
var CACHE='att-v1';
var SHELL=['attendance.html','att-manifest.json','att-icon-192.png','att-icon-512.png','logo.png'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k.indexOf('att-')===0&&k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  var url=new URL(req.url);
  // Only handle our own static files; Firebase and CDNs go straight to the network.
  if(url.origin!==self.location.origin) return;
  e.respondWith(
    fetch(req).then(function(res){
      if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return res;
    }).catch(function(){
      return caches.match(req,{ignoreSearch:true}).then(function(r){return r||caches.match('attendance.html');});
    })
  );
});
