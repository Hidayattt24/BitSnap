import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

// API Routes - NetworkFirst strategy
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Story Images - StaleWhileRevalidate strategy
registerRoute(
  ({ url }) => url.origin === 'https://story-api.dicoding.dev' && url.pathname.includes('/images/'),
  new StaleWhileRevalidate({
    cacheName: 'story-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ],
    matchOptions: {
      ignoreSearch: true
    },
    fallback: {
      image: '/favicon.png'
    }
  })
);

// Map Tiles - StaleWhileRevalidate strategy
registerRoute(
  ({ url }) => url.hostname.includes('tile.openstreetmap.org'),
  new StaleWhileRevalidate({
    cacheName: 'map-tiles',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      })
    ]
  })
);

// Static Assets - CacheFirst strategy
registerRoute(
  ({ url }) => url.hostname.includes('unpkg.com') || url.hostname.includes('cdnjs.cloudflare.com'),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Push notification handler
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