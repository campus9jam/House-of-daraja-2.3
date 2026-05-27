// ══════════════════════════════════════════════════════════════════════
// House of Daraja — Service Worker v3.0
// Offline-first | 5-Strategy Cache | Push Notifications | Background Sync
// ══════════════════════════════════════════════════════════════════════

const CACHE_VERSION  = 'hd-v3.0';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE  = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE    = `${CACHE_VERSION}-images`;
const API_CACHE      = `${CACHE_VERSION}-api`;
const FONT_CACHE     = `${CACHE_VERSION}-fonts`;

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/hd-logo.png',
  '/leema-icon.png',
  '/offline-page.htm',
  '/shop',
  '/marketplace',
  '/drops',
  '/heritage',
  '/cart',
  '/atelier',
];

// ─────────────────────────────────────────────────────────────────────
// INSTALL — Pre-cache critical shell
// ─────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[HD SW v3.0] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(err => console.warn('[HD SW] Pre-cache partial:', err)))
      .then(() => self.skipWaiting())
  );
});

// ─────────────────────────────────────────────────────────────────────
// ACTIVATE — Prune old caches
// ─────────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[HD SW v3.0] Activating...');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('hd-') && !k.startsWith(CACHE_VERSION))
          .map(k => { console.log('[HD SW] Pruning old cache:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────────────────────────────
// FETCH — Route-aware caching strategies
// ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip: non-GET, devtools, chrome-extension, websocket
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname === 'localhost' && url.pathname.startsWith('/ws')) return;
  if (url.href.includes('supabase') && (url.pathname.includes('/auth/v1') || url.pathname.includes('/realtime'))) return;

  // 1. IMMUTABLE ASSETS — Cache First (never expires)
  if (url.pathname.startsWith('/_app/immutable/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 2. FONTS — Cache First (long-lived)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com' || url.pathname.match(/\.(woff2?|ttf|otf)$/)) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // 3. IMAGES — Stale-While-Revalidate
  if (
    request.destination === 'image' ||
    url.hostname === 'i.imgur.com' ||
    url.hostname.includes('supabase') && url.pathname.includes('/storage/') ||
    url.hostname.includes('base44.app') && url.pathname.includes('/images/')
  ) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // 4. API / SUPABASE — Network First (5s timeout, fallback to cache)
  if (url.hostname.includes('supabase.co') || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  // 5. NAVIGATION (HTML pages) — Network First + rich offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful nav responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html' } });
        })
    );
    return;
  }

  // 6. EVERYTHING ELSE — Stale-While-Revalidate
  event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// ─────────────────────────────────────────────────────────────────────
// BACKGROUND SYNC — Queue offline mutations
// ─────────────────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'hd-offline-queue') {
    event.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(client => client.postMessage({ type: 'HD_SYNC_FLUSH' }));
}

// ─────────────────────────────────────────────────────────────────────
// PUSH NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'House of Daraja', {
      body:    data.body  || 'Something new awaits you.',
      icon:    '/leema-icon.png',
      badge:   '/hd-logo.png',
      image:   data.image,
      tag:     data.tag   || 'hd-push',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/' },
      actions: data.actions || [
        { action: 'open',   title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss'  },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const target = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const win = list.find(c => 'focus' in c);
      return win ? win.focus().then(w => w.navigate(target)) : clients.openWindow(target);
    })
  );
});

// ─────────────────────────────────────────────────────────────────────
// STRATEGY HELPERS
// ─────────────────────────────────────────────────────────────────────
async function cacheFirst(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return new Response('Resource unavailable offline', { status: 503 });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  const revalidate = fetch(req).then(res => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || await revalidate || new Response('Offline', { status: 503 });
}

async function networkFirst(req, cacheName, timeout = 4000) {
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(req, { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    clearTimeout(timer);
    const cached = await caches.match(req);
    return cached || new Response(JSON.stringify({ error: 'offline' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ─────────────────────────────────────────────────────────────────────
// OFFLINE PAGE HTML
// ─────────────────────────────────────────────────────────────────────
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="theme-color" content="#050505"/>
  <title>House of Daraja — Offline</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#050505;color:#fff;font-family:system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem}
    .ring{width:100px;height:100px;border-radius:50%;border:2px solid rgba(197,160,89,0.4);display:flex;align-items:center;justify-content:center;margin:0 auto 2rem;animation:ringPulse 2s ease-in-out infinite}
    img{width:72px;height:72px;border-radius:50%;object-fit:cover}
    h1{font-family:Georgia,serif;font-size:2rem;font-weight:300;color:#C5A059;margin-bottom:0.75rem}
    p{color:rgba(255,255,255,0.4);font-size:0.875rem;line-height:1.7;max-width:280px;margin:0 auto}
    .dots{display:flex;gap:6px;margin:2rem auto;justify-content:center}
    .dot{width:6px;height:6px;background:#C5A059;border-radius:50%;animation:bounce 1.4s ease-in-out infinite}
    .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
    .btn{margin-top:2rem;padding:0.9rem 2.5rem;background:#C5A059;color:#050505;border:none;cursor:pointer;font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;font-weight:700;transition:opacity .2s}
    .btn:hover{opacity:0.85}
    .label{margin-top:1rem;font-size:0.625rem;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,255,255,0.15)}
    @keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}
    @keyframes ringPulse{0%,100%{box-shadow:0 0 0 0 rgba(197,160,89,0)}50%{box-shadow:0 0 20px 6px rgba(197,160,89,0.15)}}
  </style>
</head>
<body>
  <div class="ring"><img src="/leema-icon.png" alt="Leema"/></div>
  <h1>You're Offline</h1>
  <p>House of Daraja requires a connection to curate your experience. Your queued actions will sync when restored.</p>
  <div class="dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
  <button class="btn" onclick="window.location.reload()">Reconnect</button>
  <p class="label">House of Daraja · Wear Your Worth</p>
</body>
</html>`;
