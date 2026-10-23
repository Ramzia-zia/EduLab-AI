import { Router } from 'express';
import { asyncHandler } from '../lib/asyncHandler.js';
import { getContentPack, getContentVersion } from '../services/contentService.js';

export function contentRoutes() {
  const router = Router();

  // Léger : permet au client de savoir s'il doit retélécharger le contenu.
  router.get(
    '/version',
    asyncHandler(async (req, res) => {
      res.json({ version: await getContentVersion(req.auth.db) });
    }),
  );

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      res.json(await getContentPack(req.auth.db));
    }),
  );

  return router;
}
