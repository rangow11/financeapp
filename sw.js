const CACHE = 'finance-management-v30-1';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./manifest.webmanifest'];

// Install: fetch fresh copies (bypassing the browser's HTTP cache) and store them
// only as an OFFLINE fallback — this cache is never trusted first.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(
        ASSETS.map(url => fetch(url, { cache: 'reload' }).then(r => c.put(url, r)).catch(() => {}))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: network-first. Always try to get the latest file; only fall back to the
// cached copy when there's no connection. This means a normal refresh always shows
// the newest version, while the app still opens when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message',event=>{if(event.data?.type!=='loan-notification')return;event.waitUntil(self.registration.showNotification(event.data.title,{body:event.data.body,tag:`loan-${event.data.loanId}`,renotify:true,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png'}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{const c=list[0];if(c)return c.focus();return clients.openWindow('./')}))});
