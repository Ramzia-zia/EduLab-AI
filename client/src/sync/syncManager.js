import { ApiError, apiFetch } from '../api.js';
import { getCurrentUserId, onAuthChange } from '../auth.js';
import { getConfig } from '../config.js';
import { isOnline, onConnectivityChange } from '../connectivity.js';
import { syncContent } from '../content/contentRepository.js';
import { bus, EVENTS } from '../events.js';
import {
  countPendingAttempts,
  getPendingAttempts,
  markAttempts,
  SYNC_STATE,
  toServerAttempt,
} from '../results/attemptsRepository.js';

const BATCH_SIZE = 50;
const RECORD_DEBOUNCE_MS = 500;

let status = { state: 'idle', pendingCount: 0, lastSyncAt: null, lastError: null };
const listeners = new Set();
let inFlight = null;

function setStatus(patch) {
  status = { ...status, ...patch };
  listeners.forEach((listener) => listener(status));
}

/**
 * Suit l'état de la synchronisation (pour afficher « 3 résultats à envoyer »).
 * @returns {() => void} fonction de désabonnement
 */
export function subscribeSyncStatus(listener) {
  listeners.add(listener);
  listener(status);
  return () => listeners.delete(listener);
}

/**
 * Envoie un lot. Si le serveur le refuse (400), on isole l'essai fautif pour
 * qu'un seul mauvais enregistrement ne bloque jamais tous les autres.
 */
async function pushBatch(batch) {
  try {
    await apiFetch('/sync/attempts', { method: 'POST', body: { attempts: batch.map(toServerAttempt) } });
    await markAttempts(batch, SYNC_STATE.SYNCED);
    return batch.length;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 400) throw error;
    if (batch.length === 1) {
      await markAttempts(batch, SYNC_STATE.REJECTED);
      return 0;
    }
    let sent = 0;
    for (const attempt of batch) sent += await pushBatch([attempt]);
    return sent;
  }
}

async function pushPendingAttempts(ownerId) {
  let sent = 0;
  for (;;) {
    const batch = await getPendingAttempts(ownerId, BATCH_SIZE);
    if (batch.length === 0) return sent;
    sent += await pushBatch(batch);
  }
}

async function runSync() {
  const ownerId = await getCurrentUserId();
  if (!ownerId) return { skipped: 'signed-out' };

  setStatus({ state: 'syncing', lastError: null });
  try {
    const pushed = await pushPendingAttempts(ownerId);
    const content = await syncContent();
    setStatus({
      state: 'idle',
      lastSyncAt: new Date().toISOString(),
      pendingCount: await countPendingAttempts(ownerId),
    });
    return { pushed, content };
  } catch (error) {
    setStatus({ state: 'error', lastError: error.message, pendingCount: await countPendingAttempts(ownerId) });
    return { error };
  }
}

/**
 * Lance une synchronisation (envoi des résultats, puis mise à jour du contenu).
 * Ne lève jamais d'exception : le résultat décrit ce qui s'est passé.
 * Deux appels simultanés partagent la même exécution.
 */
export function syncNow() {
  if (!isOnline()) return Promise.resolve({ skipped: 'offline' });
  inFlight ??= runSync().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

let stopCurrent = null;

/**
 * Synchronise automatiquement : au démarrage, au retour du réseau, après la
 * connexion, peu après chaque essai enregistré, puis à intervalle régulier.
 * @returns {() => void} fonction d'arrêt (idempotente)
 */
export function startAutoSync() {
  if (stopCurrent) return stopCurrent;

  const trigger = () => void syncNow();
  let debounceTimer = null;
  const onAttemptRecorded = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(trigger, RECORD_DEBOUNCE_MS);
  };

  bus.addEventListener(EVENTS.ATTEMPT_RECORDED, onAttemptRecorded);
  const stopConnectivity = onConnectivityChange((online) => online && trigger());
  // setTimeout : évite d'appeler Supabase à l'intérieur de son propre callback d'authentification.
  const stopAuth = onAuthChange((event) => event === 'SIGNED_IN' && setTimeout(trigger, 0));
  const interval = setInterval(trigger, getConfig().syncIntervalMs);
  trigger();

  stopCurrent = () => {
    clearTimeout(debounceTimer);
    clearInterval(interval);
    bus.removeEventListener(EVENTS.ATTEMPT_RECORDED, onAttemptRecorded);
    stopConnectivity();
    stopAuth();
    stopCurrent = null;
  };
  return stopCurrent;
}
