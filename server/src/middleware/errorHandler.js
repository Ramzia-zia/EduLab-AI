import { ZodError } from 'zod';
import { AppError } from '../lib/httpErrors.js';
import { logger, serializeError } from '../lib/logger.js';

export function notFoundHandler(_req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', 'Route inconnue.'));
}

/** Format d'erreur unique : { error: { code, message, details? } } */
// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, _next) {
  if (error instanceof ZodError) {
    return respond(res, 400, 'VALIDATION_ERROR', 'Données invalides.', formatIssues(error));
  }
  if (error instanceof AppError) {
    return respond(res, error.status, error.code, error.message, error.details);
  }
  if (error.type === 'entity.parse.failed') {
    return respond(res, 400, 'BAD_JSON', 'Le corps de la requête n\'est pas du JSON valide.');
  }
  if (error.type === 'entity.too.large') {
    return respond(res, 413, 'PAYLOAD_TOO_LARGE', 'Requête trop volumineuse.');
  }

  logger.error('unhandled_error', { path: req.path, err: serializeError(error) });
  return respond(res, 500, 'INTERNAL_ERROR', 'Erreur interne du serveur.');
}

function respond(res, status, code, message, details) {
  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}

function formatIssues(zodError) {
  return zodError.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }));
}
