import { ApiError, apiFetch } from '../api.js';
import { isOnline } from '../connectivity.js';
import { getAll, STORES } from '../storage/idb.js';
import { findBestAnswer } from './offlineAssistant.js';

const ONLINE_TIMEOUT_MS = 25_000;
const NO_OFFLINE_ANSWER =
  'Je n\'ai pas de réponse hors ligne à cette question. Essaie de relire ton cours, demande à ton professeur, ou repose-moi la question quand tu auras une connexion.';

/** Le serveur d'IA est injoignable ou en panne : on peut se rabattre sur la FAQ locale. */
const isRecoverable = (error) => error instanceof ApiError && (error.isNetworkError || error.status >= 500);

async function answerOffline(message) {
  const match = findBestAnswer(message, await getAll(STORES.FAQ));
  return match
    ? { answer: match.answer, source: 'offline' }
    : { answer: NO_OFFLINE_ANSWER, source: 'offline-no-match' };
}

/**
 * Pose une question à l'assistant.
 *
 * `source` indique d'où vient la réponse :
 *   - "online"           : assistant complet (IA)
 *   - "offline"          : réponse de la FAQ locale
 *   - "offline-no-match" : aucune réponse locale trouvée
 *
 * Les erreurs « normales » (limite atteinte, session expirée…) sont relancées
 * telles quelles pour que l'interface affiche leur message.
 *
 * @param {object} request
 * @param {string} request.message
 * @param {string} [request.exerciseId]
 * @param {string} [request.simulationId]
 * @param {1|2|3}  [request.hintLevel=1]
 * @param {{role: 'student'|'assistant', content: string}[]} [request.history]
 */
export async function askAssistant({ message, exerciseId, simulationId, hintLevel = 1, history = [] }) {
  if (isOnline()) {
    try {
      const { answer } = await apiFetch('/assistant', {
        method: 'POST',
        timeoutMs: ONLINE_TIMEOUT_MS,
        body: {
          message,
          hint_level: hintLevel,
          exercise_id: exerciseId,
          simulation_id: simulationId,
          history: history.slice(-6),
        },
      });
      return { answer, source: 'online' };
    } catch (error) {
      if (!isRecoverable(error)) throw error;
    }
  }
  return answerOffline(message);
}
