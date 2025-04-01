// Service Worker: sw.js

const CACHE_NAME = 'delivery-hub-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css', // If you extract your styles into a separate CSS file
  'https://cdn.tailwindcss.com', // External dependency
  'https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js'
];

// Install event: Cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache failed during install:', error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }
        // Fetch from network if not cached
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache the new response
            if (event.request.method === 'GET' && networkResponse.ok) {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Fallback for when offline and no cache is available
            return caches.match('/index.html');
          });
      })
  );
});