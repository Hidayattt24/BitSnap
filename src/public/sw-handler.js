const CACHE_NAME = "dicoding-story-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/assets/index.css",
  "/assets/index.js",
  "/favicon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

self.addEventListener("push", (event) => {
  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: "BitSnap Update",
      options: {
        body: event.data ? event.data.text() : "Ada cerita baru untuk Anda!",
        icon: "/src/public/icon/icon.svg",
        badge: "/src/public/icon/icon.svg",
        vibrate: [100, 50, 100],
        data: {
          url: "/#/",
        },
      },
    };
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = "/#/";

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
