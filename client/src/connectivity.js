/**
 * `navigator.onLine` indique seulement qu'une interface réseau est active, pas
 * qu'Internet répond (cas fréquent : Wi-Fi sans accès). On s'en sert comme
 * filtre rapide ; les échecs réseau réels sont gérés par `ApiError.isNetworkError`.
 */
export function isOnline() {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

/** @returns {() => void} fonction de désabonnement */
export function onConnectivityChange(listener) {
  const notify = () => listener(isOnline());
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => {
    window.removeEventListener('online', notify);
    window.removeEventListener('offline', notify);
  };
}
