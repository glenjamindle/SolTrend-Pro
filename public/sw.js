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

const CACHE_NAME = 'soltrend-shell-v1';

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
    const cached = await cache.match(req);

    const networkFetch = fetch(req)
      .then((res) => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      })
      .catch(() => null);

    if (cached) {
      // Serve the cached copy immediately; refresh it in the background so
      // a page that's back online still picks up updates without the user
      // waiting on that round trip.
      event.waitUntil(networkFetch);
      return cached;
    }

    const networkRes = await networkFetch;
    if (networkRes) return networkRes;

    // Nothing cached and no network. For a page navigation, fall back to
    // whatever shell page is cached so the app still boots instead of the
    // browser's own offline error page.
    if (req.mode === 'navigate') {
      const shell = await cache.match('/');
      if (shell) return shell;
    }
    return new Response('Offline and nothing cached for this yet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  })());
});
