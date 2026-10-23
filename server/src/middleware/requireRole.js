import { asyncHandler } from '../lib/asyncHandler.js';
import { unwrap } from '../lib/db.js';
import { AppError } from '../lib/httpErrors.js';

/** Autorise uniquement les rôles listés (à placer après `authenticate`). */
export function requireRole(...allowedRoles) {
  return asyncHandler(async (req, _res, next) => {
    const profile = unwrap(
      await req.auth.db.from('profiles').select('role').eq('id', req.auth.userId).single(),
    );
    if (!allowedRoles.includes(profile.role)) {
      throw new AppError(403, 'FORBIDDEN', 'Cette action n\'est pas autorisée pour ton rôle.');
    }
    next();
  });
}
