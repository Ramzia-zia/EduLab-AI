/**
 * Enregistre le service worker (public/sw.js) et signale les mises à jour.
 *
 * @param {object} [options]
 * @param {string} [options.url='/sw.js']
 * @param {(applyUpdate: () => void) => void} [options.onUpdateReady]
 *        Appelé quand une nouvelle version est prête ; `applyUpdate()` l'active
 *        (puis recharger la page, par exemple sur l'événement `controllerchange`).
 */
export async function registerServiceWorker({ url = '/sw.js', onUpdateReady } = {}) {
  if (!('serviceWorker' in navigator)) return null;

  const registration = await navigator.serviceWorker.register(url);

  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      const updateReady = worker.state === 'installed' && navigator.serviceWorker.controller;
      if (updateReady) onUpdateReady?.(() => worker.postMessage({ type: 'SKIP_WAITING' }));
    });
  });
  return registration;
}
