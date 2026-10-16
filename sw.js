const CACHE = 'alhwary-ai-v1';
const SHELL = [
  'https://alhwary.wuaze.com/robot/mobile.php',
  'https://alhwary.wuaze.com/robot/mobile-robot.php',
  'https://alhwary.wuaze.com/robot/avatar.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(SHELL.map(url => c.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;
  if (
    url.pathname.includes('firebase-api.php') ||
    url.pathname.includes('gemini-proxy.php') ||
    url.hostname.includes('google') ||
    url.hostname.includes('firebase')
  ) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req))
  );
});
