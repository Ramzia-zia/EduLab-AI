/* Service worker EduLab AI — fonctionnement hors ligne de l'application.
 *
 * Stratégies :
 *  - Navigation (pages)         : réseau d'abord (délai court), sinon copie en cache.
 *  - Fichiers statiques locaux  : cache d'abord, mise à jour en arrière-plan.
 *  - /api/* et autres domaines  : jamais interceptés (Supabase, serveur EduLab).
 *    Les données hors ligne vivent dans IndexedDB, pas dans ce cache.
 *
 * Pour publier une nouvelle version du service worker : changer VERSION.
 */
const VERSION = 'v1';
const SHELL_CACHE = `edulab-shell-${VERSION}`;
const ASSET_CACHE = `edulab-assets-${VERSION}`;
const SHELL_URLS = ['/', '/index.html', '/offline.html', '/manifest.webmanifest'];
const NAVIGATION_TIMEOUT_MS = 4000;
const STATIC_DESTINATIONS = new Set(['script', 'style', 'image', 'font', 'worker']);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)));
});

self.addEventListener('activate', (event) => {
  const currentCaches = new Set([SHELL_CACHE, ASSET_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => !currentCaches.has(name)).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

// L'application décide quand activer une nouvelle version (voir registerServiceWorker).
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
  } else if (STATIC_DESTINATIONS.has(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function handleNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetchWithTimeout(request, NAVIGATION_TIMEOUT_MS);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return (
      (await cache.match(request)) ??
      (await cache.match('/index.html')) ?? // application monopage : le routeur gère l'URL
      (await cache.match('/offline.html')) ??
      Response.error()
    );
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    refresh.catch(() => {}); // mise à jour silencieuse
    return cached;
  }
  return (await refresh) ?? Response.error();
}

function fetchWithTimeout(request, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}
