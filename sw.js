/* ═══════════════════════════════════════════════════════════════
 * Service Worker — Alhwary AI PWA
 * ═══════════════════════════════════════════════════════════════ */

const CACHE = 'alhwary-pwa-v2';

const SHELL = [
  '/alhwary-pwa/',
  '/alhwary-pwa/index.html',
  '/alhwary-pwa/talking-robot.html',
  '/alhwary-pwa/manifest.json',
  '/alhwary-pwa/avatar.png',
  '/alhwary-pwa/hawary-handler.js',
  '/alhwary-pwa/robot-engine.js'
];

self.addEventListener('install', function (event) {
  console.log('[SW] Installing v2...');
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(
        SHELL.map(function (url) {
          return cache.add(url).catch(function (err) {
            console.warn('[SW] Failed:', url, err.message);
          });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  console.log('[SW] Activating v2...');
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) {
              console.log('[SW] Deleting:', k);
              return caches.delete(k);
            })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  /* الطلبات الخارجية → من الشبكة دايماً */
  if (url.origin !== self.location.origin) {
    return;
  }

  /* طلبات الموقع الأصلي (alhwary.wuaze.com) → من الشبكة */
  if (url.hostname.indexOf('alhwary.wuaze.com') !== -1) {
    return;
  }

  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(function (c) {
          c.put(req, copy).catch(function () {});
        }).catch(function () {});
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        if (cached) return cached;
        if (req.mode === 'navigate') {
          return caches.match('/alhwary-pwa/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] ✅ Alhwary AI Service Worker v2 loaded');
