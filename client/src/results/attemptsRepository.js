import { getCurrentUserId } from '../auth.js';
import { bus, EVENTS } from '../events.js';
import { countByIndex, getAllByIndex, get, put, STORES } from '../storage/idb.js';

/** État de synchronisation d'un essai (nombres : voir idb.js). */
export const SYNC_STATE = Object.freeze({ PENDING: 0, SYNCED: 1, REJECTED: 2 });

const round2 = (value) => Math.round(value * 100) / 100;

async function requireUserId() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Aucun utilisateur connecté : impossible d\'enregistrer un résultat.');
  return userId;
}

/**
 * Enregistre un essai localement (immédiat, même hors ligne) puis demande une
 * synchronisation. Fournir `exerciseId` ou `simulationId` (ou les deux).
 *
 * @param {object} input
 * @param {string} [input.exerciseId]
 * @param {string} [input.simulationId]
 * @param {number} input.score              de 0 à 100
 * @param {number} [input.durationSeconds]
 * @param {object} [input.payload]          paramètres/mesures propres à la simulation
 */
export async function recordAttempt({ exerciseId, simulationId, score, durationSeconds, payload = {} }) {
  if (!exerciseId && !simulationId) throw new Error('recordAttempt : exerciseId ou simulationId est requis.');
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError('recordAttempt : le score doit être compris entre 0 et 100.');
  }

  const attempt = {
    id: crypto.randomUUID(),
    owner_id: await requireUserId(),
    exercise_id: exerciseId ?? null,
    simulation_id: simulationId ?? null,
    score: round2(score),
    duration_seconds: durationSeconds === undefined ? null : Math.round(durationSeconds),
    payload,
    completed_at: new Date().toISOString(),
    synced: SYNC_STATE.PENDING,
  };

  await put(STORES.ATTEMPTS, attempt);
  bus.dispatchEvent(new Event(EVENTS.ATTEMPT_RECORDED));
  return attempt;
}

/** Essais en attente d'envoi pour l'utilisateur donné (les plus anciens d'abord). */
export async function getPendingAttempts(ownerId, limit) {
  const pending = await getAllByIndex(STORES.ATTEMPTS, 'owner_synced', [ownerId, SYNC_STATE.PENDING]);
  pending.sort((a, b) => a.completed_at.localeCompare(b.completed_at));
  return limit ? pending.slice(0, limit) : pending;
}

export function countPendingAttempts(ownerId) {
  return countByIndex(STORES.ATTEMPTS, 'owner_synced', [ownerId, SYNC_STATE.PENDING]);
}

export async function markAttempts(attempts, state) {
  for (const { id } of attempts) {
    const stored = await get(STORES.ATTEMPTS, id);
    if (stored) await put(STORES.ATTEMPTS, { ...stored, synced: state });
  }
}

/** Historique de l'utilisateur connecté, du plus récent au plus ancien. */
export async function getAttemptHistory({ exerciseId, simulationId } = {}) {
  const userId = await requireUserId();
  const attempts = await getAllByIndex(STORES.ATTEMPTS, 'owner_id', userId);
  return attempts
    .filter((a) => (exerciseId ? a.exercise_id === exerciseId : true))
    .filter((a) => (simulationId ? a.simulation_id === simulationId : true))
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
}

/** Résumé pur, testable sans base de données. */
export function summarizeAttempts(attempts) {
  if (attempts.length === 0) return { attemptsCount: 0, activitiesDone: 0, averageScore: null };
  const activities = new Set(attempts.map((a) => a.exercise_id ?? a.simulation_id));
  const total = attempts.reduce((sum, a) => sum + a.score, 0);
  return {
    attemptsCount: attempts.length,
    activitiesDone: activities.size,
    averageScore: Math.round((total / attempts.length) * 10) / 10,
  };
}

/** Progression affichée dans le tableau de bord élève (fonctionne hors ligne). */
export async function getProgressSummary() {
  return summarizeAttempts(await getAttemptHistory());
}

/** Format attendu par POST /api/sync/attempts (retire les champs purement locaux). */
export function toServerAttempt({ owner_id: _owner, synced: _synced, ...serverFields }) {
  return serverFields;
}
