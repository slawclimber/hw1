const CACHE_NAME = 'pwa-auth-cache-v5';
const BASE_PATH = '/hw1/';
const OFFLINE_URL = `${BASE_PATH}offline.html`;

// Zasoby do cache'owania
const CORE_ASSETS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}styles.css`,
  `${BASE_PATH}app.js`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}login.html`,
  `${BASE_PATH}auth.js`,
  `${BASE_PATH}login-styles.css`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
  OFFLINE_URL
];

// Instalacja Service Workera
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktywacja
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Obsługa żądań
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);
  
  // Pomiń żądania do Google OAuth
  if (requestUrl.hostname === 'accounts.google.com') return;
  
  // Obsługa tylko ścieżek w BASE_PATH
  if (!requestUrl.pathname.startsWith(BASE_PATH)) return;
  
  // Strategia: Network First dla stron
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  } 
  // Strategia: Cache First dla zasobów
  else {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => cachedResponse || fetch(event.request))
        .catch(() => {
          if (event.request.destination === 'image') {
            return caches.match(`${BASE_PATH}icons/icon-512.png`);
          }
          return Response.error();
        })
    );
  }
});

