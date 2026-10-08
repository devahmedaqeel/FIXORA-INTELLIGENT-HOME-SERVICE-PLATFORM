import { env, assertServerConfig } from './config/environment.js';
import { getDb } from './config/firebase.js';
import { createApp } from './app.js';
import { logger } from './utils/logger.js';

async function start() {
  assertServerConfig();
  getDb(); // initialise Firebase Admin once at boot so misconfiguration fails fast

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`Fixora API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    logger.info(`AI chatbot provider: ${env.ai.provider}; email provider: ${env.notifications.emailProvider}; payments: ${env.payment.provider}`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => logger.error('Unhandled promise rejection', reason));

start().catch((error) => {
  logger.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
