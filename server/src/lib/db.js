import { AppError } from './httpErrors.js';
import { logger } from './logger.js';

// Codes PostgreSQL / PostgREST que l'on sait traduire en réponse HTTP claire.
const KNOWN_ERRORS = {
  '28000': [401, 'AUTH_REQUIRED'],
  '42501': [403, 'FORBIDDEN'],
  P0002: [404, 'NOT_FOUND'],
  '23505': [409, 'CONFLICT'],
  '23503': [400, 'BAD_REFERENCE'],
  '22P02': [400, 'BAD_REQUEST'],
};

function toAppError(error) {
  const known = KNOWN_ERRORS[error.code];
  if (known) return new AppError(known[0], known[1], error.message);

  logger.error('database_error', { code: error.code, message: error.message });
  return new AppError(500, 'DATABASE_ERROR', 'Erreur interne. Réessaie plus tard.');
}

/** Extrait `data` d'une réponse Supabase ou lève une AppError. */
export function unwrap({ data, error }) {
  if (error) throw toAppError(error);
  return data;
}
