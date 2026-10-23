import { buildSystemPrompt, toProviderMessages } from '../ai/prompts.js';
import { unwrap } from '../lib/db.js';
import { AppError, notFoundError } from '../lib/httpErrors.js';
import { logger, serializeError } from '../lib/logger.js';

/**
 * L'énoncé de l'exercice est relu en base (avec les droits de l'élève) :
 * le client ne peut ni inventer un contexte, ni accéder à un contenu non publié.
 * La clé de correction n'est volontairement jamais transmise à l'IA.
 */
async function fetchOne(db, table, columns, id, label) {
  const row = unwrap(await db.from(table).select(columns).eq('id', id).maybeSingle());
  if (!row) throw notFoundError(label);
  return row;
}

async function loadContext(db, { exercise_id: exerciseId, simulation_id: simulationId }) {
  const [exercise, simulation] = await Promise.all([
    exerciseId ? fetchOne(db, 'exercises', 'title, statement, kind, options', exerciseId, 'Exercice') : null,
    simulationId ? fetchOne(db, 'simulations', 'title, description', simulationId, 'Simulation') : null,
  ]);
  return { exercise, simulation };
}

export async function generateAssistantReply({ db, provider, input }) {
  const context = await loadContext(db, input);
  const system = buildSystemPrompt({ context, hintLevel: input.hint_level });
  const messages = toProviderMessages(input.history, input.message);

  try {
    const answer = await provider.complete({ system, messages });
    if (!answer) throw new Error('Réponse vide du fournisseur d\'IA.');
    return answer;
  } catch (error) {
    logger.error('ai_provider_failed', { err: serializeError(error) });
    throw new AppError(502, 'AI_UNAVAILABLE', 'L\'assistant est momentanément indisponible. Réessaie dans un instant.');
  }
}
