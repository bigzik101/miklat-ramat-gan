const CACHE = 'miklat-v4';
const ASSETS = [
  '/miklat/',
  '/miklat/index.html',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.js',
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
];

// Install — cache מיידי
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['/miklat/', '/miklat/index.html'])
    )
  );
});

// Activate — נקה cache ישן
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache-first לכל asset
self.addEventListener('fetch', e => {
  // דלג על בקשות שאינן GET
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // שמור ב-cache רק תשובות תקינות (לא API של ת"א — דינמי)
        if (response.ok && !e.request.url.includes('gisn.tel-aviv.gov.il')) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // אין אינטרנט — החזר מה שיש ב-cache
        if (e.request.destination === 'document') {
          return caches.match('/miklat/index.html');
        }
      });
    })
  );
});
