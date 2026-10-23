import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { assistantRoutes } from './assistant.js';
import { classesRoutes } from './classes.js';
import { contentRoutes } from './content.js';
import { healthRoutes } from './health.js';
import { syncRoutes } from './sync.js';

export function createRouter({ config, aiProvider }) {
  const router = Router();

  router.use('/health', healthRoutes());

  // Tout ce qui suit exige un utilisateur connecté.
  router.use(authenticate(config));
  router.use('/content', contentRoutes());
  router.use('/sync', syncRoutes());
  router.use('/classes', classesRoutes());
  router.use('/assistant', assistantRoutes({ config, aiProvider }));

  return router;
}
