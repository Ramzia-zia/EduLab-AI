import { createAiProvider } from './ai/index.js';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { logger } from './lib/logger.js';

const config = loadConfig();

const server = createApp({ config, aiProvider: createAiProvider(config) }).listen(config.PORT, () => {
  logger.info('server_started', { port: config.PORT, env: config.NODE_ENV, ai: config.AI_PROVIDER, model: config.AI_MODEL });
});

// Arrêt propre : on laisse les requêtes en cours se terminer.
function shutdown(signal) {
  logger.info('server_stopping', { signal });
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));