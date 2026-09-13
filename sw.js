const CACHE_NAME = 'telugu-mic-v1';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/audio-chime.js',
  './js/celebrity-audio.js',
  './js/translations.js',
  './js/storage.js',
  './js/sync.js',
  './js/tts.js',
  './js/transliterate.js',
  './js/app.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
