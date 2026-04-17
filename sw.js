// StyleMind Service Worker — Auto Update
// Increment this version every time you deploy a new version
const VERSION = 'stylemind-v1';
const CACHE = VERSION;

// Files to cache for offline use
const FILES = [
  './',
  './index.html'
];

// Install — cache the app shell
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(FILES);
    })
  );
});

// Activate — delete old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', function(e) {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request).then(function(response) {
      // Cache successful responses
      if (response && response.status === 200) {
        var copy = response.clone();
        caches.open(CACHE).then(function(cache) {
          cache.put(e.request, copy);
        });
      }
      return response;
    }).catch(function() {
      // Network failed — serve from cache
      return caches.match(e.request);
    })
  );
});

// Skip waiting when told to update
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
