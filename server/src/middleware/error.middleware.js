import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/environment.js';
import { ERROR_CODES } from '../constants/index.js';

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

/** Centralised error handler — the only place that shapes error responses. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err?.type === 'entity.parse.failed') {
    err = ApiError.badRequest('Request body is not valid JSON');
  }
  if (err?.type === 'entity.too.large') {
    err = new ApiError(413, 'Request body is too large', ERROR_CODES.VALIDATION_ERROR);
  }

  const isOperational = err instanceof ApiError;
  const statusCode = isOperational ? err.statusCode : 500;

  if (!isOperational) {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);
  }

  const body = {
    success: false,
    // Internal details never reach the client.
    message: isOperational ? err.message : 'Something went wrong. Please try again later.',
    errorCode: isOperational ? err.errorCode : ERROR_CODES.INTERNAL_ERROR,
  };
  if (isOperational && err.details) body.details = err.details;
  if (!isOperational && !env.isProduction && !env.isTest) body.debug = err?.message;

  res.status(statusCode).json(body);
}
