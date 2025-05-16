const CACHE_NAME = 'bitsnap';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/src/main.js',
  '/src/scripts/app.js',
  '/src/styles/style.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Service Worker
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

// Fetch Event Strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip caching for DELETE requests
  if (request.method === 'DELETE') {
    event.respondWith(fetch(request));
    return;
  }

  // Handle map tile requests
  if (url.hostname.includes('tile.openstreetmap.org')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(response => {
              if (response) {
                return response;
              }
              // Return empty transparent PNG if no cached response
              return new Response(
                new Uint8Array([
                  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
                  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
                  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
                  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
                  0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
                  0x54, 0x78, 0x9C, 0x63, 0x00, 0x00, 0x00, 0x05,
                  0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00,
                  0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42,
                  0x60, 0x82
                ]).buffer,
                {
                  status: 200,
                  statusText: 'OK',
                  headers: {
                    'Content-Type': 'image/png'
                  }
                }
              );
            });
        })
    );
    return;
  }

  // Handle image requests from story-api.dicoding.dev
  if (url.origin === 'https://story-api.dicoding.dev' && url.pathname.includes('/images/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(response => {
              if (response) {
                return response;
              }
              // Return placeholder image if no cached response
              return fetch('/favicon.png');
            });
        })
    );
    return;
  }

  // Handle API requests
  if (url.origin === 'https://story-api.dicoding.dev') {
    // Don't cache POST or DELETE requests
    if (request.method === 'POST' || request.method === 'DELETE') {
      event.respondWith(fetch(request));
      return;
    }
  }

  // Handle all other requests
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        const fetchRequest = request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            if (!response || response.status !== 200 || request.method !== 'GET') {
              return response;
            }

            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            // For API requests, return cached version if available
            if (request.url.includes('story-api.dicoding.dev')) {
              return caches.match(request);
            }
            throw error;
          });
      })
  );
});

self.addEventListener('push', (event) => {
  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: 'BitSnap Story',
      options: {
        body: event.data ? event.data.text() : 'Ada story baru untuk Anda!',
        icon: '/favicon.png',
        badge: '/favicon.png',
        image: '/favicon.png',
        vibrate: [100, 50, 100],
        data: {
          url: '/#/home'
        },
        actions: [
          {
            action: 'open',
            title: 'Lihat Story'
          }
        ]
      }
    };
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title || 'BitSnap Story', {
      ...notificationData.options,
      requireInteraction: true,
      tag: 'bitsnap-notification'
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || "/#/";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});