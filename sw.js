// Service Worker — Network First, her zaman güncel içerik
const CACHE_NAME = 'istanbul-gezisi-v22';

// Sadece kritik dosyaları önbelleğe al, görselleri alma
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/deneme2.js',
  './js/languages.js',
  './js/quiz.js',
  './js/guide.js',
  './js/chatbot_v2.js',
  './js/extra.js',
  './js/firebase_auth.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Hemen aktif ol
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name)) // Eski önbellekleri sil
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Görseller için — HER ZAMAN ağdan çek, önbellekten değil
  if (url.pathname.startsWith('/images/') || 
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Diğer dosyalar için — Ağ önce, sonra önbellek
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
