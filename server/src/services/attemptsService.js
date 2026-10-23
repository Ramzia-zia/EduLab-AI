import { unwrap } from '../lib/db.js';

/**
 * Enregistre un lot d'essais. L'opération est idempotente : un essai déjà reçu
 * (même `id`) est ignoré, ce qui permet au client de renvoyer un lot sans risque
 * si la réponse s'est perdue. `student_id` est imposé par la base (auth.uid()).
 */
export async function saveAttempts(db, userId, attempts) {
  const rows = attempts.map((attempt) => ({
    ...attempt,
    exercise_id: attempt.exercise_id ?? null,
    simulation_id: attempt.simulation_id ?? null,
    duration_seconds: attempt.duration_seconds ?? null,
    student_id: userId,
  }));

  unwrap(await db.from('attempts').upsert(rows, { onConflict: 'id', ignoreDuplicates: true }));
  return attempts.map((attempt) => attempt.id);
}
