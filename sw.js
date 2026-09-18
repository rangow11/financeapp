const CACHE = 'finance-management-v29-1';
const ASSETS = ['./','./index.html','./styles.css','./app.js','./manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
self.addEventListener('message',event=>{if(event.data?.type!=='loan-notification')return;event.waitUntil(self.registration.showNotification(event.data.title,{body:event.data.body,tag:`loan-${event.data.loanId}`,renotify:true,icon:'./icons/icon-192.png',badge:'./icons/icon-192.png'}))});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{const c=list[0];if(c)return c.focus();return clients.openWindow('./')}))});
