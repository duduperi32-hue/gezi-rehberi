const CACHE_NAME = 'istanbul-gezisi-v4'; // Bump to v4 to FORCE update
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/deneme2.js',
  './js/languages.js',
  './js/quiz.js',
  './js/guide.js',
  './js/chatbot.js',
  './js/extra.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Network First, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Update the cache with the new response
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // If network fails, try the cache
        return caches.match(event.request);
      })
  );
});
