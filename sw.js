// Service worker MINIMAL (structure PWA). Il met en cache les fichiers statiques du site déjà visités
// (pages, styles, scripts, images) pour accélérer et permettre le CHARGEMENT de l'interface avec une
// connexion faible. Il ne touche pas aux requêtes de l'API (autre origine).
// ⚠ Cela ne veut PAS dire que tout fonctionne hors ligne : les simulations, les données et la
// synchronisation après retour de la connexion restent à développer et à tester (voir docs/STATUT.md).
const CACHE = 'edulab-static-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// Stratégie : réponse du réseau d'abord (contenu à jour), cache en secours si le réseau échoue.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => { const copy = response.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); return response; })
      .catch(() => caches.match(request).then((hit) => hit ?? caches.match('./index.html'))),
  );
});
