import { getAccessToken } from './auth.js';
import { getConfig } from './config.js';

export class ApiError extends Error {
  constructor(message, { status, code, details, cause } = {}) {
    super(message, { cause });
    this.name = 'ApiError';
    this.status = status ?? 0;
    this.code = code ?? 'UNKNOWN';
    this.details = details;
  }

  /** Vrai quand le serveur n'a pas été joint (hors ligne, délai dépassé…). */
  get isNetworkError() {
    return this.status === 0;
  }
}

/**
 * Appel authentifié vers le serveur EduLab.
 * @param {string} path  ex. "/content"
 */
export async function apiFetch(path, { method = 'GET', body, timeoutMs } = {}) {
  const config = getConfig();
  const token = await getAccessToken();
  if (!token) throw new ApiError('Tu dois te connecter.', { status: 401, code: 'AUTH_REQUIRED' });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs ?? config.requestTimeoutMs);

  try {
    const response = await fetch(`${config.apiUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(payload?.error?.message ?? `Erreur ${response.status}`, {
        status: response.status,
        code: payload?.error?.code,
        details: payload?.error?.details,
      });
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Le serveur est injoignable.', { status: 0, code: 'NETWORK', cause: error });
  } finally {
    clearTimeout(timer);
  }
}
