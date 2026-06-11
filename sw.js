const CACHE_NAME = 'istanbul-gezisi-v2'; // Bumped version to force cache clear
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/deneme2.js',
  './js/chatbot.js',
  './js/extra.js',
  './js/guide.js',
  './js/languages.js',
  './js/quiz.js'
];

self.addEventListener('install', event => {
  // Force waiting service worker to become active
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  // Delete old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients immediately
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Network First strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache the latest response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
