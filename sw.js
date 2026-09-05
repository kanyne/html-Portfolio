/* Colosseum Berlin — offline-first service worker */
const CACHE = 'colosseum-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/css/styles.css',
  './assets/js/data.js',
  './assets/js/qrcode.js',
  './assets/js/app.js',
  './assets/icons/icon.svg',
  './assets/img/hero-atrium.jpg',
  './assets/img/wagenhalle.jpg',
  './assets/img/galerie.jpg',
  './assets/img/saal1.jpg',
  './assets/img/kino6.jpg',
  './assets/img/foyer.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return; // let fonts/network requests pass through

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => caches.match('./index.html'))
    )
  );
});
