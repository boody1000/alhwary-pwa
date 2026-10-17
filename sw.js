const CACHE = 'alhwary-pwa-v3';
const SHELL = [
  './',
  './index.html',
  './talking-robot.html',
  './manifest.json',
  './avatar.png',
  './robot-engine.js',
  './hawary-handler.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET') return;
  /* تخطّى الطلبات الخارجية (InfinityFree، Firebase، Google) */
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then(c => c || (req.mode === 'navigate' ? caches.match('./index.html') : new Response('Offline', { status: 503 }))))
  );
});

console.log('[SW] ✅ v3 loaded');
