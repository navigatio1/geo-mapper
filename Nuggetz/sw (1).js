// Nuggetz background helper (sw.js) — version 2 (with Nuggetz 1.6.55).
// Sits next to index.html. Lets Android install Nuggetz as a real app
// (so it appears in the Share menu) and, from version 2, lets the app
// open with no connection (flight mode), using this device's copy.
//
// - Nuggetz's own page: always the latest from the website when online;
//   the last copy only when offline.
// - Icons / manifest: website first, stored copy when offline.
// - The app's building blocks from other sites (React, Babel, fonts):
//   stored copy first (so it opens offline), refreshed in the background.
// - Everything else (Google sign-in, Drive, link previews): never touched.
const CACHE = 'nuggetz-v2';
const LIBS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js'
];
const isLib = (url) => LIBS.includes(url) || url.startsWith('https://fonts.googleapis.com/') || url.startsWith('https://fonts.gstatic.com/');

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Best effort: fetch the building blocks now so the very next start works offline.
    await Promise.all(LIBS.map(async (u) => {
      try { const r = await fetch(u, { mode: u.includes('babel') ? 'no-cors' : 'cors', credentials: 'omit' }); if (r && (r.ok || r.type === 'opaque')) await cache.put(u, r); } catch (e) {}
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('nuggetz-') && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    if (!isLib(req.url)) return; // Google, Drive, Workers etc.: leave alone
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req.url);
      const refresh = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) cache.put(req.url, r.clone()); return r; }).catch(() => null);
      if (hit) { event.waitUntil(refresh); return hit; }
      const r = await refresh;
      return r || new Response('', { status: 504 });
    })());
    return;
  }

  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === scope.pathname;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // Pages are stored under their plain address (no ?url=… from shares).
    const key = isPage ? (url.pathname === scope.pathname ? scope.pathname + 'index.html' : url.pathname) : url.pathname;
    try {
      const r = await fetch(req);
      if (r && r.ok && !url.searchParams.has('versioncheck')) cache.put(key, r.clone());
      return r;
    } catch (e) {
      const hit = await cache.match(key);
      if (hit) return hit;
      throw e;
    }
  })());
});
