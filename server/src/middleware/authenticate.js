import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/httpErrors.js';
import { createUserClient } from '../lib/supabase.js';

/**
 * Vérifie le jeton Supabase (en-tête `Authorization: Bearer <jwt>`).
 * Ajoute à la requête : `req.auth = { userId, db }`, où `db` est un client
 * Supabase soumis aux règles RLS de cet utilisateur.
 */
export function authenticate(config) {
  return asyncHandler(async (req, _res, next) => {
    const [scheme, token] = (req.get('authorization') ?? '').split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new AppError(401, 'AUTH_REQUIRED', 'Authentification requise.');
    }

    const db = createUserClient(config, token);
    const { data, error } = await db.auth.getUser(token);
    if (error || !data.user) {
      throw new AppError(401, 'AUTH_INVALID', 'Session invalide ou expirée.');
    }

    req.auth = { userId: data.user.id, db };
    next();
  });
}
