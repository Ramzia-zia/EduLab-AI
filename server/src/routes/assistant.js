import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { asyncHandler } from '../lib/asyncHandler.js';
import { AppError } from '../lib/httpErrors.js';
import { assistantRequestSchema } from '../schemas/assistant.js';
import { generateAssistantReply } from '../services/assistantService.js';

export function assistantRoutes({ config, aiProvider }) {
  const router = Router();

  // Limite par élève (et non par adresse IP : beaucoup d'élèves partagent le Wi-Fi de l'école).
  const limiter = rateLimit({
    windowMs: 60_000,
    limit: config.AI_RATE_LIMIT_PER_MINUTE,
    keyGenerator: (req) => req.auth.userId,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, _res, next) =>
      next(new AppError(429, 'RATE_LIMITED', 'Trop de questions d\'un coup. Attends une minute avant de réessayer.')),
  });

  router.post(
    '/',
    limiter,
    asyncHandler(async (req, res) => {
      const input = assistantRequestSchema.parse(req.body);
      const answer = await generateAssistantReply({ db: req.auth.db, provider: aiProvider, input });
      res.json({ answer });
    }),
  );

  return router;
}
