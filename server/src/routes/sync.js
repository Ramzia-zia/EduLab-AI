import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { syncAttemptsBodySchema } from '../schemas/attempts.js';
import { saveAttempts } from '../services/attemptsService.js';

export function syncRoutes() {
  const router = Router();

  router.post(
    '/attempts',
    asyncHandler(async (req, res) => {
      const { attempts } = syncAttemptsBodySchema.parse(req.body);
      const accepted = await saveAttempts(req.auth.db, req.auth.userId, attempts);
      res.json({ accepted });
    }),
  );

  return router;
}
