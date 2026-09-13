const CACHE_NAME = 'telugu-mic-v5';
const ASSETS = [
  './',
  './index.html',
  './css/font-awesome.min.css',
  './css/styles.css',
  './js/audio-chime.js',
  './js/celebrity-audio.js',
  './js/translations.js',
  './js/storage.js',
  './js/sync.js',
  './js/tts.js',
  './js/transliterate.js',
  './js/app.js',
  './manifest.json',
  './assets/icon.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Network-first strategy to ensure fresh app logic
  e.respondWith(
    fetch(e.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
      }
      return networkResponse;
    }).catch(() => caches.match(e.request))
  );
});
