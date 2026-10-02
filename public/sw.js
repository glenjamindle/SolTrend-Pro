// SolTrend Pro service worker
//
// Lets the app boot and render with no signal, so the currently-open
// project's data (cached separately, in the page's own IndexedDB - see
// page.tsx) is actually reachable instead of stuck behind a blank "no
// internet" browser error.
//
// This file only handles caching the app shell: the page HTML, JS/CSS
// chunks, fonts, and the Tailwind/Lucide CDN scripts the app depends on.
// It deliberately leaves /api/ requests alone - the page's own fetch
// wrapper already caches and queues those with per-record precision, and
// doubling that up here would just be two caches to keep in sync.
//
// NETWORK-FIRST, not stale-while-revalidate: this used to serve whatever
// was cached immediately and only refresh it in the background, which
// meant that after every deploy, the first load still ran the OLD shell
// (bug fixes included) and only the load after that picked up the new
// one. For an app under active development that's confusing at best -
// "the fix doesn't work" when it actually just hadn't been served yet -
// and in the field it meant a crew could be running yesterday's bugs with
// a perfectly good signal. Network-first means the cache is only ever a
// fallback for when there's truly no connection, which was the actual
// goal per the comment above, not a performance cache.
const CACHE_NAME = 'soltrend-shell-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const networkRes = await fetch(req);
      if (networkRes && (networkRes.ok || networkRes.type === 'opaque')) {
        cache.put(req, networkRes.clone());
      }
      return networkRes;
    } catch (e) {
      // Truly offline (or the request failed outright) - fall back to
      // whatever was cached from the last successful load.
      const cached = await cache.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const shell = await cache.match('/');
        if (shell) return shell;
      }
      return new Response('Offline and nothing cached for this yet.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  })());
});
