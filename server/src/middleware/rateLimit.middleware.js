import rateLimit from 'express-rate-limit';
import { env } from '../config/environment.js';
import { ERROR_CODES } from '../constants/index.js';

const handler = (_req, res) =>
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.',
    errorCode: ERROR_CODES.RATE_LIMITED,
  });

const build = (windowMs, max) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.isTest,
    handler,
  });

export const apiLimiter = build(env.rateLimit.windowMs, env.rateLimit.max);
export const authLimiter = build(15 * 60 * 1000, 30);
export const chatbotLimiter = build(60 * 1000, 20);
export const bookingLimiter = build(60 * 1000, 15);
