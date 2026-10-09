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

  // Without this, a port conflict crashes as an unhandled 'error' event with a raw Node
  // stack trace, and under `node --watch` leaves the process hung ("waiting for file
  // changes") with no indication a second instance is already running on this port.
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(
        `Port ${env.port} is already in use — another instance of this server (or something else) is already running. ` +
          `Stop it first, e.g. on Windows: netstat -ano | findstr :${env.port}  then  taskkill /PID <pid> /F`,
      );
      process.exit(1);
    }
    logger.error(`Server failed to start: ${error.message}`);
    process.exit(1);
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
