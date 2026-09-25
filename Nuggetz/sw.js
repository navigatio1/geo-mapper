// Nuggetz service worker.
// Its main job is to let Android install Nuggetz as a proper app
// (so it appears in the share menu, without a Chrome badge on the icon).
// It deliberately does NOT cache things in a way that could show an old
// version: pages are always fetched fresh from the internet, and the
// saved copy is used only when the phone is offline.
// Only Nuggetz's own files are touched — never Google, Drive or the
// Cloudflare Workers.

const CACHE = 'nuggetz-shell-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k.startsWith('nuggetz-shell-') && k !== CACHE).map(k => caches.delete(k)));
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    if (req.mode === 'navigate') {
        // Network first: always the latest version when online.
        event.respondWith((async () => {
            try {
                const fresh = await fetch(req);
                if (fresh && fresh.ok) {
                    const cache = await caches.open(CACHE);
                    // Store under the plain page address, so a shared link
                    // (index.html?url=...) doesn't create extra copies.
                    cache.put(new Request(url.origin + url.pathname), fresh.clone());
                }
                return fresh;
            } catch (e) {
                const cache = await caches.open(CACHE);
                const cached = await cache.match(url.origin + url.pathname) || await cache.match(self.registration.scope + 'index.html');
                return cached || new Response('<!DOCTYPE html><meta name="viewport" content="width=device-width"><body style="font-family:sans-serif;background:#0f0f0f;color:#eee;padding:2rem"><h2>Nuggetz is offline</h2><p>Connect to the internet and try again.</p></body>',
                    { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            }
        })());
        return;
    }

    // Icons and other small files of our own: network, falling back to a saved copy.
    event.respondWith((async () => {
        try {
            const fresh = await fetch(req);
            if (fresh && fresh.ok && /\.(png|webmanifest)$/.test(url.pathname)) {
                const cache = await caches.open(CACHE);
                cache.put(req, fresh.clone());
            }
            return fresh;
        } catch (e) {
            const cached = await caches.match(req);
            return cached || Response.error();
        }
    })());
});
