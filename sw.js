/**
 * Waveism Service Worker
 * Enables offline PWA support with intelligent caching strategies
 */

const CACHE_VERSION = 'waveism-v1.0.0';
const STATIC_CACHE = CACHE_VERSION + '-static';
const DYNAMIC_CACHE = CACHE_VERSION + '-dynamic';

// Core assets that should always be cached
const CORE_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './components/shared.css',
    './components/shared.js',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// HTML pages for offline access
const PAGE_ASSETS = [
    './quantum.html',
    './uncertainty.html',
    './wave_theory.html',
    './resonance.html',
    './chaos.html',
    './arrow.html',
    './fabric.html',
    './wormhole.html',
    './spacetime.html',
    './blackhole.html',
    './expansion.html',
    './cosmic.html'
];

// CDN assets to cache
const CDN_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=JetBrains+Mono:wght@300;400;500&display=swap'
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Waveism Service Worker...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('[SW] Caching core assets...');
                // Cache core assets first
                return cache.addAll(CORE_ASSETS)
                    .then(() => {
                        // Try to cache page assets (non-blocking)
                        return cache.addAll(PAGE_ASSETS).catch(err => {
                            console.warn('[SW] Some page assets failed to cache:', err);
                        });
                    });
            })
            .then(() => {
                // Cache CDN assets in dynamic cache
                return caches.open(DYNAMIC_CACHE).then(cache => {
                    return Promise.all(
                        CDN_ASSETS.map(url =>
                            fetch(url, { mode: 'cors' })
                                .then(response => {
                                    if (response.ok) {
                                        return cache.put(url, response);
                                    }
                                })
                                .catch(err => console.warn('[SW] CDN cache failed for:', url))
                        )
                    );
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating new service worker...');

    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
                        .map(key => {
                            console.log('[SW] Deleting old cache:', key);
                            return caches.delete(key);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) return;

    // Strategy: Cache First for static assets, Network First for HTML
    if (request.destination === 'document' || url.pathname.endsWith('.html')) {
        // Network First for HTML pages (always get fresh content if online)
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Clone and cache the response
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => {
                    // Offline - try cache
                    return caches.match(request)
                        .then(cachedResponse => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            // Return offline fallback page if needed
                            return caches.match('./index.html');
                        });
                })
        );
    } else {
        // Cache First for static assets (JS, CSS, images, fonts)
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // Not in cache - fetch and cache
                    return fetch(request)
                        .then(response => {
                            // Don't cache non-successful responses
                            if (!response || response.status !== 200) {
                                return response;
                            }

                            // Clone and cache
                            const responseClone = response.clone();
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => cache.put(request, responseClone));

                            return response;
                        });
                })
        );
    }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data === 'getVersion') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});
