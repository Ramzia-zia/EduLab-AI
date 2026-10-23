import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createRouter } from './routes/index.js';

/** Construit l'application Express. Les dépendances sont injectées pour faciliter les tests. */
export function createApp({ config, aiProvider }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(compression()); // économise la bande passante des connexions lentes
  app.use(express.json({ limit: '256kb' }));

  app.use('/api', createRouter({ config, aiProvider }));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
