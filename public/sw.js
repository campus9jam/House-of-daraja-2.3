// House of Daraja — Service Worker
// Handles push notifications and offline caching

const CACHE_NAME = 'hd-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Push Notifications
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const options = {
  body: data.body || 'House of Daraja has a new update for you.',
  icon: '/hd-logo.png',
  badge: '/hd-logo.png',
    image: data.image || null,
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'View Now' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.tag || 'hd-notification',
    renotify: true,
  };
  e.waitUntil(
    self.registration.showNotification(data.title || 'House of Daraja ✦', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});

// Fetch (network first, cache fallback)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  // Ignore non-http(s) schemes (chrome-extension:, data:, blob:, etc.)
  let parsedUrl;
  try {
    parsedUrl = new URL(e.request.url);
  } catch (err) {
    return;
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') return;

  if (e.request.url.includes('/api/') || e.request.url.includes('/functions/')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          try { cache.put(e.request, resClone); } catch (err) { console.warn('[SW] cache.put skipped:', err); }
        });
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
