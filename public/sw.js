const CACHE_VERSION = 'v1';
const STATIC_CACHE = `blog-static-${CACHE_VERSION}`;
const NAV_CACHE = `blog-nav-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `blog-dynamic-${CACHE_VERSION}`;

const STATIC_ASSETS = /\.(woff2?|ttf|svg|png|jpg|jpeg|gif|css|js)$/i;
const STATIC_PATH = /^\/_astro\//;

const SHELL_PAGES = ['/', '/blog/', '/about/', '/404/'];

// Install: pre-cache shell pages so the site works offline on first visit
self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(NAV_CACHE).then((cache) => cache.addAll(SHELL_PAGES))
	);
	self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter(
						(name) =>
							!name.includes(CACHE_VERSION) ||
							(!name.includes('blog-static') &&
								!name.includes('blog-nav') &&
								!name.includes('blog-dynamic'))
					)
					.map((name) => caches.delete(name))
			);
		})
	);
	self.clients.claim();
});

// Fetch: router for different strategies
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Skip non-GET or cross-origin
	if (request.method !== 'GET' || url.origin !== location.origin) {
		return;
	}

	// Service worker itself: no cache
	if (url.pathname === '/sw.js') {
		event.respondWith(fetch(request));
		return;
	}

	// Static assets (/_astro/* + fonts): Cache First
	if (STATIC_PATH.test(url.pathname) || STATIC_ASSETS.test(url.pathname)) {
		event.respondWith(cacheFirst(request, STATIC_CACHE));
		return;
	}

	// HTML pages + RSS: Stale-While-Revalidate
	if (request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname.endsWith('rss.xml')) {
		event.respondWith(staleWhileRevalidate(request, NAV_CACHE));
		return;
	}

	// Everything else: Network First
	event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Cache First: return cached, update in background
async function cacheFirst(request, cacheName) {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);
	if (cached) return cached;

	try {
		const response = await fetch(request);
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		return new Response('Offline - asset not cached', { status: 503 });
	}
}

// Stale-While-Revalidate: return cached immediately, fetch fresh in background
async function staleWhileRevalidate(request, cacheName) {
	const cache = await caches.open(cacheName);
	const cached = await cache.match(request);

	const fetchPromise = fetch(request)
		.then((response) => {
			if (response.ok) {
				cache.put(request, response.clone());
			}
			return response;
		})
		.catch(() => cached || offlineFallback());

	return cached || fetchPromise;
}

// Network First: try network, fall back to cache
async function networkFirst(request, cacheName) {
	const cache = await caches.open(cacheName);

	try {
		const response = await fetch(request);
		if (response.ok) {
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		return (await cache.match(request)) || offlineFallback();
	}
}

// Offline fallback: serve the cached 404 page
async function offlineFallback() {
	const cache = await caches.open(NAV_CACHE);
	const fallback = await cache.match('/404/');
	return fallback || new Response('Offline', { status: 503 });
}
