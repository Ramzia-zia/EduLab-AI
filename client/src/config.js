let current = null;

/**
 * À appeler une seule fois au démarrage de l'application.
 *
 * @param {object} options
 * @param {string} options.apiUrl           URL du serveur, ex. "http://localhost:3000/api"
 * @param {string} options.supabaseUrl
 * @param {string} options.supabaseAnonKey
 * @param {number} [options.requestTimeoutMs=15000]
 * @param {number} [options.syncIntervalMs=60000]
 */
export function configureEduLab(options) {
  const { apiUrl, supabaseUrl, supabaseAnonKey } = options;
  if (!apiUrl || !supabaseUrl || !supabaseAnonKey) {
    throw new Error('configureEduLab : apiUrl, supabaseUrl et supabaseAnonKey sont obligatoires.');
  }
  current = Object.freeze({
    requestTimeoutMs: 15_000,
    syncIntervalMs: 60_000,
    ...options,
    apiUrl: apiUrl.replace(/\/+$/, ''),
  });
}

export function getConfig() {
  if (!current) throw new Error('EduLab n\'est pas configuré : appelle configureEduLab() au démarrage.');
  return current;
}
