// Service Worker: sw.js - Updated on 2025-04-06
const CACHE_NAME = 'delivery-hub-cache-v7';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js'
];

// Install event: Pre-cache essential assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activate
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching core assets');
      return cache.addAll(urlsToCache);
    }).catch((error) => {
      console.error('[SW] Cache install failed:', error);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim()) // Take control immediately
  );
});

document.getElementById("force-update-btn").addEventListener("click", async () => {
  if ('serviceWorker' in navigator) {
      try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let reg of registrations) {
              await reg.update(); // Force service worker update
          }
      } catch (error) {
          console.error("Service worker update failed:", error);
      }
  }
  location.reload(); // Perform hard refresh
});

// Fetch event: Serve cached content or fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET' && networkResponse.ok) {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match('/index.html');
      });
    })
  );
});
