import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/environment.js';
import apiRoutes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin/non-browser requests (no Origin header) and configured clients.
        if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));

  if (!env.isProduction && !env.isTest) {
    app.use((req, res, next) => {
      const started = Date.now();
      res.on('finish', () => logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - started}ms`));
      next();
    });
  }

  app.get('/', (_req, res) => res.json({ success: true, message: 'Fixora API is running', data: { docs: '/docs/API.md' } }));
  app.use('/api', apiLimiter, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

export default createApp;
