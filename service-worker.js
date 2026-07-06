self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  self.clients.claim();
});

/* Простой passthrough — без офлайн-кэша, только для того,
   чтобы браузер считал страницу пригодной к установке. */
self.addEventListener('fetch', function (e) {
  e.respondWith(fetch(e.request));
});
